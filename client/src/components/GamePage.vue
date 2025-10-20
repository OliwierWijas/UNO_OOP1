<script setup lang="ts">
import type { Card } from 'domain/src/model/card';
import { playerHand as createPlayerHand, type PlayerHand } from 'domain/src/model/playerHand';
import { useRoute } from 'vue-router';
import PlayerHandComponent from './PlayerHand.vue';
import OpponentHand from './OpponentHand.vue';
import Deck from './Deck.vue';
import DiscardPile from './DiscardPile.vue';
import TopInfoBar from './TopInfoBar.vue';
import RoundWinnerPopup from './RoundWinnerPopup.vue';
import type { Type } from 'domain/src/model/types';
import { reactive, onMounted, computed, ref } from 'vue';
import { round as createRound } from 'domain/src/model/round';
import * as api from "../model/uno-client";
import { usePlayerHandsStore } from '@/stores/PlayerHandsStore';
import { useOngoingGamesStore } from "@/stores/OngoingGamesStore"
import { useCurrentPlayerStore } from '@/stores/CurrentPlayerStore';
import { useDiscardPileStore } from '@/stores/DiscardPileStore';
import { discardPile as createDiscardPile } from "domain/src/model/discardPile"

const route = useRoute();
const playerHandsStore = usePlayerHandsStore();
const ongoingGamesStore = useOngoingGamesStore();
const currentPlayerStore = useCurrentPlayerStore()
const discardPileStore = useDiscardPileStore();

const gameName = (route.query.gameName as string) || 'DefaultGame';
const playerName = (route.query.playerName as string) || 'Player';

const playerHand = reactive(createPlayerHand(playerName));
const opponents = reactive<ReturnType<typeof createPlayerHand>[]>([]);
const currentRound = reactive(createRound([playerHand, ...opponents]));

const isLoading = ref(false);
const gameStarted = ref(false);
let hasTakenInitialCards = false

const canStartGame = computed(() => {
  return playerHandsStore.playerHands.length > 1 && !gameStarted.value;
});

const roundWinner = ref<{ winner: string; score: number } | null>(null);

function setupPlayerHandsSubscription() {
  api.onGamePlayerHandsUpdated(gameName, (playerHands) => {
    playerHandsStore.update(playerHands);
    updatePlayerHands(playerHands);
  });
}

function setupGameStartedSubscription() {
  api.onGameStarted(gameName, (game) => {
    gameStarted.value = true;
    ongoingGamesStore.addGame(game);
    initializeGameComponents();
  });
}

function setupCurrentPlayerSubscription() {
  api.onCurrentPlayerUpdated(gameName, (playerName) => {
    currentPlayerStore.set(playerName);
    currentRound.currentPlayer = createPlayerHand(playerName)
  });
}

function setupDiscardPileSubscription() {
  api.onDiscardPileUpdated(gameName, (cards) => {
    const discardPile = createDiscardPile()
    discardPile.pile = cards
    discardPileStore.set(discardPile);
  });
}

function updatePlayerHands(playerHands: any[]) {
  opponents.length = 0;
  playerHands.forEach(hand => {
    if (hand.playerName === playerName) {
      // update mutable state, do NOT overwrite getters
      playerHand.playerCards = hand.playerCards;
      // if you have any mutable field like "name", update it
      // playerHand.name = hand.playerName
    } else {
      const opponent = createPlayerHand(hand.playerName);
      opponent.playerCards = hand.playerCards; // only update mutable
      opponents.push(opponent);
    }
  });
  const allPlayers = [playerHand, ...opponents];
  const currentPlayer = currentRound.currentPlayer;
  Object.assign(currentRound, createRound(allPlayers));
  currentRound.currentPlayer = currentPlayer;
}

async function startGame() {
  if (!canStartGame.value || isLoading.value) return;

  try {
    isLoading.value = true;
    await api.start_game(gameName);

  } catch (error) {
    console.error('Error starting game:', error);
    alert('Failed to start game. Please try again.');
  } finally {
    isLoading.value = false;
  }
}

async function initializeGameComponents() {
  if (!hasTakenInitialCards) {
    const cards = await api.take_cards(gameName, playerHand.playerName, 1)
    playerHand.takeCards(cards)
    hasTakenInitialCards = true
  }

  currentRound.nextPlayer();
}

function handleCardDrawn(card: Card<Type>) {
  if (!gameStarted.value) return;

  if (card) {
    playerHand.takeCards([card]);
  }
}

async function handleCardPlayed(payload: { cardIndex: number; card: Card<Type> }) {
  if (!gameStarted.value) return;

  const canBePut = await api.play_card(gameName, payload.cardIndex)

  if (!canBePut) {
    playerHand.putCardBack(payload.card, payload.cardIndex);
  }
}

