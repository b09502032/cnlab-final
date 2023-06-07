import * as utils from "./utils";

class Lopunny extends Error {}

function check(response: Response) {
  if (!response.ok) {
    throw new Lopunny();
  }
}

async function json(response: Response) {
  const result: unknown = await response.json();
  return result;
}

function jsonRequest(url: URL, method: string, body: unknown) {
  return new Request(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

class UamClient {
  constructor(public base: URL) {}

  async loginUrl(url: string, username: string, password: string) {
    const response = await fetch(
      jsonRequest(new URL("login_url", this.base), "POST", {
        url: url,
        username: username,
        password: password,
      })
    );
    check(response);
    const data = await json(response);
    return utils.assertString(data);
  }

  async check(url: string) {
    const response = await fetch(
      jsonRequest(new URL("check", this.base), "POST", { url: url })
    );
    check(response);
    await json(response);
  }

  async result() {
    const response = await fetch(new URL("result", this.base));
    check(response);
    const data = await json(response);
    if (data === null) {
      return null;
    }
    const record = utils.assertRecord(data);
    const result: [string, string] = [
      utils.assertString(record["uam_ip"]),
      utils.assertString(record["uam_port"]),
    ];
    return result;
  }
}

export function createDefaultUamClient() {
  return new UamClient(new URL("/api/uam/", window.location.origin));
}

export interface radacct {
  radacctid: number;
  acctsessionid: string;
  acctuniqueid: string;
  username: string;
  nasipaddress: string;
  acctstarttime: string | null;
  acctupdatetime: string | null;
  acctstoptime: string | null;
  acctsessiontime: number | null;
  acctinputoctets: number | null;
  acctoutputoctets: number | null;
  acctterminatecause: string;
}

function recordToRadacct(o: Record<string, unknown>) {
  if (
    !utils.setEquals(
      new Set(Object.keys(o)),
      new Set([
        "radacctid",
        "acctsessionid",
        "acctuniqueid",
        "username",
        "nasipaddress",
        "acctstarttime",
        "acctupdatetime",
        "acctstoptime",
        "acctsessiontime",
        "acctinputoctets",
        "acctoutputoctets",
        "acctterminatecause",
      ])
    )
  ) {
    throw new Lopunny();
  }
  const result: radacct = {
    radacctid: utils.assertNumber(o["radacctid"]),
    acctsessionid: utils.assertString(o["acctsessionid"]),
    acctuniqueid: utils.assertString(o["acctuniqueid"]),
    username: utils.assertString(o["username"]),
    nasipaddress: utils.assertString(o["nasipaddress"]),
    acctstarttime: utils.assertStringOrNull(o["acctstarttime"]),
    acctupdatetime: utils.assertStringOrNull(o["acctupdatetime"]),
    acctstoptime: utils.assertStringOrNull(o["acctstoptime"]),
    acctsessiontime: utils.assertNumberOrNull(o["acctsessiontime"]),
    acctinputoctets: utils.assertNumberOrNull(o["acctinputoctets"]),
    acctoutputoctets: utils.assertNumberOrNull(o["acctoutputoctets"]),
    acctterminatecause: utils.assertString(o["acctterminatecause"]),
  };
  return result;
}

export interface UserInfo {
  username: string;
  allSession: number;
  allTotalOctets: number;
  maxAllSession: number | null;
  maxAllTotalOctets: number | null;
}

function recordToUserInfo(o: Record<string, unknown>) {
  if (
    !utils.setEquals(
      new Set(Object.keys(o)),
      new Set([
        "username",
        "all_session",
        "all_total_octets",
        "max_all_session",
        "max_all_total_octets",
      ])
    )
  ) {
    throw new Lopunny();
  }
  const result: UserInfo = {
    username: utils.assertString(o["username"]),
    allSession: utils.assertNumber(o["all_session"]),
    allTotalOctets: utils.assertNumber(o["all_total_octets"]),
    maxAllSession: utils.assertNumberOrNull(o["max_all_session"]),
    maxAllTotalOctets: utils.assertNumberOrNull(o["max_all_total_octets"]),
  };
  return result;
}

export class MainClient {
  constructor(public base: URL) {}

  async createUser(username: string, password: string) {
    const response = await fetch(
      jsonRequest(new URL("users", this.base), "POST", {
        username: username,
        password: password,
      })
    );
    check(response);
    const data = await json(response);
    if (data !== null) {
      throw new Lopunny();
    }
  }

  async login(username: string, password: string) {
    const response = await fetch(
      jsonRequest(new URL("login", this.base), "POST", {
        username: username,
        password: password,
      })
    );
    check(response);
    const data = await json(response);
    if (typeof data === "boolean") {
      return data;
    }
    throw new Lopunny();
  }

  async logout() {
    const response = await fetch(new URL("logout", this.base), {
      method: "POST",
    });
    check(response);
    const data = await json(response);
    if (data !== null) {
      throw new Lopunny();
    }
  }

  async *accounting(username: string | null) {
    const url = new URL("accounting", this.base);
    if (username !== null) {
      url.searchParams.append("username", username);
    }
    const response = await fetch(url);
    check(response);
    const data = utils.assertArray(await json(response));
    for (const item of data) {
      yield recordToRadacct(utils.assertRecord(item));
    }
  }

  async currentUser() {
    const response = await fetch(new URL("current_user", this.base));
    check(response);
    const data = await json(response);
    if (typeof data === "string") {
      return data;
    }
    if (data === null) {
      return null;
    }
    throw new Lopunny();
  }

  async getUserInfo(username: string) {
    const url = new URL("user_info", this.base);
    url.searchParams.append("username", username);
    const response = await fetch(url);
    check(response);
    return recordToUserInfo(utils.assertRecord(await json(response)));
  }

  async setUserInfo(
    username: string,
    maxAllSession: string,
    maxAllTotalOctets: string
  ) {
    const response = await fetch(
      jsonRequest(new URL("user_info", this.base), "PUT", {
        username: username,
        max_all_session: maxAllSession,
        max_all_total_octets: maxAllTotalOctets,
      })
    );
    check(response);
    const data = await json(response);
    if (data !== null) {
      throw new Lopunny();
    }
  }

  async *listUsers() {
    const response = await fetch(new URL("users", this.base));
    check(response);
    const data = utils.assertArray(await json(response));
    for (const item of data) {
      yield utils.assertString(item);
    }
  }

  async disconnect(username: string) {
    const response = await fetch(
      jsonRequest(new URL("disconnect", this.base), "POST", {
        username: username,
      })
    );
    check(response);
    await json(response);
  }

  async coa(username: string) {
    const response = await fetch(
      jsonRequest(new URL("coa", this.base), "POST", {
        username: username,
      })
    );
    check(response);
    await json(response);
  }
}

export function createDefaultMainClient() {
  return new MainClient(new URL("/api/", window.location.origin));
}
