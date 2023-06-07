import * as chinchou from "../../src/chinchou";
import * as bulma from "../../src/virizion/bulma";
import * as common from "../../src/virizion/common";
import * as morelull from "../../src/virizion/morelull";
import * as virizion from "../../src/virizion/virizion";

class UserInfo extends virizion.Beedrill {
  username: string;
  admin: boolean;
  client: chinchou.MainClient;
  info: chinchou.UserInfo | null = null;

  constructor(o: {
    username: string;
    admin: boolean;
    client: chinchou.MainClient;
  }) {
    super();
    this.username = o.username;
    this.admin = o.admin;
    this.client = o.client;
  }

  async data(context: virizion.Context) {
    this.info = await this.client.getUserInfo(this.username);
    context.chimchar(this, this);
  }

  build(context: virizion.Context) {
    if (this.info === null) {
      return new common.Mentori();
    }
    const children = [
      new bulma.HorizontalField({
        label: new bulma.FieldLabel({}),
        body: new bulma.FieldBody({
          children: [new bulma.Image([new common.MentoriMentori()])],
        }),
      }),
      new bulma.HorizontalField({
        label: new bulma.FieldLabel({
          label: new bulma.Label({
            children: [new morelull.Text({ data: "username" })],
          }),
        }),
        body: new bulma.FieldBody({
          children: [new morelull.Text({ data: this.info.username })],
        }),
      }),
      new bulma.HorizontalField({
        label: new bulma.FieldLabel({
          label: new bulma.Label({
            children: [new morelull.Text({ data: "已使用時間" })],
          }),
        }),
        body: new bulma.FieldBody({
          children: [
            new morelull.Text({ data: this.info.allSession.toString() }),
          ],
        }),
      }),
      new bulma.HorizontalField({
        label: new bulma.FieldLabel({
          label: new bulma.Label({
            children: [new morelull.Text({ data: "已使用流量" })],
          }),
        }),
        body: new bulma.FieldBody({
          children: [
            new morelull.Text({ data: this.info.allTotalOctets.toString() }),
          ],
        }),
      }),
    ];
    const maxAllSessionChildren = [];
    const maxAllTotalOctetsChildren = [];
    let button;
    if (this.admin) {
      const maxAllSessionInput = new bulma.Input({
        type: "text",
        value: this.info.maxAllSession?.toString() ?? "",
      });
      const maxAllTotalOctetsInput = new bulma.Input({
        type: "text",
        value: this.info.maxAllTotalOctets?.toString() ?? "",
      });
      maxAllSessionChildren.push(
        new bulma.Field({
          controls: [
            new bulma.Control({
              children: [maxAllSessionInput],
            }),
          ],
        })
      );
      maxAllTotalOctetsChildren.push(
        new bulma.Field({
          controls: [
            new bulma.Control({
              children: [maxAllTotalOctetsInput],
            }),
          ],
        })
      );
      button = new bulma.HorizontalField({
        label: new bulma.FieldLabel({}),
        body: new bulma.FieldBody({
          children: [
            new bulma.Field({
              grouped: true,
              controls: [
                new bulma.Control({
                  children: [
                    new bulma.Button({
                      children: [new morelull.Text({ data: "修改" })],
                      click: async () => {
                        const maxAllSession =
                          maxAllSessionInput.getValue(context);
                        const maxAllTotalOctets =
                          maxAllTotalOctetsInput.getValue(context);
                        let ok = true;
                        try {
                          await this.client.setUserInfo(
                            this.username,
                            maxAllSession,
                            maxAllTotalOctets
                          );
                        } catch (error) {
                          ok = false;
                          console.error(error);
                        }
                        if (ok) {
                          (async () => {
                            try {
                              await this.client.coa(this.username);
                            } catch (error) {
                              console.error(error);
                            }
                          })();
                        }
                        alert(ok ? "修改成功" : "修改失敗");
                      },
                    }),
                  ],
                }),
                new bulma.Control({
                  children: [
                    new bulma.Button({
                      children: [new morelull.Text({ data: "踢掉使用者" })],
                      click: async () => {
                        try {
                          await this.client.disconnect(this.username);
                        } catch (error) {
                          ok = false;
                          console.error(error);
                        }
                      },
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      });
    } else {
      maxAllSessionChildren.push(
        new morelull.Text({ data: this.info.maxAllSession?.toString() ?? "" })
      );
      maxAllTotalOctetsChildren.push(
        new morelull.Text({
          data: this.info.maxAllTotalOctets?.toString() ?? "",
        })
      );
      button = null;
    }
    children.push(
      new bulma.HorizontalField({
        label: new bulma.FieldLabel({
          normal: true,
          label: new bulma.Label({
            children: [new morelull.Text({ data: "使用時間上限" })],
          }),
        }),
        body: new bulma.FieldBody({
          children: maxAllSessionChildren,
        }),
      }),
      new bulma.HorizontalField({
        label: new bulma.FieldLabel({
          normal: true,
          label: new bulma.Label({
            children: [new morelull.Text({ data: "流量上限" })],
          }),
        }),
        body: new bulma.FieldBody({
          children: maxAllTotalOctetsChildren,
        }),
      })
    );
    if (button !== null) {
      children.push(button);
    }
    return new bulma.Block({
      children: children,
    });
  }
}

const mainClient = chinchou.createDefaultMainClient();
const currentUser = new common.CurrentUser(mainClient);

const url = new URL(window.location.href);
const username = url.searchParams.get("username");
if (username === null) {
  const context = common.common([new common.Mentori()], currentUser);
  await currentUser.data(context);
} else {
  const userInfo = new UserInfo({
    username: username,
    admin: (await mainClient.currentUser()) === "admin",
    client: mainClient,
  });
  const context = common.common([userInfo], currentUser);
  await userInfo.data(context);

  await currentUser.data(context);
}
