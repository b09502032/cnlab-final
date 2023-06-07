import * as chinchou from "../../src/chinchou";
import * as common from "../../src/virizion/common";
import * as morelull from "../../src/virizion/morelull";

const mainClient = chinchou.createDefaultMainClient();
const currentUser = new common.CurrentUser(mainClient);

const context = common.common(
  [
    new common.Form({
      buttonText: "註冊",
      buttonClick: async (username, password) => {
        let ok = true;
        try {
          await mainClient.createUser(username, password);
        } catch (error) {
          ok = false;
          console.error(error);
        }
        return [
          new morelull.Text({
            data: ok ? "註冊成功" : "註冊失敗",
          }),
        ];
      },
    }),
  ],
  currentUser
);

await currentUser.data(context);
