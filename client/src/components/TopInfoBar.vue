<script setup lang="ts">
import { type PropType } from 'vue';
import type { PlayerHand } from '@/model/playerHand';

const props = defineProps({
  players: {
    type: Array as PropType<PlayerHand[]>,
    required: true
  },
});
</script>

<template>
  <div class="topbar-container">
    <div class="round">
        <!-- add round number as paramiter later -->
      Round 1
    </div>
    <div class="players-row">
      <div
        v-for="(player, index) in players"
        :key="index"
        class="player-container"
      >
        <div class="name">{{ player.playerName }}</div>
        <div class="score">Score: {{ player.score }}</div>
        <div class="cards-number">Cards: {{ player.playerCards.length }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.topbar-container {
  background-color: #272626ff;
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
