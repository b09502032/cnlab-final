import * as chinchou from "../../src/chinchou";
import * as bulma from "../../src/virizion/bulma";
import * as common from "../../src/virizion/common";
import * as morelull from "../../src/virizion/morelull";

const mainClient = chinchou.createDefaultMainClient();
const currentUser = new common.CurrentUser(mainClient);

let ok = true;
let children = [];
try {
  for await (const username of mainClient.listUsers()) {
    const url = new URL("/user/", window.location.origin);
    url.searchParams.append("username", username);
    children.push(
      new bulma.Block({
        children: [
          new morelull.Anchor({
            href: url.href,
            children: [new bulma.Tag([new morelull.Text({ data: username })])],
          }),
        ],
      })
    );
  }
} catch (error) {
  ok = false;
  console.error(error);
}
if (!ok) {
  children = [new common.MentoriEarth()];
}

const context = common.common(children, currentUser);
await currentUser.data(context);
