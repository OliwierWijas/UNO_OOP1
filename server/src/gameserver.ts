import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'

import express from 'express';
import bodyParser from 'body-parser'
import http from 'http';
import {promises as fs} from "fs"
import { WebSocketServer } from 'ws'

import { GameStore, IndexedYahtzee, PendingGame } from './servermodel'
import { from_memento, IndexedMemento } from './memento'
import { standardRandomizer } from 'domain/src/utils/random_utils'
import { create_api } from './api'
import { MongoStore } from './mongostore'
import { MemoryStore } from './memorystore'
import cors from 'cors'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { useServer } from 'graphql-ws/use/ws'
import { PubSub } from 'graphql-subscriptions'
import { create_resolvers, toGraphQLGame } from './resolvers'

const game0: IndexedMemento = {
  id: '0',
  players: ['Alice', 'Bob'],
  playerInTurn: 0,
  roll: [1, 2, 3, 2, 4],
  rolls_left: 2,
  scores:[
    {
      [1]: 3,
      [2]: undefined,
      [3]: undefined,
      [4]: 12,
      [5]: 15,
      [6]: 18,
      'pair': 12,
      'two pairs': 22,
      'three of a kind': 15,
      'four of a kind': 16,
      'full house': 27,
      'small straight': 0,
      'large straight': 20,
      'chance': 26,
      'yahtzee': 0
    },
    {
      [1]: 3,
      [2]: undefined,
      [3]: 12,
      [4]: 12,
      [5]: 20,
      [6]: 18,
      'pair': 10,
      'two pairs': 14,
      'three of a kind': 12,
      'four of a kind': 8,
      'full house': 18,
      'small straight': 0,
      'large straight': 0,
      'chance': 22,
      'yahtzee': undefined
    }
  ],
  pending: false
}

async function startServer(store: GameStore) {
  const pubsub: PubSub = new PubSub()
  const broadcaster = {
    async send(game: PendingGame | IndexedYahtzee) {
      if (game.pending) {
        pubsub.publish('PENDING_UPDATED', {pending: game})
      } else {
        pubsub.publish('ACTIVE_UPDATED', {active: toGraphQLGame(game)})
      }
    }
  }
  const api = create_api(broadcaster, store, standardRandomizer)

  try {
      const content = await fs.readFile('./yahtzee.sdl', 'utf8')
      const typeDefs = `#graphql
        ${content}`
      const resolvers = create_resolvers(pubsub, api)
      
      const app = express()
      app.use('/graphql', bodyParser.json())

      app.use(cors({
        origin: /:\/\/localhost:/,
        methods: ['GET', 'POST', 'OPTIONS']
      }))
      
      const httpServer = http.createServer(app)

      const schema = makeExecutableSchema({typeDefs, resolvers})

      const wsServer = new WebSocketServer({
        server: httpServer
      })

      const subscriptionServer = useServer({ schema }, wsServer)

      const server = new ApolloServer({
        schema,
        plugins: [
          ApolloServerPluginDrainHttpServer({ httpServer }),
          {
            async serverWillStart() {
              return {
                drainServer: async () => subscriptionServer.dispose()
              }
            }
          }
        ],
      })
      await server.start()
      app.use('/graphql', expressMiddleware(server))
      
      httpServer.listen({ port: 4000 }, () => console.log(`GraphQL server ready on http://localhost:4000/graphql`))
  } catch (err) {
      console.error(`Error: ${err}`)
  }
}

function configAndStart() {
  const mongoIndex = process.argv.indexOf('--mongodb')
  if (mongoIndex !== -1) {
    const connectionString = process.argv[mongoIndex + 1]
    if (!connectionString)
      throw new Error('--mongodb needs connection string')
    const dbNameIndex = process.argv.indexOf('--dbname')
    const dbName = dbNameIndex !== -1? process.argv[dbNameIndex + 1] : 'test'
    startServer(MongoStore(connectionString, dbName, standardRandomizer))
  } else
    startServer(new MemoryStore(from_memento(game0, standardRandomizer)))
}

configAndStart()
