import * as columns from "../../bulma/columns/basics";
import * as columnOptions from "../../bulma/columns/options";
import * as columnResponsiveness from "../../bulma/columns/responsiveness";
import * as columnSizes from "../../bulma/columns/sizes";
import * as blocks from "../../bulma/elements/block";
import * as box from "../../bulma/elements/box";
import * as buttons from "../../bulma/elements/button";
import * as notifications from "../../bulma/elements/notification";
import * as tags from "../../bulma/elements/tag";
import * as typography from "../../bulma/helpers/typography";
import * as clients from "../../client";
import * as common from "../../common";
import * as utils from "../../utils";
import * as schema from "./schema";

const client = clients.defaultClient();
const route = new common.Route();
common.maybeGoHome(client, route);

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

function rooms(client: clients.Client) {
  const button = document.createElement("button");
  const roomList = document.createElement("div");

  async function updateList() {
    const roomIds = await client.listReversi();
    const nodes = [];
    for (const id of roomIds) {
      const anchor = document.createElement("a");
      const url = new URL(window.location.href);
      url.searchParams.set("id", id.toString());
      anchor.href = url.href;
      nodes.push(
        utils.replaceChildren(blocks.block(document.createElement("div")), [
          utils.replaceChildren(anchor, [
            utils.replaceChildren(box.box(document.createElement("div")), [
              document.createTextNode(id.toString()),
            ]),
          ]),
        ])
      );
    }
    roomList.replaceChildren(...nodes);
  }

  button.addEventListener("click", async () => {
    await client.createReversi();
    await updateList();
  });
  const result = [
    utils.replaceChildren(blocks.block(document.createElement("div")), [
      utils.replaceChildren(
        columnOptions.vcentered(columns.columns(document.createElement("div"))),
        [
          utils.replaceChildren(columns.column(document.createElement("div")), [
            utils.replaceChildren(
              typography.size(document.createElement("div"), 1),
              [document.createTextNode("rooms")]
            ),
          ]),
          utils.replaceChildren(
            columnSizes.narrow(columns.column(document.createElement("div"))),
            [
              utils.replaceChildren(buttons.button(button), [
                document.createTextNode("new"),
              ]),
            ]
          ),
        ]
      ),
    ]),
    blocks.block(roomList),
  ];
  updateList();
  return result;
}

class BadBoardData extends Error {}

function playerOptionsMap(nextPlayerOptions: schema.MoveOptions | null) {
  if (nextPlayerOptions === null) {
    return null;
  }
  const map = new Map<
    string,
    schema.MoveOption & { id: number; index: number }
  >();
  const options = nextPlayerOptions.options;
  if (options === null) {
    return map;
  }
  for (const [index, option] of options.entries()) {
    map.set(option.position.toString(), {
      id: nextPlayerOptions.id,
      index: index,
      position: option.position,
      flips: option.flips,
    });
  }
  return map;
}

