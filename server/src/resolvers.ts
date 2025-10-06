import { API } from "./api"
import { IndexedGame, PendingGame } from "./servermodel"
import { GraphQLError } from "graphql"
import { PubSub } from "graphql-subscriptions"

// Convert your game to GraphQL format
export function toGraphQLGame(game: IndexedGame): any {
  return {
    id: game.id,
    pending: false,
    rounds: game.rounds,
    currentRound: game.currentRound,
    isGameFinished: game.isGameFinished
  }
}

async function respond_with_error(err: any): Promise<never> {
  throw new GraphQLError(err.type)
}

export const create_resolvers = (pubsub: PubSub, api: API) => {
  return {
    Query: {
      async games() {
        const res = await api.games()
        return res.resolve({
          onSuccess: async games => games.map(toGraphQLGame),
          onError: respond_with_error
        })
      },
      async game(_: any, params: { id: string }) {
        const res = await api.game(params.id)
        return res.resolve({
          onSuccess: async game => toGraphQLGame(game),
          onError: async () => undefined
        })
      },
      async pending_games() {
        const res = await api.pending_games()
        return res.resolve({
          onSuccess: async games => games,
          onError: respond_with_error
        })
      },
      async pending_game(_: any, params: { id: string }) {
        const res = await api.pending_game(params.id)
        return res.resolve({
          onSuccess: async game => game,
          onError: async () => undefined
        })
      }
    },
    Mutation: {
      async new_game(_: any, params: { creator: string, number_of_players: number }) {
        const res = await api.new_game(params.creator, params.number_of_players)
        return res.resolve({
          onSuccess: async game => {
            if (game.pending)
              return game
            else
              return toGraphQLGame(game)
          },
          onError: respond_with_error
        })
      },
      async join(_: any, params: { id: string, player: string }) {
        const res = await api.join(params.id, params.player)
        return res.resolve({
          onSuccess: async game => {
            if (game.pending)
              return game
            else
              return toGraphQLGame(game)
          },
          onError: respond_with_error
        })
      },
      async draw_card(_: any, params: { id: string, player: string }) {
        const res = await api.draw_card(params.id, params.player)
        return res.resolve({
          onSuccess: async game => toGraphQLGame(game),
          onError: respond_with_error
        })
      },
      async play_card(_: any, params: { id: string, player: string, cardIndex: number }) {
        const res = await api.play_card(params.id, params.player, params.cardIndex)
        return res.resolve({
          onSuccess: async game => toGraphQLGame(game),
          onError: respond_with_error
        })
      }
    },
    GameOrPending: {
      __resolveType(obj: any) {
        if (obj.pending)
          return 'PendingGame'
        else
          return 'Game'
      }
    },
    Subscription: {
      game_updated: {
        subscribe: () => pubsub.asyncIterator(['ACTIVE_UPDATED'])
      },
      pending_updated: {
        subscribe: () => pubsub.asyncIterator(['PENDING_UPDATED'])
      }
    }
  }
}