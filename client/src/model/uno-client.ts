import { ApolloClient, gql, InMemoryCache, type DocumentNode, split, HttpLink } from "@apollo/client/core";
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { type Game } from "domain/src/model/game";

export type SimpleGameDTO = {
  name: string
}

// Conversion functions
/*export function from_graphql_game({ id, rounds, currentRound, isGameFinished }: GraphQLGame): IndexedGame {
  // Convert GraphQL game to client domain game
  // You'll need to reconstruct the game state from GraphQL data
  const playerHands = currentRound?.playerHands?.map((ph: any) =>
    playerHand(ph.playerName, ph.playerCards || [])
  ) || [];

  const clientGame = createGame(playerHands);

  // Create the indexed game with domain game properties
  const indexedGame: IndexedGame = {
    ...clientGame,
    id,
    pending: false,
    // Copy any additional properties that might be needed
    rounds: rounds || [],
    currentRound: currentRound || null,
    isGameFinished: isGameFinished || false
  };

  return indexedGame;
}*/

const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:4000/graphql',
}))

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql'
})

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink,
)

const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
})

async function query(query: DocumentNode, variables?: Object): Promise<any> {
  const result = await apolloClient.query({ query, variables, fetchPolicy: 'network-only' })
  return result.data
}

async function mutate(mutation: DocumentNode, variables?: Object): Promise<any> {
  const result = await apolloClient.mutate({ mutation, variables, fetchPolicy: 'network-only' })
  return result.data
}

//Queries

// Mutations
export async function create_game(name: string): Promise<Game> {
  const response = await mutate(gql`
    mutation create_game($name: String!) {
      create_game(game: { name: $name }) {
        name
      }
    }
  `, { name });

  const result = response.create_game;

  return { name: result.name } as Game;
}

// Subscriptions
export async function onPendingGamesUpdated(subscriber: (games: SimpleGameDTO[]) => void) {
  const pendingGamesSubscription = gql`subscription PendingGamesSubscription {
    pending_games_updated {
      name
    }
  }`
  const observable = apolloClient.subscribe({ query: pendingGamesSubscription })
  observable.subscribe({
    next({data}) {
      if (data && data.pending_games_updated) {
        const pendingGames: SimpleGameDTO[] = data.pending_games_updated
        subscriber(pendingGames)
      }
    },
    error(err: any) {
      console.error(err)
    }
  })
}




























/*
export async function onPendingUpdated(subscriber: (pending: IndexedPendingGame) => any) {
  const pendingSubscriptionQuery = gql`subscription PendingSubscription {
    pending_updated {
      id
      creator
      number_of_players
      players
    }
  }`
  const pendingObservable = apolloClient.subscribe({ query: pendingSubscriptionQuery })
  pendingObservable.subscribe({
    next({data}) {
      const pending: IndexedPendingGame = {
        ...data.pending_updated,
        pending: true
      }
      subscriber(pending)
    },
    error(err: any) {
      console.error(err)
    }
  })
}

// Queries
export async function games(): Promise<IndexedGame[]> {
  const response = await query(gql`{
    games {
      id
      rounds
      currentRound
      isGameFinished
    }
  }`)
  return response.games.map(from_graphql_game)
}

export async function game(id: string): Promise<IndexedGame | undefined> {
  const response = await query(gql`
    query Game($id: String!) {
      game(id: $id) {
        id
        rounds
        currentRound
        isGameFinished
      }
    }`, {id})
  if (response.game === undefined)
    return undefined
  return from_graphql_game(response.game)
}

export async function pending_games(): Promise<IndexedPendingGame[]> {
  const response = await query(gql`{
    pending_games {
      id
      creator
      number_of_players
      players
    }
  }`)
  return response.pending_games.map((g: any) => ({...g, pending: true}))
}

export async function pending_game(id: string): Promise<IndexedPendingGame | undefined> {
  const response = await query(gql`
    query PendingGame($id: String!) {
      pending_game(id: $id) {
        id
        creator
        number_of_players
        players
      }
    }`, {id})
  return response.pending_game ? {...response.pending_game, pending: true} : undefined
}

// Mutations


export async function join(id: string, player: string): Promise<IndexedGame | IndexedPendingGame> {
  const response = await mutate(gql`
    mutation Join($id: String!, $player: String!) {
      join(id: $id, player: $player) {
        ... on PendingGame {
          id
          creator
          number_of_players
          players
        }
        ... on Game {
          id
          rounds
          currentRound
          isGameFinished
        }
      }
    }`, { id, player })

  const result = response.join;
  if (result.pending) {
    return { ...result, pending: true };
  } else {
    return from_graphql_game(result);
  }
}

export async function draw_card(id: string, player: string): Promise<IndexedGame> {
  const response = await mutate(gql`
    mutation DrawCard($id: String!, $player: String!) {
      draw_card(id: $id, player: $player) {
        id
        rounds
        currentRound
        isGameFinished
      }
    }`, { id, player })
  return from_graphql_game(response.draw_card)
}

export async function play_card(id: string, player: string, cardIndex: number): Promise<IndexedGame> {
  const response = await mutate(gql`
    mutation PlayCard($id: String!, $player: String!, $cardIndex: Int!) {
      play_card(id: $id, player: $player, cardIndex: $cardIndex) {
        id
        rounds
        currentRound
        isGameFinished
      }
    }`, { id, player, cardIndex })
  return from_graphql_game(response.play_card)
}
*/