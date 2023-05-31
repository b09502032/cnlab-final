import * as blocks from "../bulma/elements/block";
import * as box from "../bulma/elements/box";
import * as contents from "../bulma/elements/content";
import * as images from "../bulma/elements/image";
import * as typography from "../bulma/helpers/typography";
import * as mediaObject from "../bulma/layout/media_object";
import * as clients from "../client";
import * as common from "../common";
import * as utils from "../utils";

const client = clients.defaultClient();
const route = new common.Route();
common.maybeGoHome(client, route);

function gameMedia(src: string, name: string, route: common.Route) {
  const image = document.createElement("img");
  image.src = src;
  const anchor = document.createElement("a");
  anchor.href = route.game(name);
  return utils.replaceChildren(blocks.block(document.createElement("div")), [
    utils.replaceChildren(anchor, [
      utils.replaceChildren(box.box(document.createElement("div")), [
        utils.replaceChildren(
          mediaObject.media(document.createElement("article")),
          [
            utils.replaceChildren(
              mediaObject.mediaLeft(document.createElement("figure")),
              [
                utils.replaceChildren(
                  images.image({
                    element: document.createElement("p"),
                    dimension: 128,
                  }),
                  [image]
                ),
              ]
            ),
            utils.replaceChildren(
              mediaObject.mediaContent(document.createElement("div")),
              [
                utils.replaceChildren(
                  contents.content(document.createElement("div")),
                  [
                    utils.replaceChildren(document.createElement("h1"), [
                      document.createTextNode(name),
                    ]),
                  ]
                ),
              ]
            ),
          ]
        ),
      ]),
    ]),
  ]);
}

document.body.replaceChildren(
  ...common.common(client, route, [
    utils.replaceChildren(
      typography.size(blocks.block(document.createElement("div")), 1),
      [document.createTextNode("games")]
    ),
    gameMedia(
      "https://upload.wikimedia.org/wikipedia/commons/2/20/Othello-Standard-Board.jpg",
      "reversi",
      route
    ),
  ])
);
