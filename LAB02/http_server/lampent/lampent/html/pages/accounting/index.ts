import * as chinchou from "../../src/chinchou";
import * as utils from "../../src/utils";
import * as bulma from "../../src/virizion/bulma";
import * as common from "../../src/virizion/common";
import * as morelull from "../../src/virizion/morelull";
import * as virizion from "../../src/virizion/virizion";

class Table extends virizion.Beedrill {
  client: chinchou.MainClient;
  items: chinchou.radacct[] = [];

  constructor(o: { client: chinchou.MainClient }) {
    super();
    this.client = o.client;
  }

  async data(context: virizion.Context, username: string | null) {
    this.items = await utils.asyncGeneratorToArray(
      this.client.accounting(username)
    );
    context.chimchar(this, this);
  }

  *rows() {
    for (const item of this.items) {
      yield this.itemToRow(item);
    }
  }

  itemToRow(item: chinchou.radacct) {
    const userURL = new URL("/user/", window.location.origin);
    userURL.searchParams.append("username", item.username);
    return new morelull.TableRow({
      children: [
        this.cell(item.radacctid),
        this.cell(item.acctsessionid),
        this.cell(item.acctuniqueid),
        new morelull.TableDataCell({
          children: [
            new morelull.Anchor({
              children: [new morelull.Text({ data: item.username })],
              href: userURL.href,
            }),
          ],
        }),
        this.cell(item.nasipaddress),
        this.cell(item.acctstarttime),
        this.cell(item.acctupdatetime),
        this.cell(item.acctstoptime),
        this.cell(item.acctsessiontime),
        this.cell(item.acctinputoctets),
        this.cell(item.acctoutputoctets),
        this.cell(item.acctterminatecause),
      ],
    });
  }

  top() {
    const children = [];
    for (const data of [
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
    ]) {
      children.push(
        new morelull.TableHeader({
          children: [new morelull.Text({ data: data })],
        })
      );
    }
    return new morelull.TableHead({
      children: [new morelull.TableRow({ children: children })],
    });
  }

  cell(value: number | string | null) {
    if (value === null) {
      value = "";
    }
    return new morelull.TableDataCell({
      children: [new morelull.Text({ data: value.toString() })],
    });
  }

  build() {
    const children = [...this.rows()];
    if (children.length === 0) {
      return new common.MentoriEarth();
    }
    return new bulma.Table({
      top: this.top(),
      content: new morelull.TableBody({ children: children }),
    });
  }
}

const mainClient = chinchou.createDefaultMainClient();
const currentUser = new common.CurrentUser(mainClient);

const table = new Table({ client: mainClient });

const context = common.common(
  [
    new bulma.TableContainer({
      children: [table],
    }),
  ],
  currentUser
);

await table.data(context, null);

await currentUser.data(context);
