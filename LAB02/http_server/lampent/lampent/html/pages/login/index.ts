import * as chinchou from "../../src/chinchou";
import * as common from "../../src/virizion/common";
import * as morelull from "../../src/virizion/morelull";

const mainClient = chinchou.createDefaultMainClient();
const currentUser = new common.CurrentUser(mainClient);

const context = common.common(
  [
    new common.Form({
      buttonText: "登入",
      buttonClick: async (username, password, context) => {
        let ok = true;
        try {
          ok = await mainClient.login(username, password);
          try {
            await currentUser.data(context);
          } catch (error) {
            console.log(error);
          }
        } catch (error) {
          ok = false;
          console.error(error);
        }
        return [
          new morelull.Text({
            data: ok ? "登入成功" : "登入失敗",
          }),
        ];
      },
    }),
  ],
  currentUser
);

await currentUser.data(context);
