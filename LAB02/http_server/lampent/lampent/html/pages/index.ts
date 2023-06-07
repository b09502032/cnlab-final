import * as chinchou from "../src/chinchou";
import * as common from "../src/virizion/common";
import * as morelull from "../src/virizion/morelull";

const mainClient = chinchou.createDefaultMainClient();
const currentUser = new common.CurrentUser(mainClient);
const context = common.common(
  [
    new morelull.Image({
      src: "/images/53584244_2313969792172514_4623440313124388864_n.webp",
    }),
  ],
  currentUser
);
await currentUser.data(context);
