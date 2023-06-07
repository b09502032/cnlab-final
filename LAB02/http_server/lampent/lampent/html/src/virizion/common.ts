import * as chinchou from "../chinchou";
import * as bulma from "./bulma";
import * as morelull from "./morelull";
import * as virizion from "./virizion";

export class Mentori extends virizion.Beedrill {
  build() {
    return new morelull.Image({
      src: "/images/53725212_2313965738839586_5374362259034210304_n.webp",
    });
  }
}

export class MentoriMentori extends virizion.Beedrill {
  build() {
    return new morelull.Image({
      src: "/images/53608782_2313968622172631_4300759673578979328_n.webp",
    });
  }
}

export class MentoriEarth extends virizion.Beedrill {
  build() {
    return new morelull.Image({
      src: "/images/53604644_2313959415506885_8477920942977187840_n.webp",
    });
  }
}

export class MentoriStop extends virizion.Beedrill {
  build() {
    return new morelull.Image({
      src: "/images/53570705_2313968508839309_7003592346822508544_n.webp",
    });
  }
}

export class CurrentUser extends virizion.Beedrill {
  username: string | null = null;

  constructor(public client: chinchou.MainClient) {
    super();
  }

  async data(context: virizion.Context) {
    this.username = await this.client.currentUser();
    context.chimchar(this, this);
  }

  build() {
    if (this.username === null) {
      return new MentoriStop();
    }
    const url = new URL("/user/", window.location.origin);
    url.searchParams.append("username", this.username);
    return new morelull.Anchor({
      href: url.href,
      children: [new bulma.Tag([new morelull.Text({ data: this.username })])],
    });
  }
}

export class Navigation extends virizion.Beedrill {
  active = false;

  constructor(public currentUser: CurrentUser) {
    super();
  }

  hamburger(context: virizion.Context, menu: bulma.NavbarMenu) {
    return new bulma.NavbarBurger({
      acitve: this.active,
      click: (self) => {
        this.active = !this.active;
        const newMenu = this.menu();
        context.chimchar(menu, newMenu);
        context.chimchar(self, this.hamburger(context, newMenu));
      },
    });
  }

  menu() {
    return new bulma.NavbarMenu({
      start: new bulma.NavbarStart([
        new bulma.NavbarItemAnchor("/register/", [
          new morelull.Text({ data: "註冊" }),
        ]),
        new bulma.NavbarItemAnchor("/login/", [
          new morelull.Text({ data: "登入" }),
        ]),
        new bulma.NavbarItemAnchor("/logout/", [
          new morelull.Text({ data: "登出" }),
        ]),
        new bulma.NavbarItemAnchor(
          "http://connectivitycheck.gstatic.com/generate_204",
          [new morelull.Text({ data: "登入 Wi-Fi" })]
        ),
        new bulma.NavbarItemAnchor("/uam/logout/", [
          new morelull.Text({ data: "登出 Wi-Fi" }),
        ]),
        new bulma.NavbarItemAnchor("/accounting/", [
          new morelull.Text({ data: "顯示使用者流量與使用時間" }),
        ]),
        new bulma.NavbarItemAnchor("/users/", [
          new morelull.Text({ data: "使用者一覽" }),
        ]),
      ]),
      end: new bulma.NavbarEnd([
        new bulma.NavbarItemContentDivision([this.currentUser]),
      ]),
      active: this.active,
    });
  }

  build(context: virizion.Context) {
    const menu = this.menu();
    return new bulma.Navbar(
      new bulma.NavbarBrand(
        [
          new bulma.NavbarItemAnchor("/", [
            new morelull.Image({
              src: "/images/53584244_2313969792172514_4623440313124388864_n.webp",
            }),
          ]),
        ],
        this.hamburger(context, menu)
      ),
      menu
    );
  }
}

export class Form extends virizion.Beedrill {
  buttonText: string;
  buttonClick: (
    this: void,
    username: string,
    password: string,
    context: virizion.Context
  ) => Promise<virizion.Virizion[]>;
  notifications = new Set<bulma.Notification>();
  notificationBlock = new bulma.Block({});
  hidden = false;

  constructor(o: {
    buttonText: string;
    buttonClick: (
      this: void,
      username: string,
      password: string,
      context: virizion.Context
    ) => Promise<virizion.Virizion[]>;
  }) {
    super();
    this.buttonText = o.buttonText;
    this.buttonClick = o.buttonClick;
  }

  createNotification(children: virizion.Virizion[]) {
    return new bulma.Notification({
      children: children,
      deleteClick: (self) => {
        this.notifications.delete(self);
      },
    });
  }

  addNotification(context: virizion.Context, notification: bulma.Notification) {
    this.notifications.add(notification);
    const newNotificationBlock = this.createNotificationBlock();
    context.chimchar(this.notificationBlock, newNotificationBlock);
    this.notificationBlock = newNotificationBlock;
  }

  createNotificationBlock() {
    return new bulma.Block({
      children: [...this.notifications].reverse(),
    });
  }

  build(context: virizion.Context) {
    function label(data: string) {
      return new bulma.Label({ children: [new morelull.Text({ data: data })] });
    }

    const usernameInput = new bulma.Input({ type: "text" });
    const passwordInput = new bulma.Input({ type: "password" });

    const children = [this.notificationBlock];
    if (!this.hidden) {
      children.unshift(
        new bulma.Block({
          children: [
            new bulma.Field({
              label: label("username"),
              controls: [
                new bulma.Control({
                  children: [usernameInput],
                }),
              ],
            }),
            new bulma.Field({
              label: label("password"),
              controls: [
                new bulma.Control({
                  children: [passwordInput],
                }),
              ],
            }),
            new bulma.Field({
              controls: [
                new bulma.Control({
                  children: [
                    new bulma.Button({
                      children: [new morelull.Text({ data: this.buttonText })],
                      click: async () => {
                        const children = await this.buttonClick(
                          usernameInput.getValue(context),
                          passwordInput.getValue(context),
                          context
                        );
                        this.addNotification(
                          context,
                          this.createNotification(children)
                        );
                      },
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
    }
    return new morelull.ContentSpan({
      children: children,
    });
  }
}

export function common(
  children: virizion.Virizion[],
  currentUser: CurrentUser
) {
  const context = new virizion.Context(document);
  virizion.body(context, [
    new Navigation(currentUser),
    new bulma.Section({
      children: children,
    }),
  ]);
  return context;
}
