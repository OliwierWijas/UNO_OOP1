import { GameStore, CreateGameDTO, StoreError } from "./servermodel"
import { game, type Game } from "domain/src/model/Game"
import { ServerResponse } from "./response"

const not_found = (key: any): StoreError => ({ type: 'Not Found', key })

export class MemoryStore implements GameStore {
  private _games: Game[]
  private next_id: number = 1

  constructor(...games: Game[]) {
    this._games = [...games]
  }

  async get_games() {
    return ServerResponse.ok([...this._games])
  }

  async get_pending_games() {
    const pendingGames = this._games
      .filter(g => g.state === "PENDING")
      .map(g => ({
        name: g.name,
      }) as CreateGameDTO);

    return ServerResponse.ok(pendingGames);
  }

  async create_game(dto: CreateGameDTO) : Promise<ServerResponse<Game, StoreError>> {
    const newGame = game(dto.name)

    this._games.push(newGame)
    return ServerResponse.ok(newGame)
  }
}