function board(
  state: schema.State,
  userId: number | null,
  nextPlayerOptions: schema.MoveOptions | null,
  players: [number | null, number | null] | null,
  socket: WebSocket
) {
  const options = playerOptionsMap(nextPlayerOptions);
  const board = state.board;
  const length = board.data.length;
  const boardGrid = document.createElement("div");
  boardGrid.style.gridTemplateColumns = `repeat(${length}, 1fr)`;
  boardGrid.style.gridTemplateRows = `repeat(${length}, 1fr)`;
  boardGrid.style.display = "grid";
  boardGrid.style.border = "1px solid";
  boardGrid.style.lineHeight = "1";
  boardGrid.style.width = "fit-content";
  const cellBoxes = [];
  const blinkingCells: HTMLDivElement[] = [];
  const cells: HTMLDivElement[] = [];
  for (let i = 0; i < length; ++i) {
    const boardDataRow = board.data[i];
    if (boardDataRow === undefined) {
      throw new BadBoardData();
    }
    for (let j = 0; j < length; ++j) {
      const boardDataItem = boardDataRow[j];
      if (boardDataItem === undefined) {
        throw new BadBoardData();
      }
      const cell = document.createElement("div");
      cell.style.margin = "0.5rem";
      typography.size(cell, 1);
      cells.push(cell);
      const cellBox = utils.replaceChildren(document.createElement("div"), [
        cell,
      ]);
      cellBox.style.border = "1px solid black";
      cellBox.style.aspectRatio = "1 / 1";
      cellBox.style.display = "grid";
      cellBox.style.placeItems = "center";

      let cellContent = "⚪";
      if (boardDataItem === 0) {
        cellContent = "⚪";
      } else if (boardDataItem === 1) {
        cellContent = "⚫";
      } else {
        cell.style.visibility = "hidden";
        if (options !== null) {
          const option = options.get([i, j].toString());
          if (option !== undefined) {
            // cellContent = state.next_player === 0 ? "⚪" : "⚫";
            cellContent = "◯";
            cell.style.visibility = "visible";

            cell.style.opacity = (0.5).toString();
            cell.style.animation = "blink 2s linear infinite";
            blinkingCells.push(cell);

            if (players !== null && players[state.next_player] === userId) {
              cellBox.style.cursor = "pointer";
              cellBox.addEventListener("click", async () => {
                socket.send(
                  JSON.stringify({
                    type: "MoveSelection",
                    data: {
                      id: option.id,
                      index: option.index,
                    },
                  })
                );
              });
            }
            cellBox.addEventListener("mouseenter", () => {
              for (const flip of option.flips) {
                const flipCell = cells[flip[0] * length + flip[1]];
                if (flipCell === undefined) {
                  throw new BadBoardData();
                }
                flipCell.replaceChildren(
                  document.createTextNode(state.next_player === 0 ? "⚪" : "⚫")
                );
                for (const cell of blinkingCells) {
                  cell.style.visibility = "hidden";
                  cell.style.opacity = (1).toString();
                  cell.style.animation = "";
                }
                cell.style.visibility = "visible";
                cell.replaceChildren(
                  document.createTextNode(state.next_player === 0 ? "⚪" : "⚫")
                );
              }
            });
            cellBox.addEventListener("mouseleave", () => {
              for (const flip of option.flips) {
                const flipCell = cells[flip[0] * length + flip[1]];
                if (flipCell === undefined) {
                  throw new BadBoardData();
                }
                flipCell.replaceChildren(
                  document.createTextNode(state.next_player === 1 ? "⚪" : "⚫")
                );

                for (const cell of blinkingCells) {
                  cell.style.visibility = "visible";
                  cell.style.opacity = (0.5).toString();
                  cell.style.animation = "blink 2s linear infinite";
                }
                cell.replaceChildren(document.createTextNode("◯"));
              }
            });
          }
        }
      }
      cellBox.addEventListener("mouseenter", () => {
        cellBox.style.outline = "4px dashed orange";
      });
      cellBox.addEventListener("mouseleave", () => {
        cellBox.style.outline = "";
      });
      cell.replaceChildren(document.createTextNode(cellContent));
      cellBoxes.push(cellBox);
    }
  }
  boardGrid.replaceChildren(...cellBoxes);
  return [boardGrid];
}

