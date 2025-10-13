import { ServerResponse } from "./response"
import { CreateGameDTO, CreatePlayerHandDTO, GamesNameDTO, GameStore, PlayerHandSubscription, ServerError } from "./servermodel"
import { ServerModel } from "./servermodel"
import type { PlayerHand } from "domain/src/model/playerHand"
import { game, type Game } from "domain/src/model/Game"
import { Card } from "domain/src/model/card"
import { Type } from "domain/src/model/types"

export interface Broadcaster {
  sendPendingGames: (message: CreateGameDTO[]) => Promise<void>,
  sendPlayerHands: (gameName: string, playerHands: PlayerHandSubscription[]) => Promise<void>
  sendGameStarted: (gameName: string, game: Game) => Promise<void> 
}

export type API = {
  create_game: (game: CreateGameDTO) => Promise<ServerResponse<Game, ServerError>>
  get_pending_games: () => Promise<ServerResponse<CreateGameDTO[], ServerError>>
  get_games: () => Promise<ServerResponse<Game[], ServerError>>
  create_player_hand : (dto : CreatePlayerHandDTO)  => Promise<ServerResponse<PlayerHand, ServerError>>
  get_game_player_hands : (gameName: GamesNameDTO) => Promise<ServerResponse<PlayerHand[], ServerError>>
  start_game: (gameName: GamesNameDTO) => Promise<ServerResponse<Game, ServerError>>
  take_cards: (gameName: string, playerName: string, number: number) => Promise<ServerResponse<Card<Type>[], ServerError>>
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

   const broadcastPlayerHands = async (gameName: string, playerHands: PlayerHandSubscription[]): Promise<void> => {
    console.log("broadcaster")
    console.log(playerHands)
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
    await playerHands.process(hands => {
      const subscriptionHands = hands.map(mapPlayerHandToSubscription)
      return broadcastPlayerHands(dto.gameName, subscriptionHands);
    })
  
    return result;
  }

  async function get_game_player_hands(gameName : GamesNameDTO){
    const playerHands = await server.get_games_player_hands({ name: gameName.name});
    return playerHands
  }

  async function start_game(gameName: GamesNameDTO) {
    const result = await server.start_game(gameName);
    result.process(async (game) => {
      await broadcaster.sendGameStarted(gameName.name, game);
    });
    
    return result;
  }

  async function take_cards(gameName: string, playerName: string, number: number) {
    const cards = await server.take_cards(gameName, playerName, number)

    // update player hands
    const playerHands = await server.get_games_player_hands({ name: gameName })
    await playerHands.process(hands => {
      const subscriptionHands = hands.map(mapPlayerHandToSubscription)
      return broadcastPlayerHands(gameName, subscriptionHands);
    })

    return cards
  }

  return {
    create_game,
    get_pending_games,
    get_games,
    create_player_hand,
    get_game_player_hands,
    start_game,
    take_cards
  }
}

export function mapPlayerHandToSubscription(hand: PlayerHand): PlayerHandSubscription {
  return {
    playerName: hand.playerName,
    numberOfCards: hand.playerCards.length,
    score: hand.score
  };
}