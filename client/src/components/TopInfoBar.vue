<script setup lang="ts">
import { useCurrentPlayerStore } from '@/stores/CurrentPlayerStore';
import { usePlayerHandsStore } from '@/stores/PlayerHandsStore'

const playerHandsStore = usePlayerHandsStore();
const currentPlayerStore = useCurrentPlayerStore()

</script>

<template>
  <div class="topbar-container">
    <div class="round">
        <!-- add round number as paramiter later -->
      Round 1
    </div>
    <div class="round">
      Current player: {{ currentPlayerStore.currentPlayer }}
    </div>
    <div class="players-row">
      <div
        v-for="hand in playerHandsStore.playerHands"
        :key="hand.playerName"
        class="player-container"
      >
        <div class="name">{{ hand.playerName }}</div>
        <div class="score">Score: {{ hand.score }}</div>
        <div class="cards-number">Cards: {{ hand.numberOfCards }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.topbar-container {
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column; /* stack round + players */
  align-items: center;    /* center everything horizontally */
  padding: 10px;
  border-radius: 0 0 30px 30px;
  min-width : 50vw;
  width: fit-content;
}

.round {
  font-family: 'Trebuchet MS', sans-serif;
  font-weight: 900;
  font-size: 15px;
  margin-bottom: 10px;
  color : #ffffffff
}

.players-row {
  display: flex;
  gap: 30px;
  justify-content: center;
}

.player-container {
  text-align: center;
}

.name {
  font-family: 'Trebuchet MS', sans-serif;
  font-weight: bold;
  font-size: 15px;
  color : #ffffffff
}

.score,
.cards-number {
  font-family: 'Trebuchet MS', sans-serif;
  margin-top: 5px;
   font-size: 12px;
    color : #ffffffff
}
</style>
