import { ServerResponse } from "./response"
import { CreateGameDTO, GameStore, ServerError } from "./servermodel"
import { ServerModel } from "./servermodel"
import type { Game } from "domain/src/model/Game"

export interface Broadcaster {
  //sendPendingGames: (message: CreateGameDTO[]) => Promise<void>,
}

export type API = {
  create_game: (game: CreateGameDTO) => Promise<ServerResponse<Game, ServerError>>
  get_pending_games: () => Promise<ServerResponse<CreateGameDTO[], ServerError>>
  get_games: () => Promise<ServerResponse<Game[], ServerError>>
}

export const create_api = (broadcaster: Broadcaster, store: GameStore): API => {
  const server = new ServerModel(store)

  async function create_game(game: CreateGameDTO) {
    const newGame = await server.create_game(game);
    
    var games = await server.get_games()
    games.process(broadcastGames)
    
    return newGame
  }

  async function get_games() {
    const games = await server.get_games()
    return games
  }

  async function get_pending_games() {
    const pending_games = await server.get_pending_games()
    return pending_games
  }
  
  async function broadcastGames(games: CreateGameDTO[]): Promise<void> {
    //broadcaster.sendPendingGames(games)
  }

  return {
    create_game,
    get_pending_games,
    get_games,
  }
}