import * as modals from "./bulma/components/modal";
import * as blocks from "./bulma/elements/block";
import * as boxes from "./bulma/elements/box";
import * as buttons from "./bulma/elements/button";
import * as forms from "./bulma/form/general";
import * as inputs from "./bulma/form/input";
import * as typography from "./bulma/helpers/typography";
import * as tiles from "./bulma/layout/tiles";
import * as clients from "./client";
import * as common from "./common";
import * as utils from "./utils";

function form(client: clients.Client, route: common.Route) {
  const usernameInput = document.createElement("input");
  const passwordInput = document.createElement("input");
  const logInButton = document.createElement("button");
  logInButton.addEventListener("click", async () => {
    await client.login(usernameInput.value, passwordInput.value);
    window.location.href = route.home;
  });
  const signUpButton = document.createElement("button");
  signUpButton.addEventListener("click", async () => {
    let ok = true;
    try {
      await client.createUser(usernameInput.value, passwordInput.value);
    } catch (error) {
      ok = false;
      console.error(error);
    }
    let text;
    if (ok) {
      text = "sign up suceeded :)";
    } else {
      text = "sign up failed :(";
    }
    const modal = modals.modalModal([
      utils.replaceChildren(boxes.box(document.createElement("div")), [
        document.createTextNode(text),
      ]),
    ]);
    modal.classList.add("is-active");
    document.body.appendChild(modal);
  });
  return [
    utils.replaceChildren(
      forms.field({ element: document.createElement("div") }),
      [
        utils.replaceChildren(forms.label(document.createElement("label")), [
          document.createTextNode("username"),
        ]),
        utils.replaceChildren(forms.control(document.createElement("div")), [
          inputs.input(usernameInput, "text"),
        ]),
      ]
    ),
    utils.replaceChildren(
      forms.field({ element: document.createElement("div") }),
      [
        utils.replaceChildren(forms.label(document.createElement("label")), [
          document.createTextNode("password"),
        ]),
        utils.replaceChildren(forms.control(document.createElement("div")), [
          inputs.input(passwordInput, "password"),
        ]),
      ]
    ),
    utils.replaceChildren(
      forms.field({ element: document.createElement("div"), grouped: {} }),
      [
        utils.replaceChildren(forms.control(document.createElement("div")), [
          utils.replaceChildren(buttons.button(logInButton), [
            document.createTextNode("log in"),
          ]),
        ]),
        utils.replaceChildren(forms.control(document.createElement("div")), [
          utils.replaceChildren(buttons.button(signUpButton), [
            document.createTextNode("sign up"),
          ]),
        ]),
      ]
    ),
  ];
}

function welcome(client: clients.Client, route: common.Route) {
  const leftTile = document.createElement("div");
  leftTile.style.textAlign = "center";
  const image = common.logoImage();
  image.style.width = "128px";
  image.style.verticalAlign = "middle";
  const nameSpan = document.createElement("span");
  nameSpan.style.verticalAlign = "middle";
  return utils.replaceChildren(
    tiles.tile({
      element: document.createElement("div"),
      context: tiles.Context.ANCESTOR,
    }),
    [
      utils.replaceChildren(
        tiles.tile({
          element: document.createElement("div"),
          context: tiles.Context.PARENT,
        }),
        [
          utils.replaceChildren(
            tiles.tile({
              element: leftTile,
              context: tiles.Context.CHILD,
            }),
            [
              utils.replaceChildren(
                typography.size(blocks.block(document.createElement("div")), 1),
                [image, utils.replaceChildren(nameSpan, [common.name()])]
              ),
            ]
          ),
        ]
      ),
      utils.replaceChildren(
        tiles.tile({
          element: document.createElement("div"),
          context: tiles.Context.PARENT,
        }),
        [
          utils.replaceChildren(
            tiles.tile({
              element: document.createElement("div"),
              context: tiles.Context.CHILD,
            }),
            form(client, route)
          ),
        ]
      ),
    ]
  );
}

function home(
  isLoggedIn: boolean,
  client: clients.Client,
  route: common.Route
) {
  const gameButton = boxes.box(document.createElement("div"));
  gameButton.addEventListener("click", () => {
    window.location.href = route.games;
  });
  const gameIcon = utils.replaceChildren(document.createElement("span"), [
    document.createTextNode("stadia_controller"),
  ]);
  gameIcon.classList.add("material-symbols-outlined");
  gameIcon.style.fontSize = "xxx-large";
  gameButton.replaceChildren(
    gameIcon,
    utils.replaceChildren(document.createElement("div"), [
      document.createTextNode("games"),
    ])
  );
  gameButton.style.display = "grid";
  gameButton.style.cursor = "pointer";
  gameButton.style.placeItems = "center";
  if (isLoggedIn) {
    return common.common(client, route, [
      utils.replaceChildren(
        typography.size(blocks.block(document.createElement("div")), 1),
        [document.createTextNode("features")]
      ),
      utils.replaceChildren(blocks.block(document.createElement("div")), [
        utils.replaceChildren(
          tiles.tile({
            element: document.createElement("div"),
            context: tiles.Context.ANCESTOR,
          }),
          [
            utils.replaceChildren(
              tiles.tile({
                element: document.createElement("div"),
                context: tiles.Context.PARENT,
                size: 3,
              }),
              [
                utils.replaceChildren(
                  tiles.tile({
                    element: document.createElement("div"),
                    context: tiles.Context.CHILD,
                  }),
                  [gameButton]
                ),
              ]
            ),
          ]
        ),
      ]),
    ]);
  }
  return [common.section([welcome(client, route)])];
}

const client = clients.defaultClient();
const route = new common.Route();

document.body.replaceChildren(
  ...home(await client.isLoggedIn(), client, route)
);
