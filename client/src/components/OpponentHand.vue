<script setup lang="ts">
import type { PlayerHand } from "domain/src/model/playerHand";
import opponentImg from "@/components/images/opponentCards.png"

defineProps<{
  opponent: PlayerHand;
}>();
</script>

<template>
  <div class="opponent-container">
    <div class="opponent-name">
      {{ opponent.playerName }}
    </div>

    <img
      :src="opponentImg"
      alt="Opponent's cards"
      class="opponent-card"
    />
  </div>
</template>

<style scoped>
.opponent-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0.5rem;
}

.opponent-name {
  font-family: 'Trebuchet MS', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: white;
}

.opponent-card {
  height: 10rem; 
  object-fit: contain;
}
</style>
