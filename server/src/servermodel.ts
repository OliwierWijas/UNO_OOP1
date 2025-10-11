import { ServerResponse } from "./response"
import type { Game } from "domain/src/model/Game"

export type CreateGameDTO = {
  name: string
}

export type PendingGame = {
  id: string
  creator: string
  number_of_players: number
  players: string[]
  readonly pending: true
}

export type StoreError = { type: 'Not Found', key: any } | { type: 'DB Error', error: any }
export type ServerError = { type: 'Forbidden' } | StoreError

const Forbidden: ServerError = { type: 'Forbidden' } as const

export interface GameStore {
  create_game(game: CreateGameDTO): Promise<ServerResponse<Game, StoreError>>
  get_pending_games(): Promise<ServerResponse<CreateGameDTO[], StoreError>>
  get_games(): Promise<ServerResponse<Game[], StoreError>>
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
}