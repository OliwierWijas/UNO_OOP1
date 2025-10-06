<script setup lang="ts">
import type { Card } from '@/model/card';
import { playerHand as createPlayerHand } from '@/model/playerHand';
import { useRoute } from 'vue-router';
import PlayerHand from './PlayerHand.vue';
import OpponentHand from './OpponentHand.vue';
import Deck from './Deck.vue';
import DiscardPile from './DiscardPile.vue';
import TopInfoBar from './TopInfoBar.vue';
import type { Type } from '@/model/types';
import { reactive } from 'vue';
import { round as createRound } from '@/model/round';
import { deck as createDeck } from '@/model/deck';
import { discardPile as createDiscardPile } from '@/model/discardPile';

const route = useRoute();

const gameDeck = createDeck();
gameDeck.shuffle();

const discardPile = reactive(createDiscardPile());

const playerName = (route.query.name as string) || 'Player';
const playerHand = reactive(createPlayerHand(playerName, []));

// Example setup: you + 3 AI opponents
const opponents = [
  reactive(createPlayerHand('Alice', [])),
  reactive(createPlayerHand('Bob', [])),
  reactive(createPlayerHand('Charlie', [])),
  reactive(createPlayerHand('Diana', [])), 
];

const currentRound = reactive(createRound([playerHand, ...opponents], gameDeck, discardPile));

// temporary for testing
currentRound.nextPlayer();

function handleCardDrawn(card: Card<Type>) {
  playerHand.takeCards([card]);
}

function handleCardPlayed(payload: { cardIndex: number; card: Card<Type> }) {
  if (!currentRound.putCard(payload.card)) {
    currentRound.currentPlayer?.putCardBack(payload.card, payload.cardIndex);
  }
}
</script>

<template>
  <div class="game-container">
    <TopInfoBar :players="[playerHand, ...opponents]" />

    <OpponentHand
      v-if="opponents.length === 1"
      :opponent="opponents[0]"
      class="opponent-top"
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

    <template v-else-if="opponents.length === 4">
      <div class="opponent-left column">
        <OpponentHand :opponent="opponents[0]" />
        <OpponentHand :opponent="opponents[1]" />
      </div>
      <div class="opponent-right column">
        <OpponentHand :opponent="opponents[2]" />
        <OpponentHand :opponent="opponents[3]" />
      </div>
    </template>

    <div class="center-area">
      <DiscardPile :discardPile="discardPile" />
      <Deck @card-drawn="handleCardDrawn" :deck="gameDeck" />
    </div>

    <PlayerHand :playerHand="playerHand" @card-played="handleCardPlayed" />
  </div>
</template>

<style scoped>
.game-container {
  position: fixed;
  inset: 0; 
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background: radial-gradient(circle, #6e91c2ff 0%, #0956bf 100%);
  background-size: cover;
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
  top: 10%;
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
