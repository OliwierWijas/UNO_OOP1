import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import express from 'express'
import bodyParser from 'body-parser'
import http from 'http'
import { WebSocketServer } from 'ws'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { useServer } from 'graphql-ws/lib/use/ws'
import { PubSub } from 'graphql-subscriptions'
import cors from 'cors'
import { MemoryStore } from './memorystore'
import { create_api } from './api'
import { create_resolvers } from './resolvers'
import { readFileSync } from 'fs'
import { CreateGameDTO, DiscardPileSubscription, PlayerHandSubscription } from './servermodel'
import type { Game } from 'domain/src/model/game'

const typeDefs = readFileSync('./src/uno.sdl', 'utf8')

async function startServer() {
  const pubsub = new PubSub()
  const store = new MemoryStore()
  const broadcaster = {
    async sendPendingGames(games: CreateGameDTO[]) {
      pubsub.publish('PENDING_GAMES', { games })
    },
    async sendPlayerHands(gameName: string, playerHands: PlayerHandSubscription[]) {
      await pubsub.publish(`GAME_PLAYER_HANDS_${gameName}`, { playerHands })
    },
    async sendGameStarted(gameName: string, game: Game) {
      await pubsub.publish(`GAME_STARTED_${gameName}`, { game });
    },
    async sendCurrentPlayer(gameName: string, playerName: string) {
      await pubsub.publish(`CURRENT_PLAYER_${gameName}`, { playerName });
    },
    async sendDiscardPile(gameName: string, cards: DiscardPileSubscription[]): Promise<void> {
      await pubsub.publish(`DISCARD_PILE_${gameName}`, { cards });
    }
  }
  const api = create_api(broadcaster, store)

  const app = express()
  const httpServer = http.createServer(app)

  const schema = makeExecutableSchema({ typeDefs, resolvers: create_resolvers(pubsub, api) })

  const wsServer = new WebSocketServer({
    server: httpServer,
  })

  const subscriptionServer = useServer({ schema }, wsServer)

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.dispose()
            }
          }
        }
      }
    ],
  })

  await server.start()

  app.use('/graphql', 
    cors(),
    bodyParser.json(),
    expressMiddleware(server)
  )

  httpServer.listen({ port: 4000 }, () => {
    console.log(`UNO GraphQL server ready at http://localhost:4000/graphql`)
  })
}

startServer().catch(console.error)