import { ServerResponse } from "./response"
import type { Card } from "domain/src/model/card" // Adjust path as needed
import type { Type } from "domain/src/model/types"
import type { PlayerHand } from "domain/src/model/playerHand" // Adjust path as needed

export interface IndexedGame {
  readonly id: string
  readonly pending: false
  // Add your game properties here based on your domain model
  rounds: any[]
  currentRound: any
  isGameFinished: boolean
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
  games(): Promise<ServerResponse<IndexedGame[], StoreError>>
  game(id: string): Promise<ServerResponse<IndexedGame, StoreError>>
  add(game: IndexedGame): Promise<ServerResponse<IndexedGame, StoreError>>
  update(game: IndexedGame): Promise<ServerResponse<IndexedGame, StoreError>>
  
  pending_games(): Promise<ServerResponse<PendingGame[], StoreError>>
  pending_game(id: string): Promise<ServerResponse<PendingGame, StoreError>>
  add_pending(game: Omit<PendingGame, 'id'>): Promise<ServerResponse<PendingGame, StoreError>>
  delete_pending(id: string): Promise<ServerResponse<null, StoreError>>
  update_pending(pending: PendingGame): Promise<ServerResponse<PendingGame, StoreError>>
}

export class ServerModel {
  private store: GameStore

  constructor(store: GameStore) {
    this.store = store
  }

  all_games() {
    return this.store.games()
  }

  all_pending_games() {
   return this.store.pending_games()
  }

  game(id: string) {
    return this.store.game(id)
  }

  pending_game(id: string) {
    return this.store.pending_game(id)
  }

  async add(creator: string, number_of_players: number) {
    const g = await this.store.add_pending({ creator, number_of_players, players: [], pending: true })
    return g.flatMap(game_1 => this.join(game_1.id, creator))
  }

  private startGameIfReady(pending_game: PendingGame): Promise<ServerResponse<IndexedGame | PendingGame, StoreError>> {
    const id = pending_game.id
    if (pending_game.players.length === pending_game.number_of_players) {
      // Create actual game from pending game
      const game = this.createNewGame(pending_game.players, id)
      this.store.delete_pending(id)
      return this.store.add(game)
    } else {
      return this.store.update_pending(pending_game)
    }
  }

  private createNewGame(players: string[], id: string): IndexedGame {
    // Implement game creation logic based on your domain
    return {
      id,
      pending: false,
      rounds: [],
      currentRound: null,
      isGameFinished: false
    }
  }

  async join(id: string, player: string) {
    const pending_game = await this.store.pending_game(id)
    return pending_game.flatMap(async g => {
      g.players.push(player)
      return this.startGameIfReady(g)
    })
  }

  async draw_card(id: string, player: string): Promise<ServerResponse<IndexedGame, ServerError>> {
    // Implement draw card logic
    let game: ServerResponse<IndexedGame, ServerError> = await this.game(id)
    game = await game.filter(async g => g && this.isPlayerTurn(g, player), async _ => Forbidden)
    // Add draw card logic here
    return game.flatMap(async g => this.store.update(g))
  }

  async play_card(id: string, player: string, cardIndex: number): Promise<ServerResponse<IndexedGame, ServerError>> {
    // Implement play card logic
    let game: ServerResponse<IndexedGame, ServerError> = await this.game(id)
    game = await game.filter(async g => g && this.isPlayerTurn(g, player), async _ => Forbidden)
    // Add play card logic here
    return game.flatMap(async g => this.store.update(g))
  }

  private isPlayerTurn(game: IndexedGame, player: string): boolean {
    // Implement turn checking logic
    return true // Placeholder
  }
}