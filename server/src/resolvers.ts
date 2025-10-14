import { API } from "./api"
import { CreateGameDTO, CreatePlayerHandDTO, GamesNameDTO, PlayCardDTO, TakeCardsDTO } from "./servermodel"
import { GraphQLError } from "graphql"
import { PubSub } from "graphql-subscriptions"
import { mapCard } from "domain/src/utils/card_mapper"

async function respond_with_error(err: any): Promise<never> {
  throw new GraphQLError(err.type)
}

export const create_resolvers = (pubsub: PubSub, api: API) => {
  return {
    Query: {
      async get_games() {
        const res = await api.get_games()
        return res.resolve({
          onSuccess: async games => games,
          onError: respond_with_error
        })
      },
      async get_pending_games() { 
        const res = await api.get_pending_games()
        return res.resolve({
          onSuccess: async games => games,
          onError: respond_with_error
        })
      },
      async get_game_player_hands(_: any, params: { gameName: GamesNameDTO }) {
        const res = await api.get_game_player_hands(params.gameName)
        return res.resolve({
          onSuccess: async playerHands => playerHands,
          onError: respond_with_error
       })
      }
    },

    Mutation: {
      async create_game(_: any, params: { game : CreateGameDTO }) {
        const res = await api.create_game(params.game)
        return res.resolve({
          onSuccess: async game => game,
          onError: respond_with_error
        })
      },
      async create_player_hand(_: any, params: { playerHand : CreatePlayerHandDTO }){
        const res = await api.create_player_hand(params.playerHand)
        return res.resolve({
          onSuccess: async playerHand => playerHand,
          onError: respond_with_error
        })
      },
      async start_game(_: any, params: { gameName: GamesNameDTO }) {
        const res = await api.start_game(params.gameName);
        return res.resolve({
          onSuccess: async game => game,
          onError: respond_with_error
        });
      },
      async take_cards(_: any, params: { takeCardsDTO: TakeCardsDTO }) {
        const res = await api.take_cards(
          params.takeCardsDTO.gameName,
          params.takeCardsDTO.playerName,
          params.takeCardsDTO.numberOfCards
        );
        return res.resolve({
          onSuccess: async (cards) => {
            return cards.map(card => ({
              color: 'color' in card ? card.color : null,
              digit: card.type === 'NUMBERED' ? card.number : null,
              type: card.type
            }));
          },
          onError: respond_with_error
        });
      },
      async play_card(_: any, params: { playCard: PlayCardDTO }) {
        const card = mapCard({ type: params.playCard.type, color: params.playCard.color, digit: params.playCard.digit })
        const res = await api.play_card(params.playCard.gameName, card);
        return res.resolve({
          onSuccess: async cardPlayed => cardPlayed,
          onError: respond_with_error
        });
      },
    },

    Subscription: {
      pending_games_updated: {
        subscribe: () => pubsub.asyncIterableIterator(['PENDING_GAMES']),
        resolve: (payload: any) => payload.games 
      },

      game_player_hands_updated : {
        subscribe: (_: any, params: { gameName: string }) => 
          pubsub.asyncIterableIterator([`GAME_PLAYER_HANDS_${params.gameName}`]),
        resolve: (payload: any) => payload.playerHands
      },
      
      game_started: {
        subscribe: (_: any, params: { gameName: string }) => 
          pubsub.asyncIterableIterator([`GAME_STARTED_${params.gameName}`]),
        resolve: (payload: any) => payload.game
      },

      current_player_updated: {
        subscribe: (_: any, { gameName }: { gameName: string }) =>
          pubsub.asyncIterableIterator([`CURRENT_PLAYER_${gameName}`]),
        resolve: (payload: any) => payload.playerName
      },

      discard_pile_updated: {
        subscribe: () => pubsub.asyncIterableIterator(['DISCARD_PILE']),
        resolve: (payload: any) => payload.cards 
      },
    }
  }
}