import * as navbars from "./bulma/components/navbar";
import * as images from "./bulma/elements/image";
import * as flexbox from "./bulma/helpers/flexbox";
import * as containers from "./bulma/layout/container";
import * as sections from "./bulma/layout/section";
import * as clients from "./client";
import * as utils from "./utils";

export function logoImage() {
  const image = document.createElement("img");
  image.src = "/assets/ezgif-2-d25683dee3.webp";
  return image;
}

export class Route {
  public home = "/";
  public games = "/games";

  game(name: string) {
    return `/games/${name}`;
  }
}

export function logo(dimension: 16 | 24 | 32 | 48 | 64 | 96 | 128) {
  const figure = images.image({
    element: document.createElement("figure"),
    dimension: dimension,
  });
  figure.replaceChildren(logoImage());
  return figure;
}

export function name() {
  return document.createTextNode("Omanyte");
}

export function section(children: Node[]) {
  return utils.replaceChildren(
    sections.section(document.createElement("section")),
    [
      utils.replaceChildren(
        containers.container(document.createElement("div")),
        children
      ),
    ]
  );
}

function hamburger() {
  return utils.replaceChildren(
    navbars.navbarBurger(document.createElement("a")),
    [
      document.createElement("span"),
      document.createElement("span"),
      document.createElement("span"),
    ]
  );
}

export function navbar(client: clients.Client, route: Route) {
  const brandItem = document.createElement("a");
  brandItem.href = route.home;
  const logOutItem = document.createElement("a");
  logOutItem.addEventListener("click", async () => {
    await client.logout();
    window.location.href = route.home;
  });
  const burger = hamburger();
  const menu = document.createElement("div");
  burger.addEventListener("click", () => {
    navbars.toggleActive(menu);
  });
  return utils.replaceChildren(
    navbars.navbar({ element: document.createElement("nav"), shadow: true }),
    [
      utils.replaceChildren(
        navbars.navbarBrand(document.createElement("div")),
        [
          utils.replaceChildren(navbars.navbarItem({ element: brandItem }), [
            utils.replaceChildren(
              flexbox.flex({
                element: document.createElement("span"),
                alignItems: flexbox.AlignItems.CENTER,
              }),
              [
                utils.replaceChildren(document.createElement("div"), [
                  logoImage(),
                ]),
                utils.replaceChildren(document.createElement("div"), [name()]),
              ]
            ),
          ]),
          burger,
        ]
      ),
      utils.replaceChildren(navbars.navbarMenu(menu), [
        utils.replaceChildren(
          navbars.navbarStart(document.createElement("div")),
          []
        ),
        utils.replaceChildren(
          navbars.navbarEnd(document.createElement("div")),
          [
            utils.replaceChildren(
              navbars.navbarItem({
                element: document.createElement("div"),
                dropdown: true,
                hoverable: true,
              }),
              [
                navbars.navbarLink({ element: document.createElement("a") }),
                utils.replaceChildren(
                  navbars.navbarDropdown({
                    element: document.createElement("div"),
                    right: true,
                  }),
                  [
                    utils.replaceChildren(
                      navbars.navbarItem({
                        element: document.createElement("a"),
                      }),
                      [document.createTextNode("profile")]
                    ),
                    utils.replaceChildren(
                      navbars.navbarItem({
                        element: document.createElement("a"),
                      }),
                      [document.createTextNode("settings")]
                    ),
                    utils.replaceChildren(
                      navbars.navbarItem({
                        element: logOutItem,
                      }),
                      [document.createTextNode("log out")]
                    ),
                  ]
                ),
              ]
            ),
          ]
        ),
      ]),
    ]
  );
}

export async function maybeGoHome(client: clients.Client, route: Route) {
  if (!(await client.isLoggedIn())) {
    window.location.href = route.home;
  }
}

export function common(client: clients.Client, route: Route, children: Node[]) {
  return [navbar(client, route), section(children)];
}
