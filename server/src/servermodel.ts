import { Card } from "domain/src/model/card"
import { ServerResponse } from "./response"
import { game, type Game } from "domain/src/model/Game"
import { type PlayerHand } from "domain/src/model/playerHand"
import { Type } from "domain/src/model/types"
import { DiscardPile } from "domain/src/model/discardPile"
import { Round } from "domain/src/model/round"

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

export type PlayerHandSubscription = {
  playerName: string,
  numberOfCards: number,
  score: number
}

export type PlayCardDTO = {
  gameName: string,
  index: number
}

export type DiscardPileSubscription = {
  color: string | null,
  digit: number | null,
  type: string
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
  play_card(gameName: string, index: number): Promise<ServerResponse<boolean, StoreError>>
  get_current_player(gameName: string): Promise<ServerResponse<PlayerHand, StoreError>>
  get_discard_pile(gameName: string): Promise<ServerResponse<DiscardPile, StoreError>>
  round_won(gameName: string, round: Round): Promise<ServerResponse<void, StoreError>>;
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

  async play_card(gameName: string, index: number): Promise<ServerResponse<boolean, StoreError>> {
    const cardPlayed = await this.store.play_card(gameName, index)
    return cardPlayed
  }

  async get_current_player(gameName: string): Promise<ServerResponse<PlayerHand, StoreError>> {
    const currentPlayer = await this.store.get_current_player(gameName)
    return currentPlayer
  }

  async get_discard_pile(gameName: string): Promise<ServerResponse<DiscardPile, StoreError>> {
    const discardPile = await this.store.get_discard_pile(gameName)
    return discardPile
  }

  async round_won(gameName: string, round: Round) {
    return this.store.round_won(gameName, round);
  }
}