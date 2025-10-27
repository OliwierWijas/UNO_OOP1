import { GraphQLClient, gql } from "graphql-request";

const client = new GraphQLClient("http://localhost:4000/graphql");

async function testRoundSimulation() {
  const gameName = "TestGameConsole";
  const players = ["Alice", "Bob"];

  // 1️⃣ Create game
  const createGame = gql`
    mutation CreateGame($name: String!) {
      create_game(game: { name: $name }) {
        name
      }
    }
  `;
  const game = await client.request(createGame, { name: gameName });
  console.log("Game created:", game.create_game.name);

  // 2️⃣ Create players
  const createPlayerHand = gql`
    mutation CreatePlayerHand($playerName: String!, $gameName: String!) {
      create_player_hand(playerHand: { playerName: $playerName, gameName: $gameName }) {
        playerName
        cards
        score
      }
    }
  `;
  for (const player of players) {
    const hand = await client.request(createPlayerHand, { playerName: player, gameName });
    console.log(`Player added: ${hand.create_player_hand.playerName}`);
  }

  // 3️⃣ Start game
  const startGame = gql`
    mutation StartGame($gameName: String!) {
      start_game(gameName: { name: $gameName }) {
        name
        state
      }
    }
  `;
  const startedGame = await client.request(startGame, { gameName });
  console.log("Game started:", startedGame.start_game.name);

  // 4️⃣ Give each player 5 cards
  const takeCards = gql`
    mutation TakeCards($gameName: String!, $playerName: String!, $numberOfCards: Int!) {
      take_cards(takeCardsDTO: { gameName: $gameName, playerName: $playerName, numberOfCards: $numberOfCards }) {
        color
        digit
        type
      }
    }
  `;
  for (const player of players) {
    const cards = await client.request(takeCards, { gameName, playerName: player, numberOfCards: 1 });
    console.log(`${player} took ${cards.take_cards.length} cards`);
  }

  // 5️⃣ Simulate first card played by each player
  const playCard = gql`
    mutation PlayCard($gameName: String!, $index: Int!) {
      play_card(playCard: { gameName: $gameName, index: $index })
    }
  `;
  for (const player of players) {
    const played = await client.request(playCard, { gameName, index: 0 });
    console.log(`${player} played a card: ${played.play_card}`);
  }

  // 6️⃣ Check round winner
  const roundWon = gql`
    mutation RoundWon($gameName: String!) {
      round_won(gameName: $gameName) {
        isFinished
        winner
        winnerScore
      }
    }
  `;
  const result = await client.request(roundWon, { gameName });
  console.log("Round finished (mutation):", result.round_won);
}

testRoundSimulation().catch(console.error);