function playerDisplay(
  players: [number | null, number | null],
  index: 0 | 1,
  usernames: Map<number, string>,
  userId: number | null,
  client: clients.Client,
  socket: WebSocket
) {
  const player = players[index];
  const node = document.createElement("span");
  if (player === null) {
    if (userId === null || players.includes(userId)) {
      node.replaceChildren(
        utils.replaceChildren(tags.tag(document.createElement("span")), [
          document.createTextNode("waiting"),
        ])
      );
    } else {
      const button = document.createElement("button");
      button.addEventListener("click", async () => {
        socket.send(
          JSON.stringify({
            type: "ChoosePlayer",
            data: {
              index: index,
            },
          })
        );
      });
      node.replaceChildren(
        utils.replaceChildren(buttons.button(button), [
          document.createTextNode("choose"),
        ])
      );
    }
  } else {
    const username = usernames.get(player);
    if (username === undefined) {
      node.replaceChildren(
        utils.replaceChildren(tags.tag(document.createElement("span")), [
          document.createTextNode("⏳"),
        ])
      );
      (async () => {
        const username = await client.getUsername(player);
        usernames.set(player, username);
        node.replaceChildren(
          utils.replaceChildren(document.createElement("div"), [
            document.createTextNode(username),
          ])
        );
      })();
    } else {
      node.replaceChildren(
        utils.replaceChildren(document.createElement("div"), [
          document.createTextNode(username),
        ])
      );
    }
  }
  const disk = index === 0 ? "⚪" : "⚫";
  return [
    utils.replaceChildren(
      columnSizes.narrow(columns.column(document.createElement("div"))),
      [
        utils.replaceChildren(document.createElement("span"), [
          document.createTextNode(disk),
        ]),
      ]
    ),
    utils.replaceChildren(
      columnSizes.narrow(columns.column(document.createElement("div"))),
      [node]
    ),
  ];
}

function otherInfo(
  players: [number | null, number | null],
  usernames: Map<number, string>,
  userId: number | null,
  client: clients.Client,
  socket: WebSocket,
  nextPlayer: 0 | 1 | null,
  gameResult: string | null
) {
  const container = document.createElement("div");
  const children = [];
  if (gameResult !== null) {
    children.push(
      columns.column(document.createElement("div")),
      utils.replaceChildren(
        columnSizes.narrow(columns.column(document.createElement("div"))),
        [
          utils.replaceChildren(document.createElement("div"), [
            document.createTextNode(gameResult),
          ]),
        ]
      )
    );
  } else if (
    nextPlayer !== null &&
    players[0] !== null &&
    players[1] !== null
  ) {
    const disk = nextPlayer === 0 ? "⚪" : "⚫";
    const turn = utils.replaceChildren(document.createElement("div"), [
      document.createTextNode(`${disk}'s turn`),
    ]);
    children.push(
      columns.column(document.createElement("div")),
      utils.replaceChildren(
        columnSizes.narrow(columns.column(document.createElement("div"))),
        [turn]
      )
    );
  }
  container.replaceChildren(
    utils.replaceChildren(
      columnOptions.vcentered(
        columnResponsiveness.mobile(
          columns.columns(document.createElement("div"))
        )
      ),
      [
        ...playerDisplay(players, 0, usernames, userId, client, socket),
        ...playerDisplay(players, 1, usernames, userId, client, socket),
        ...children,
      ]
    )
  );
  return [container];
}

