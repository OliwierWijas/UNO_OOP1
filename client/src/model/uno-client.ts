import { ApolloClient, gql, InMemoryCache, type DocumentNode, split, HttpLink, concat } from "@apollo/client/core";
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { type Game } from "domain/src/model/game";
import { type PlayerHand } from "domain/src/model/playerHand";
import type { Type } from "domain/src/model/types";
import type { Card } from "domain/src/model/card";
import { mapCard } from "domain/src/utils/card_mapper"

export type SimpleGameDTO = {
  name: string
}

export type PlayerHandSubscription = {
  playerName: string,
  numberOfCards: number,
  score: number
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

export async function play_card(gameName: string, index: number): Promise<boolean> {
  console.log(gameName)
  console.log(index)
  const response = await mutate(gql`
    mutation PlayCard($gameName: String!, $index: Int!) {
      play_card(playCard: {
        gameName: $gameName,
        index: $index,
      })
    }
  `, {
    gameName,
    index
  });

  return response.play_card === true;
}

export async function round_won(gameName: string): Promise<{ isFinished: boolean; winner: string; winnerScore: number }> {
  const response = await mutate(gql`
    mutation RoundWon($gameName: String!) {
      round_won(gameName: $gameName) {
        isFinished
        winner
        winnerScore
      }
    }
  `, { gameName });
  return response.round_won;
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
  subscriber: (playerHands: PlayerHandSubscription[]) => void
) {
  const gamePlayerHandsSubscription = gql`
    subscription GamePlayerHandsSubscription($gameName: String!) {
      game_player_hands_updated(gameName: $gameName) {
        playerName
        numberOfCards
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
        const playerHands: PlayerHandSubscription[] = data.game_player_hands_updated;
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

export async function onCurrentPlayerUpdated(
  gameName: string,
  subscriber: (playerName: string) => void
) {
  const currentPlayerSubscription = gql`
    subscription CurrentPlayerUpdated($gameName: String!) {
      current_player_updated(gameName: $gameName)
    }
  `;

  const observable = apolloClient.subscribe({
    query: currentPlayerSubscription,
    variables: { gameName }
  });

  observable.subscribe({
    next({ data }) {
      if (data && data.current_player_updated) {
        subscriber(data.current_player_updated);
      }
    },
    error(err) {
      console.error("Current player subscription error:", err);
    }
  });
}

export async function onDiscardPileUpdated(
  gameName: string,
  subscriber: (cards: Card<Type>[]) => void
) {
  const discardPileSubscription = gql`
    subscription DiscardPileUpdated($gameName: String!) {
      discard_pile_updated(gameName: $gameName) {
        color
        digit
        type
      }
    }
  `;

  const observable = apolloClient.subscribe({
    query: discardPileSubscription,
    variables: { gameName }
  });

  observable.subscribe({
    next({ data }) {
      if (data && data.discard_pile_updated) {
        const cards = data.discard_pile_updated.map(mapCard);
        subscriber(cards);
      }
    },
    error(err: any) {
      console.error("Discard pile subscription error:", err);
    }
  });
}

export async function onRoundWon(
  gameName: string,
  subscriber: (data: { isFinished: boolean; winner: string; winnerScore: number }) => void
) {
  const roundWonSubscription = gql`
    subscription RoundWonSubscription($gameName: String!) {
      round_won(gameName: $gameName) {
        isFinished
        winner
        winnerScore
      }
    }
  `;

  const observable = apolloClient.subscribe({
    query: roundWonSubscription,
    variables: { gameName },
  });

  observable.subscribe({
    next({ data }) {
      if (data && data.round_won) subscriber(data.round_won);
    },
    error(err: any) {
      console.error("Round won subscription error:", err);
    },
  });
}