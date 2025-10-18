import { GraphQLClient, gql } from "graphql-request";

const client = new GraphQLClient("http://localhost:4000/graphql");

async function testRoundWon() {
  const gameName = "TestGameConsole";

  // Create game
  const createGame = gql`
    mutation CreateGame($name: String!) {
      create_game(game: { name: $name }) {
        name
      }
    }
  `;
  const game = await client.request(createGame, { name: gameName });
  console.log("Game created:", game.create_game.name);

  // Call round_won with just a string
  const roundWon = gql`
    mutation RoundWon($gameName: String!) {
      round_won(gameName: $gameName) {
        isFinished
        winner
        winnerScore
      }
    }
  `;

  const variables = { gameName };

  const result = await client.request(roundWon, variables);
  console.log("Round finished (mutation):", result.round_won);
}

testRoundWon().catch(console.error);
