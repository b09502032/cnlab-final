import * as chinchou from "../../src/chinchou";
import * as common from "../../src/virizion/common";
import * as morelull from "../../src/virizion/morelull";

const params = new URLSearchParams(window.location.search);

const uamClient = chinchou.createDefaultUamClient();

const form = new common.Form({
  buttonText: "登入 Wi-Fi",
  buttonClick: async (username, password) => {
    try {
      const loginUrl = await uamClient.loginUrl(
        window.location.href,
        username,
        password
      );
      window.location.href = loginUrl;
      return [
        new morelull.Text({
          data: "登入 Wi-Fi 中",
        }),
      ];
    } catch (error) {
      console.error(error);
    }
    return [
      new morelull.Text({
        data: "登入 Wi-Fi 失敗",
      }),
    ];
  },
});

const mainClient = chinchou.createDefaultMainClient();
const currentUser = new common.CurrentUser(mainClient);

const context = common.common([form], currentUser);

form.addNotification(
  context,
  form.createNotification([
    new morelull.PreformattedText({
      children: [
        new morelull.Text({
          data: JSON.stringify([...params.entries()]),
        }),
      ],
      classes: ["pre"],
    }),
  ])
);

const result = params.get("res");

if (!(result === "notyet" || result === "failed" || result === "logoff")) {
  form.hidden = true;
  context.chimchar(form, form);
}

let ok = true;
try {
  await uamClient.check(window.location.href);
} catch (error) {
  ok = false;
  console.error(error);
}

function dragonite(text: [string, string]) {
  form.addNotification(
    context,
    form.createNotification([
      new morelull.Text({ data: ok ? text[0] : text[1] }),
    ])
  );
}

if (result === "success" || result === "already") {
  dragonite(["登入 Wi-Fi 成功", "登入 Wi-Fi 失敗"]);
} else if (result === "logoff") {
  dragonite(["登出 Wi-Fi 成功", "登出 Wi-Fi 失敗"]);
} else if (result === "failed") {
  dragonite(["登入 Wi-Fi 失敗", "登入 Wi-Fi 失敗"]);
}

await currentUser.data(context);