async function loadInitialPlayerHands() {
  try {
    const initialPlayerHands = await api.get_game_player_hands(gameName);
    updatePlayerHands(initialPlayerHands);
    playerHandsStore.update(initialPlayerHands.map(mapPlayerHandToSubscription));

    const ongoingGame = ongoingGamesStore.getGame(gameName);
    if (ongoingGame) {
      gameStarted.value = true;
      initializeGameComponents();
    }
  } catch (error) {
    console.error('Error fetching initial player hands:', error);
  }
}

function mapPlayerHandToSubscription(hand: PlayerHand): api.PlayerHandSubscription {
  return {
    playerName: hand.playerName,
    numberOfCards: hand.playerCards?.length,
    score: hand.score
  };
}

function setupRoundWonSubscription() {
  console.log("the on round here")
  api.onRoundWon(gameName, (data) => {
    console.log(data)
    if (data.isFinished) {
      console.log(data)
      roundWinner.value = { winner: data.winner, score: data.winnerScore };
    }
  });
}

async function startNextRound() {
  if (!roundWinner.value) return;

  try {
    // Call round_won again to advance the round (or a dedicated "nextRound" mutation if you add it)
    await api.round_won(gameName);

    // Reset popup
    roundWinner.value = null;

    // Re-fetch player hands for the new round
    const initialPlayerHands = await api.get_game_player_hands(gameName);
    updatePlayerHands(initialPlayerHands);
  } catch (err) {
    console.error('Failed to start next round:', err);
  }
}

onMounted(async () => {
  await loadInitialPlayerHands();
  setupPlayerHandsSubscription();
  setupGameStartedSubscription();
  setupCurrentPlayerSubscription();
  setupDiscardPileSubscription();
  setupRoundWonSubscription();
});
</script>

<template>
  <div class="game-container">
    <RoundWinnerPopup
      v-if="roundWinner"
      :winner="roundWinner.winner"
      :score="roundWinner.score"
      @next-round="startNextRound"
    />
    
    <TopInfoBar />

    <!-- Start Game Button (shown before game starts) -->
    <div v-if="!gameStarted" class="start-game-section">
      <div class="waiting-message">
        <h2>Waiting to Start Game: {{ gameName }}</h2>
        <ul class="player-list">
          <li v-for="hand in playerHandsStore.playerHands" :key="hand.playerName">
            {{ hand.playerName }}
          </li>
        </ul>

        <button
          v-if="canStartGame"
          @click="startGame"
          :disabled="!canStartGame || isLoading"
          class="start-game-button"
          :class="{ 'disabled': !canStartGame || isLoading }"
        >
          {{ isLoading ? 'Starting...' : 'Start Game' }}
        </button>
        <div v-if="!canStartGame" class="warning-message">
          Need at least 2 players to start the game
        </div>
      </div>
    </div>
    <template v-else>
      <template v-if="opponents.length > 0">
        <OpponentHand
          v-if="opponents.length === 1"
          :opponent="opponents[0]"
          class="opponent-left"
        />

        <template v-else-if="opponents.length === 2">
          <OpponentHand :opponent="opponents[0]" class="opponent-left" />
          <OpponentHand :opponent="opponents[1]" class="opponent-right" />
        </template>

        <template v-else-if="opponents.length === 3">
          <OpponentHand :opponent="opponents[0]" class="opponent-left" />
          <OpponentHand :opponent="opponents[1]" class="opponent-right" />
          <OpponentHand :opponent="opponents[2]" class="opponent-top" />
        </template>

        <template v-else-if="opponents.length >= 4">
          <div class="opponent-left column">
            <OpponentHand :opponent="opponents[0]" />
            <OpponentHand :opponent="opponents[1]" />
          </div>
          <div class="opponent-right column">
            <OpponentHand :opponent="opponents[2]" />
            <OpponentHand :opponent="opponents[3]" />
          </div>
        </template>
      </template>

      <div class="center-area">
        <DiscardPile />
        <Deck @card-drawn="handleCardDrawn" :game-name="gameName" :player-name="playerName"/>
      </div>

      <PlayerHandComponent :playerHand="playerHand" @card-played="handleCardPlayed" />
    </template>
  </div>
</template>

<style scoped>
.game-container {
  font-family: 'Trebuchet MS', sans-serif;
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background: radial-gradient(circle, #6e91c2ff 0%, #0956bf 100%);
  background-size: cover;
}

.start-game-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
  text-align: center;
}

.waiting-message {
  background: rgba(0, 0, 0, 0.7);
  padding: 2rem;
  border-radius: 1rem;
  backdrop-filter: blur(10px);
}

.player-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

.player-list li {
  padding: 0.5rem;
  margin: 0.25rem 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}

.start-game-button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border-radius: 0.5rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.start-game-button:hover:not(.disabled) {
  background: #45a049;
  transform: scale(1.05);
}

.start-game-button.disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
}

.waiting-for-host {
  margin-top: 1rem;
  font-style: italic;
}

.warning-message {
  color: #ff6b6b;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.center-area {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 5vh;
}

.opponent-top {
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
}

.opponent-left {
  position: absolute;
  top: 35%;
  left: 5%;
}

.opponent-right {
  position: absolute;
  top: 35%;
  right: 5%;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
