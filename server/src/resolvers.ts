import { API } from "./api"
import { CreateGameDTO, CreatePlayerHandDTO, GamesNameDTO } from "./servermodel"
import { GraphQLError } from "graphql"
import { PubSub } from "graphql-subscriptions"

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
      }
    }
  }
}