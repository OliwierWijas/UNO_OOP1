import { ServerResponse } from "./response"
import { GameStore, IndexedGame, PendingGame, ServerError } from "./servermodel"
import { ServerModel } from "./servermodel"

export interface Broadcaster {
  send: (message: IndexedGame | PendingGame) => Promise<void>
}

export type API = {
  new_game: (creator: string, number_of_players: number) => Promise<ServerResponse<IndexedGame | PendingGame, ServerError>>
  pending_games: () => Promise<ServerResponse<PendingGame[], ServerError>>
  pending_game: (id: string) => Promise<ServerResponse<PendingGame, ServerError>>
  join: (id: string, player: string) => Promise<ServerResponse<IndexedGame | PendingGame, ServerError>>
  games: () => Promise<ServerResponse<IndexedGame[], ServerError>>
  game: (id: string) => Promise<ServerResponse<IndexedGame, ServerError>>
  draw_card: (id: string, player: string) => Promise<ServerResponse<IndexedGame, ServerError>>
  play_card: (id: string, player: string, cardIndex: number) => Promise<ServerResponse<IndexedGame, ServerError>>
}

export const create_api = (broadcaster: Broadcaster, store: GameStore): API => {
  const server = new ServerModel(store)

  async function new_game(creator: string, number_of_players: number) {
    const newGame = await server.add(creator, number_of_players)
    newGame.process(broadcast)
    return newGame
  }
  
  async function draw_card(id: string, player: string) {
    const game = await server.draw_card(id, player)
    game.process(broadcast)
    return game
  }
  
  async function play_card(id: string, player: string, cardIndex: number) {
    const game = await server.play_card(id, player, cardIndex)
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
  
  async function broadcast(game: IndexedGame | PendingGame): Promise<void> {
    broadcaster.send(game)
  }

  return {
    new_game,
    pending_games,
    pending_game,
    join,
    games,
    game,
    draw_card,
    play_card,
  }
}