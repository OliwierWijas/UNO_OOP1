import { ServerResponse } from "./response";
import { GameStore, IndexedYahtzee, PendingGame, ServerError } from "./servermodel";
import { ServerModel } from "./servermodel"
import { SlotKey } from "domain/src/model/yahtzee.slots"
import { Randomizer } from "domain/src/utils/random_utils";

export interface Broadcaster {
  send: (message: IndexedYahtzee | PendingGame) => Promise<void>
}

export type API = {
  new_game: (creator: string, number_of_players: number) => Promise<ServerResponse<IndexedYahtzee | PendingGame, ServerError>>;
  pending_games: () => Promise<ServerResponse<PendingGame[], ServerError>>;
  pending_game: (id: string) => Promise<ServerResponse<PendingGame, ServerError>>;
  join: (id: string, player: string) => Promise<ServerResponse<IndexedYahtzee | PendingGame, ServerError>>;
  games: () => Promise<ServerResponse<IndexedYahtzee[], ServerError>>;
  game: (id: string) => Promise<ServerResponse<IndexedYahtzee, ServerError>>;
  reroll: (id: string, held: number[], player: string) => Promise<ServerResponse<IndexedYahtzee, ServerError>>;
  register: (id: string, slot: SlotKey, player: string) => Promise<ServerResponse<IndexedYahtzee, ServerError>>;
}

export const create_api = (broadcaster: Broadcaster, store: GameStore, randomizer: Randomizer): API => {
  const server = new ServerModel(store, randomizer)

  async function new_game(creator: string, number_of_players: number) {
    const newGame = await server.add(creator, number_of_players)
    newGame.process(broadcast)
    return newGame
  }
  
  async function reroll(id: string, held: number[], player: string) {
    const game = await server.reroll(id, held, player);
    game.process(broadcast)
    return game
  }
  
  async function register(id: string, slot: SlotKey, player: string) {
    const game = await server.register(id, slot, player);
    game.process(broadcast)
    return game
  }

  async function games() {
    return server.all_games()
  }

  async function game(id: string) {
    return server.game(id)
  }

  function pending_games() {
    return server.all_pending_games()
  }

  function pending_game(id: string) {
    return server.pending_game(id)
  }

  async function join(id: string, player: string) {
    const game = await server.join(id, player)
    game.process(broadcast)
    return game
  }
  
  async function broadcast(game: IndexedYahtzee | PendingGame): Promise<void> {
    broadcaster.send(game)
  }

  return {
    new_game,
    pending_games,
    pending_game,
    join,
    games,
    game,
    reroll,
    register,
  }
}
