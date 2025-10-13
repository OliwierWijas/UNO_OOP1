import { Card } from "domain/src/model/card"
import { ServerResponse } from "./response"
import type { Game } from "domain/src/model/Game"
import { type PlayerHand } from "domain/src/model/playerHand"
import { Type } from "domain/src/model/types"

export type CreateGameDTO = {
  name: string
}

export type GamesNameDTO = {
  name : string;
}

export type CreatePlayerHandDTO = {
  playerName : string,
  gameName : string
}

export type TakeCardsDTO = {
  gameName: string,
  playerName: string,
  numberOfCards: number
}

export type PendingGame = {
  id: string
  creator: string
  number_of_players: number
  players: string[]
  readonly pending: true
}

export type StoreError = { type: 'Not Found', key: any } | { type: 'DB Error', error: any } | { type: 'Game has too much Players', key: any }
export type ServerError = { type: 'Forbidden' } | StoreError

const Forbidden: ServerError = { type: 'Forbidden' } as const

export interface GameStore {
  create_game(game: CreateGameDTO): Promise<ServerResponse<Game, StoreError>>
  get_pending_games(): Promise<ServerResponse<CreateGameDTO[], StoreError>>
  get_games(): Promise<ServerResponse<Game[], StoreError>>
  create_player_hand(playerHand : CreatePlayerHandDTO): Promise<ServerResponse<PlayerHand, StoreError>>
  get_game_player_hands(gamesName : GamesNameDTO) :  Promise<ServerResponse<PlayerHand[], StoreError>>
  start_game(gamesName: GamesNameDTO): Promise<ServerResponse<Game, StoreError>>
  take_cards(gameName: string, playerName: string, number: number): Promise<ServerResponse<Card<Type>[], StoreError>>
}

export class ServerModel {
  private store: GameStore

  constructor(store: GameStore) {
    this.store = store
  }

  async create_game(dto: CreateGameDTO): Promise<ServerResponse<Game, StoreError>> {
    const result = await this.store.create_game(dto)
    return result
  }

  async get_pending_games() {
    var games = this.store.get_pending_games()
    return games
  }

  async get_games() {
    return this.store.get_games()
  }

  async create_player_hand(dto : CreatePlayerHandDTO): Promise<ServerResponse<PlayerHand, StoreError>>{
    const result = await this.store.create_player_hand(dto);
    return result;
  }

   async get_games_player_hands(dto : GamesNameDTO) {
    var playerHands = await this.store.get_game_player_hands(dto)
    return playerHands
  }

  async start_game(dto: GamesNameDTO): Promise<ServerResponse<Game, StoreError>> {
  const result = await this.store.start_game(dto);
  return result;
  }

  async take_cards(gameName: string, playerName: string, number: number): Promise<ServerResponse<Card<Type>[], StoreError>> {
    const cards = await this.store.take_cards(gameName, playerName, number)
    return cards
  }
}