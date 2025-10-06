import { GameStore, IndexedYahtzee, PendingGame, StoreError } from "./servermodel"
import { ServerResponse } from "./response"

const not_found = (key: any): StoreError => ({ type: 'Not Found', key })

export class MemoryStore implements GameStore {
  private _games: IndexedYahtzee[]
  private _pending_games: PendingGame[]
  private next_id: number = 1

  constructor(...games: IndexedYahtzee[]) {
    this._games = [...games]
    this._pending_games = []
  }

  games() {
    return ServerResponse.ok([...this._games])
  }
  
  async game(id: string) {
    const found = await ServerResponse.ok(this._games.find(g => g.id === id))
    const game = await found.filter(async (g) => g !== undefined, async (_) => not_found(id))
    return game.map(async g => g!)
  }

  add(game: IndexedYahtzee) {
    this._games.push(game)
    return ServerResponse.ok(game)
  }

  update(game: IndexedYahtzee) {
    const index = this._games.findIndex(g => g.id === game.id)
    if (index === -1) {
      return ServerResponse.error(not_found(index))
    }
    this._games[index] = game
    return ServerResponse.ok(game)
  }

  pending_games() {
    return ServerResponse.ok([...this._pending_games])
  }

  async pending_game(id: string) {
    const found = await ServerResponse.ok(this._pending_games.find(g => g.id === id))
    const game = await found.filter(async (g) => g !== undefined, async (_) => not_found(id))
    return game.map(async g => g!)
  }

  add_pending(game: Omit<PendingGame, 'id'>) {
    const id = this.next_id++;
    const pending_game: PendingGame = { ...game, id: id.toString() }
    this._pending_games.push(pending_game)
    return ServerResponse.ok(pending_game)
  }

  async delete_pending(id: string): Promise<ServerResponse<null, StoreError>> {
    const index = this._pending_games.findIndex(g => g.id === id)
    if (index !== -1) {
      this._pending_games.splice(index, 1)
    }
    return ServerResponse.ok(null)
  }

  update_pending(pending: PendingGame): Promise<ServerResponse<PendingGame, StoreError>> {
    const index = this._pending_games.findIndex(g => g.id === pending.id)
    if (index === -1) {
      return ServerResponse.error(not_found(pending.id))
    }
    this._pending_games[index] = pending
    return ServerResponse.ok(pending)
  }
}