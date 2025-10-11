import { API } from "./api"
import { CreateGameDTO } from "./servermodel"
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
    },

    Mutation: {
      async create_game(_: any, params: { game : CreateGameDTO }) {
        const res = await api.create_game(params.game)
        return res.resolve({
          onSuccess: async game => game,
          onError: respond_with_error
        })
      },
    },

    Subscription: {
      pending_games_updated: {
        subscribe: () => pubsub.asyncIterator(['PENDING_GAMES'])
      }
    }
  }
}