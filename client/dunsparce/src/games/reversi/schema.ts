import { z } from "zod";

const board = z.object({
  data: z.array(z.array(z.union([z.literal(0), z.literal(1), z.null()]))),
});

export type Board = z.infer<typeof board>;

const move = z.object({
  player: z.union([z.literal(0), z.literal(1)]),
  position: z.tuple([z.number(), z.number()]),
});

const state = z.object({
  board: board,
  next_player: z.union([z.literal(0), z.literal(1)]),
  moves: z.array(move),
});

export type State = z.infer<typeof state>;

const stateUpdate = z.object({ state: state });

export const stateUpdateMessage = z.object({
  type: z.literal("StateUpdate"),
  data: stateUpdate,
});

export type StateUpdateMessage = z.infer<typeof stateUpdateMessage>;

const playerUpdate = z.object({
  players: z.tuple([
    z.union([z.number(), z.null()]),
    z.union([z.number(), z.null()]),
  ]),
});

export const playerUpdateMessage = z.object({
  type: z.literal("PlayerUpdate"),
  data: playerUpdate,
});

export type PlayerUpdateMessage = z.infer<typeof playerUpdateMessage>;

const moveOption = z.object({
  position: z.tuple([z.number(), z.number()]),
  flips: z.array(z.tuple([z.number(), z.number()])),
});
export type MoveOption = z.infer<typeof moveOption>;

const moveOptions = z.object({
  id: z.number(),
  options: z.union([z.array(moveOption), z.null()]),
});

export type MoveOptions = z.infer<typeof moveOptions>;

export const moveOptionsMessage = z.object({
  type: z.literal("MoveOptions"),
  data: moveOptions,
});

export const message = z.union([
  stateUpdateMessage,
  playerUpdateMessage,
  moveOptionsMessage,
]);
