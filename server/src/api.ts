import { ServerResponse } from "./response"
import { CreateGameDTO, CreatePlayerHandDTO, GamesNameDTO, GameStore, ServerError } from "./servermodel"
import { ServerModel } from "./servermodel"
import type { PlayerHand } from "domain/src/model/playerHand"
import type { Game } from "domain/src/model/Game"

export interface Broadcaster {
  sendPendingGames: (message: CreateGameDTO[]) => Promise<void>,
  sendPlayerHands: (gameName: string, playerHands: PlayerHand[]) => Promise<void>
  sendGameStarted: (gameName: string, game: Game) => Promise<void> 
}

export type API = {
  create_game: (game: CreateGameDTO) => Promise<ServerResponse<Game, ServerError>>
  get_pending_games: () => Promise<ServerResponse<CreateGameDTO[], ServerError>>
  get_games: () => Promise<ServerResponse<Game[], ServerError>>
  create_player_hand : (dto : CreatePlayerHandDTO)  => Promise<ServerResponse<PlayerHand, ServerError>>
  get_game_player_hands : (gameName: GamesNameDTO) => Promise<ServerResponse<PlayerHand[], ServerError>>
  start_game: (gameName: GamesNameDTO) => Promise<ServerResponse<Game, ServerError>>
}

export const create_api = (broadcaster: Broadcaster, store: GameStore): API => {
  const server = new ServerModel(store)

  async function create_game(game: CreateGameDTO) {
    const newGame = await server.create_game(game);
    
    const pendingGames = await server.get_pending_games()
    pendingGames.process(broadcastGames)
    
    return newGame
  }

  async function broadcastGames(games: CreateGameDTO[]): Promise<void> {
    broadcaster.sendPendingGames(games)
  }

   const broadcastPlayerHands = async (gameName: string, playerHands: PlayerHand[]): Promise<void> => {
    await broadcaster.sendPlayerHands(gameName, playerHands)
  }
  
  async function get_games() {
    const games = await server.get_games()
    return games
  }

  async function get_pending_games() {
    const pending_games = await server.get_pending_games()
    return pending_games
  }

  async function create_player_hand(dto : CreatePlayerHandDTO){
    const result = await server.create_player_hand(dto);
    const playerHands = await server.get_games_player_hands({ name: dto.gameName })
    await playerHands.process(hands => broadcastPlayerHands(dto.gameName, hands))
  
    return result;
  }

  async function get_game_player_hands(gameName : GamesNameDTO){
    const playerHands = await server.get_games_player_hands(gameName);
    return playerHands
  }

  async function start_game(gameName: GamesNameDTO) {
  const result = await server.start_game(gameName);
  result.process(async (game) => {
    await broadcaster.sendGameStarted(gameName.name, game);
  });
  
  return result;
}

  return {
    create_game,
    get_pending_games,
    get_games,
    create_player_hand,
    get_game_player_hands,
    start_game
  }
}