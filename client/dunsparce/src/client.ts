import { z } from "zod";

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

async function responseSchema<Output>(
  response: Response,
  schema: z.ZodType<Output>
) {
  check(response);
  const data = await json(response);
  return schema.parse(data);
}

function ws(url: URL) {
  url.protocol = "ws:";
  return url;
}

export class Client {
  constructor(public base: URL) {}

  async isLoggedIn() {
    const response = await fetch(new URL("is_logged_in", this.base));
    return await responseSchema(response, z.boolean());
  }

  async currentuser() {
    const response = await fetch(new URL("current_user", this.base));
    return await responseSchema(response, z.union([z.number(), z.null()]));
  }

  async createUser(username: string, password: string) {
    const response = await fetch(
      jsonRequest(new URL("users", this.base), "POST", {
        username: username,
        password: password,
      })
    );
    await responseSchema(response, z.null());
  }

  async login(username: string, password: string) {
    const response = await fetch(
      jsonRequest(new URL("login", this.base), "POST", {
        username: username,
        password: password,
      })
    );
    await responseSchema(response, z.null());
  }

  async logout() {
    const response = await fetch(new URL("logout", this.base), {
      method: "POST",
    });
    await responseSchema(response, z.null());
  }

  async createReversi() {
    const response = await fetch(new URL("reversi", this.base), {
      method: "POST",
    });
    return await responseSchema(response, z.number());
  }

  async listReversi() {
    const response = await fetch(new URL("reversi", this.base));
    return await responseSchema(response, z.array(z.number()));
  }

  enterReversi(id: number) {
    return new WebSocket(ws(new URL(`reversi/ws/${id}`, this.base)));
  }

  async getUsername(id: number) {
    const response = await fetch(new URL(`users/username/${id}`, this.base));
    return await responseSchema(response, z.string());
  }
}

export function defaultClient() {
  return new Client(new URL("/api/", window.location.origin));
}