function room(client: clients.Client, id: number, userId: number | null) {
  const info: {
    state: schema.State | null;
    nextPlayerOptions: schema.MoveOptions | null;
    players: [number | null, number | null] | null;
    usernames: Map<number, string>;
  } = {
    state: null,
    nextPlayerOptions: null,
    players: null,
    usernames: new Map(),
  };
  const notificationContainer = document.createElement("div");
  const boardContainer = document.createElement("div");
  boardContainer.style.display = "grid";
  boardContainer.style.justifyItems = "center";
  const otherInfoContainer = document.createElement("div");
  const socket = client.enterReversi(id);
  const openPromise = new Promise<void>((resolve) => {
    socket.addEventListener("open", () => {
      resolve();
    });
  });
  socket.addEventListener("message", async (event) => {
    await openPromise;
    const message = schema.message.parse(JSON.parse(event.data));
    if (message.type === "StateUpdate") {
      const stateUpdate = message.data;
      const state = stateUpdate.state;
      info.state = state;
      boardContainer.replaceChildren(
        ...board(state, userId, info.nextPlayerOptions, info.players, socket)
      );
      const players = info.players;
      if (players !== null) {
        otherInfoContainer.replaceChildren(
          ...otherInfo(
            players,
            info.usernames,
            userId,
            client,
            socket,
            info.state?.next_player ?? null,
            null
          )
        );
      }
    } else if (message.type === "MoveOptions") {
      const moveOptions = message.data;
      info.nextPlayerOptions = moveOptions;
      const state = info.state;
      {
        const options = moveOptions.options;
        if (options === null) {
          let node;
          if (state === null) {
            node = utils.replaceChildren(document.createElement("span"), [
              document.createTextNode("game end"),
            ]);
          } else {
            let zeroCount = 0;
            let oneCount = 0;
            for (const row of state.board.data) {
              for (const cell of row) {
                if (cell === 0) {
                  ++zeroCount;
                } else if (cell === 1) {
                  ++oneCount;
                }
              }
            }
            let result;
            if (zeroCount > oneCount) {
              result = "⚪ wins";
            } else if (zeroCount === oneCount) {
              result = "tie";
            } else {
              result = "⚫ wins";
            }
            node = utils.replaceChildren(document.createElement("span"), [
              document.createTextNode(
                `⚪ count: ${zeroCount}, ⚫ count: ${oneCount}, ${result}`
              ),
            ]);
            const players = info.players;
            if (players !== null) {
              otherInfoContainer.replaceChildren(
                ...otherInfo(
                  players,
                  info.usernames,
                  userId,
                  client,
                  socket,
                  info.state?.next_player ?? null,
                  result
                )
              );
            }
          }
          const button = document.createElement("button");
          const notification = utils.replaceChildren(
            blocks.block(document.createElement("div")),
            [
              utils.replaceChildren(
                notifications.notification(document.createElement("div")),
                [notifications.deleteButton(button), node]
              ),
            ]
          );
          button.addEventListener("click", () => {
            notification.remove();
          });
          notificationContainer.insertBefore(
            notification,
            notificationContainer.firstChild
          );
        } else {
          if (options.length === 0) {
            if (state !== null) {
              const disk = state.next_player === 0 ? "⚪" : "⚫";
              const id = state.moves.length;
              const node = utils.replaceChildren(
                document.createElement("span"),
                [
                  document.createTextNode(
                    `turn ${id}: no moves available for ${disk}, skipping`
                  ),
                ]
              );
              const button = document.createElement("button");
              const notification = utils.replaceChildren(
                blocks.block(document.createElement("div")),
                [
                  utils.replaceChildren(
                    notifications.notification(document.createElement("div")),
                    [notifications.deleteButton(button), node]
                  ),
                ]
              );
              button.addEventListener("click", () => {
                notification.remove();
              });
              notificationContainer.insertBefore(
                notification,
                notificationContainer.firstChild
              );
            }
          }
        }
      }
      if (state !== null) {
        boardContainer.replaceChildren(
          ...board(state, userId, moveOptions, info.players, socket)
        );
      }
    } else if (message.type == "PlayerUpdate") {
      const playerUpdate = message.data;
      info.players = playerUpdate.players;
      otherInfoContainer.replaceChildren(
        ...otherInfo(
          playerUpdate.players,
          info.usernames,
          userId,
          client,
          socket,
          info.state?.next_player ?? null,
          null
        )
      );
      const state = info.state;
      if (state !== null) {
        boardContainer.replaceChildren(
          ...board(state, userId, info.nextPlayerOptions, info.players, socket)
        );
      }
    }
  });
  return [
    utils.replaceChildren(document.createElement("div"), [
      blocks.block(otherInfoContainer),
      blocks.block(boardContainer),
      blocks.block(notificationContainer),
    ]),
  ];
}

function go(client: clients.Client, id: string | null, userId: number | null) {
  if (id === null) {
    return rooms(client);
  }
  return room(client, Number.parseInt(id), userId);
}

const userId = await client.currentuser();

document.body.replaceChildren(
  ...common.common(client, route, go(client, id, userId))
);
