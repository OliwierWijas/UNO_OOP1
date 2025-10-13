import { GameStore, CreateGameDTO, StoreError, CreatePlayerHandDTO, GamesNameDTO } from "./servermodel"
import { game, type Game } from "domain/src/model/Game"
import { ServerResponse } from "./response"
import { playerHand, type PlayerHand } from "domain/src/model/playerHand"
import { deck } from "domain/src/model/deck"
import { Card } from "domain/src/model/card"
import { Type } from "domain/src/model/types"

const not_found = (key: any): StoreError => ({ type: 'Not Found', key })

const game_full = (key: any): StoreError => ({ type: 'Game has too much Players', key })
export class MemoryStore implements GameStore {
  private _games: Game[]

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

  async get_initial_game_player_hands(gamesName : GamesNameDTO) {
    const targetGame = this._games.find(g => g.name === gamesName.name);

    if (!targetGame) {
      return ServerResponse.error(not_found(gamesName.name));
    }
    return ServerResponse.ok(targetGame.playerHands);
  }

  async create_game(dto: CreateGameDTO) : Promise<ServerResponse<Game, StoreError>> {
    const newGame = game(dto.name)
    this._games.push(newGame)
    return ServerResponse.ok(newGame)
  }

  async create_player_hand(dto : CreatePlayerHandDTO): Promise<ServerResponse<PlayerHand, StoreError>> {
    const targetGame = this._games.find(g => g.name === dto.gameName);
    if (!targetGame) {
      return ServerResponse.error(not_found(dto.gameName));
    }
    if(targetGame.playerHands.length >=4) {
      return ServerResponse.error(game_full(dto.gameName));
    }
    const newPlayerHand = playerHand(dto.playerName);
    targetGame.joinGame(newPlayerHand);
    return ServerResponse.ok(newPlayerHand);
  }

  async get_game_player_hands(gamesName : GamesNameDTO): Promise<ServerResponse<PlayerHand[], StoreError>> {
    const targetGame = this._games.find(g => g.name === gamesName.name);

    if (!targetGame) {
      return ServerResponse.error(not_found(gamesName.name));
    }
    return ServerResponse.ok(targetGame.playerHands);
  }

  async start_game(gamesName : GamesNameDTO) : Promise<ServerResponse<Game, StoreError>>{
     const targetGame = this._games.find(g => g.name === gamesName.name);
    if (!targetGame) {
      return ServerResponse.error(not_found(gamesName.name));
    }

    const newDeck = deck();

    targetGame.startGame(newDeck);
    return ServerResponse.ok(targetGame);
  }

  async take_cards(gameName: string, playerName: string, number: number): Promise<ServerResponse<Card<Type>[], StoreError>> {
    const targetGame = this._games.find(g => g.name === gameName);
    if (!targetGame) {
      return ServerResponse.error(not_found(gameName));
    }

    const player = targetGame.playerHands.find(p => p.playerName === playerName)
    if (!player) {
      return ServerResponse.error(not_found(playerName));
    }

    const deck = targetGame.currentRound?.deck
    
    let cards: Card<Type>[] = [];
    if (deck) {
      cards = deck.drawCards(number)
    }

    player.takeCards(cards)
    return ServerResponse.ok(cards)
  }
}