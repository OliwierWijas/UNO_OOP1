import { ApolloClient, gql, InMemoryCache, type DocumentNode, split, HttpLink, concat } from "@apollo/client/core";
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { type Game } from "domain/src/model/game";
import { type PlayerHand } from "domain/src/model/playerHand";
import type { Color, Digit, Type } from "domain/src/model/types";
import type { Card } from "domain/src/model/card";

export type SimpleGameDTO = {
  name: string
}

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

function mapCard(card: { type: string; color?: string; digit?: number | null }): Card<Type> {
  const type = card.type as Type;

  switch (type) {
    case 'NUMBERED':
      if (card.color === undefined) throw new Error("Missing color for NUMBERED card");
      if (card.digit === undefined || card.digit === null) throw new Error("Missing digit for NUMBERED card");
      return {
        type,
        color: card.color as Color,
        number: card.digit as Digit,
      };
    case 'SKIP':
    case 'REVERSE':
    case 'DRAW2':
      if (card.color === undefined) throw new Error(`Missing color for ${type} card`);
      return {
        type,
        color: card.color as Color,
      };
    case 'WILD':
    case 'DRAW4':
      return {
        type,
      };
    default:
      throw new Error(`Unknown card type: ${type}`);
  }
}


//Queries
export async function get_pending_games(): Promise<SimpleGameDTO[]> {
  const response = await query(gql`
    query GetPendingGames {
      get_pending_games {
        name
      }
    }
  `);
  const result = response.get_pending_games;
  return result.map((game: any) => ({
    name: game.name
  })) as SimpleGameDTO[];
}

export async function get_game_player_hands(gameName: string): Promise<PlayerHand[]> {
  const response = await query(gql`
    query GetGamePlayerHands($gameName: GameNameDTO!) {
      get_game_player_hands(gameName: $gameName) {
        playerName
        cards
        score
      }
    }
  `, {
    gameName: { name: gameName }
  });
  const result = response.get_game_player_hands;
  return result as PlayerHand[];
}
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

export async function create_player_hand(playerName: string, gameName: string): Promise<PlayerHand> {
  const response = await mutate(gql`
    mutation CreatePlayerHand($playerName: String!, $gameName: String!) {
      create_player_hand(playerHand: {
        playerName: $playerName,
        gameName: $gameName
      }) {
        playerName
        cards
        score
      }
    }
  `, { playerName, gameName });

  const result = response.create_player_hand;

  return {
    playerName: result.playerName,
    playerCards: result.cards || [],
    score: result.score || 0
  } as PlayerHand;
}

export async function start_game(gameName: string): Promise<Game> {
  const response = await mutate(gql`
    mutation StartGame($gameName: GameNameDTO!) {
      start_game(gameName: $gameName) {
        name
        state
        playerHands {
          playerName
          cards
          score
        }
      }
    }
  `, {
    gameName: { name: gameName }
  });

  const result = response.start_game;
  return result as Game;
}

export async function take_cards(gameName: string, playerName: string, numberOfCards: number): Promise<Card<Type>[]> {
  const response = await mutate(gql`
    mutation TakeCards($gameName: String!, $playerName: String!, $numberOfCards: Int!) {
      take_cards(takeCardsDTO: {
        gameName: $gameName,
        playerName: $playerName,
        numberOfCards: $numberOfCards
      }) {
        color
        digit
        type
      }
    }
  `, {
    gameName,
    playerName,
    numberOfCards
  });

  if (response.take_cards) {
    return response.take_cards.map(mapCard);
  }

  throw new Error("Server Error: " + response.error)
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

export async function onGamePlayerHandsUpdated(
  gameName: string,
  subscriber: (playerHands: PlayerHand[]) => void
) {
  const gamePlayerHandsSubscription = gql`
    subscription GamePlayerHandsSubscription($gameName: String!) {
      game_player_hands_updated(gameName: $gameName) {
        playerName
        cards
        score
      }
    }
  `;

  const observable = apolloClient.subscribe({
    query: gamePlayerHandsSubscription,
    variables: { gameName }
  });

  observable.subscribe({
    next({ data }) {
      if (data && data.game_player_hands_updated) {
        const playerHands: PlayerHand[] = data.game_player_hands_updated;
        subscriber(playerHands);
      }
    },
    error(err: any) {
      console.error('Game player hands subscription error:', err);
    }
  });
}

export async function onGameStarted(
  gameName: string,
  subscriber: (game: Game) => void
) {
  const gameStartedSubscription = gql`
    subscription GameStartedSubscription($gameName: String!) {
      game_started(gameName: $gameName) {
        name
        state
        playerHands {
          playerName
          cards
          score
        }
      }
    }
  `;

  const observable = apolloClient.subscribe({
    query: gameStartedSubscription,
    variables: { gameName }
  });

  observable.subscribe({
    next({ data }) {
      if (data && data.game_started) {
        const game: Game = data.game_started;
        subscriber(game);
      }
    },
    error(err: any) {
      console.error('Game started subscription error:', err);
    }
  });
}
