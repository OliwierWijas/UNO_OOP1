import { GameStore, CreateGameDTO, StoreError, CreatePlayerHandDTO, GamesNameDTO } from "./servermodel"
import { game, type Game } from "domain/src/model/Game"
import { ServerResponse } from "./response"
import { playerHand, type PlayerHand } from "domain/src/model/playerHand"
import { deck } from "domain/src/model/deck"
import { Card } from "domain/src/model/card"
import { Type } from "domain/src/model/types"
import { DiscardPile } from "domain/src/model/discardPile"
import { Round } from "domain/src/model/round"

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
    targetGame.currentRound?.findDealer()

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

  async play_card(gameName: string, index: number): Promise<ServerResponse<boolean, StoreError>> {
    const targetGame = this._games.find(g => g.name === gameName);
    if (!targetGame) {
      return ServerResponse.error(not_found(gameName));
    }

    const currentPlayer = targetGame.currentRound?.currentPlayer
    if (!currentPlayer) {
      return ServerResponse.error(not_found(currentPlayer));
    }

    const card = currentPlayer.playerCards[index]

    const cardCanBePut = targetGame.currentRound?.putCard(card) ?? false

    if (cardCanBePut) {
      currentPlayer.playCard(index)
    }

    return ServerResponse.ok(cardCanBePut);
  }

  async get_current_player(gameName: string): Promise<ServerResponse<PlayerHand, StoreError>> {
    const targetGame = this._games.find(g => g.name === gameName);
    if (!targetGame) {
      return ServerResponse.error(not_found(gameName));
    }

    const currentPlayer = targetGame.currentRound?.currentPlayer
    if (!currentPlayer) {
      return ServerResponse.error(not_found(currentPlayer));
    }

    return ServerResponse.ok(currentPlayer);
  }
  
  async get_discard_pile(gameName: string): Promise<ServerResponse<DiscardPile, StoreError>> {
    const targetGame = this._games.find(g => g.name === gameName);
    if (!targetGame) {
      return ServerResponse.error(not_found(gameName));
    }

    const currentRound = targetGame.currentRound
    if (!currentRound) {
      return ServerResponse.error(not_found(currentRound));
    }

    const discardPile = currentRound.discardPile

    return ServerResponse.ok(discardPile);
  }

   async round_won(gameName: string, round: Round): Promise<ServerResponse<void, StoreError>> {
    const targetGame = this._games.find((g) => g.name === gameName);
    if (!targetGame) {
      return ServerResponse.error(not_found(gameName));
    }

    const newDeck = deck();

    // This triggers next round logic — handled by domain/game.ts
    const winner = targetGame.nextRound(newDeck);

    // Optionally log or handle the winner
    if (winner) {
      console.log(`🎉 Round won by ${winner.playerName} with score ${winner.score}`);
    }

    return ServerResponse.ok(undefined);
  }
}