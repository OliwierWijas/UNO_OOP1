import { YahtzeeSpecs } from "domain/src/model/yahtzee.game";
import * as Game from "domain/src/model/yahtzee.game";
import { SlotKey } from "domain/src/model/yahtzee.slots";
import { Randomizer } from "domain/src/utils/random_utils";
import { ServerResponse } from "./response";

export interface IndexedYahtzee extends Game.Yahtzee {
  readonly id: string
  readonly pending: false
}

export type PendingGame = YahtzeeSpecs & {
  id: string,
  readonly pending: true
}

export type StoreError = { type: 'Not Found', key: any } | { type: 'DB Error', error: any }

export type ServerError = { type: 'Forbidden' } | StoreError

const Forbidden: ServerError = { type: 'Forbidden' } as const

export interface GameStore {
  games(): Promise<ServerResponse<IndexedYahtzee[], StoreError>>
  game(id: string): Promise<ServerResponse<IndexedYahtzee, StoreError>>
  add(game: IndexedYahtzee):  Promise<ServerResponse<IndexedYahtzee, StoreError>>
  update(game: IndexedYahtzee):  Promise<ServerResponse<IndexedYahtzee, StoreError>>
  
  pending_games(): Promise<ServerResponse<PendingGame[], StoreError>>
  pending_game(id: string): Promise<ServerResponse<PendingGame, StoreError>>
  add_pending(game: Omit<PendingGame, 'id'>): Promise<ServerResponse<PendingGame, StoreError>>
  delete_pending(id: string): Promise<ServerResponse<null, StoreError>>
  update_pending(pending: PendingGame): Promise<ServerResponse<PendingGame, StoreError>>
}

export class ServerModel {
  private store: GameStore
  private randomizer: Randomizer

  constructor(store: GameStore, randomizer: Randomizer) {
    this.store = store
    this.randomizer = randomizer
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
    const g = await this.store.add_pending({ creator, number_of_players, players: [], pending: true });
    return g.flatMap(game_1 => this.join(game_1.id, creator));
  }

  private startGameIfReady(pending_game: PendingGame): Promise<ServerResponse<IndexedYahtzee | PendingGame, StoreError>> {
    const id = pending_game.id
    if (pending_game.players.length === pending_game.number_of_players) {
      const game = Game.new_yahtzee({players: pending_game.players, randomizer: this.randomizer})
      this.store.delete_pending(id)
      return this.store.add({...game, id, pending: false})
    } else {
      return this.store.update_pending(pending_game)
    }
  }

  async join(id: string, player: string) {
    const pending_game = await this.store.pending_game(id)
    pending_game.process(async game => game.players.push(player))
    return pending_game.flatMap(g => this.startGameIfReady(g))
  }

  reroll(id: string, held: number[], player: string): Promise<ServerResponse<IndexedYahtzee, ServerError>> {
    return this.update(id, player, async game => game.reroll(held))
  }
  
  register(id: string, slot: SlotKey, player: string): Promise<ServerResponse<IndexedYahtzee, ServerError>> {
    return this.update(id, player, async game => game.register(slot))
  }
  
  private async update(id: string, player: string, processor: (game: IndexedYahtzee) => Promise<unknown>)
      : Promise<ServerResponse<IndexedYahtzee, ServerError>> {
    let yahtzee: ServerResponse<IndexedYahtzee, ServerError> = await this.game(id)
    yahtzee = await yahtzee.filter(async game => game && game.playerInTurn() === player, async _ => Forbidden)
    yahtzee.process(processor)
    return yahtzee.flatMap(async game => this.store.update(game));
  }
}
