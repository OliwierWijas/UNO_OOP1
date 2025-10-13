<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import * as api from "../model/uno-client"
import { onMounted } from "vue";
import { usePendingGamesStore } from "@/stores/PendingGamesStore";

const pendingGamesStore = usePendingGamesStore();
const newGameName = ref("");
const router = useRouter();
const playerName = ref("");
const isLoading = ref(true);

const canStart = computed(() => playerName.value.trim().length > 0 && newGameName.value.trim().length > 0);
const canJoin = computed(() => playerName.value.trim().length > 0);

async function createGame() {
  try {
    await api.create_game(newGameName.value);
    await api.create_player_hand(playerName.value, newGameName.value);
    await router.push({
      name: 'Game',
      query: {
        playerName: playerName.value,
        gameName: newGameName.value
      }
    });
  } catch (error) {
    console.error('Error in createGame:', error);
  }
}

async function joinGame(gameName: string) {
    try {
    await api.create_player_hand(playerName.value, gameName);
    await router.push({
      name: 'Game',
      query: {
        playerName: playerName.value,
        gameName: gameName
      }
    });
  } catch (error) {
    console.error('Error in joinGame:', error);
    alert("Game has to much players!");
  }
}
async function loadInitialGames() {
  try {
    const games = await api.get_pending_games();
    pendingGamesStore.upsert(games);
  } catch (error) {
    console.error('Error loading initial games:', error);
  } finally {
    isLoading.value = false;
  }
}


function liveUpdateGames() {
  api.onPendingGamesUpdated((games) => {
    pendingGamesStore.upsert(games);
  });
}
  onMounted(async () => {
    await loadInitialGames();
    liveUpdateGames();
  })
</script>

<template>
  <div class="start-page">
    <h1 class="title">UNO</h1>
    <div class="player-input-container">
          <input
            v-model="playerName"
            type="text"
            placeholder="Enter your name"
            class="name-input"
          />
        </div>
    <div class="content-container">
      <div class="games-section">
        <h2 class="section-title">Available Games</h2>
        <div v-if="isLoading" class="loading-container">
          <p>Loading games...</p>
        </div>
        <div class="table-container" v-if="pendingGamesStore.games.length > 0">
          <table class="games-table">
            <thead>
              <tr>
                <th>Game Name</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="game in pendingGamesStore.games" :key="game.name">
                <td>{{ game.name }}</td>
                <td>
                  <button
                    class="join-btn"
                    :disabled="!canJoin"
                    @click="joinGame(game.name)"
                  >
                    Join Game
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="no-games" v-else>
          <p>No available games. Create one below!</p>
        </div>
      </div>

      <!-- Create Game Section -->
      <div class="create-section">
        <h2 class="section-title">Create New Game</h2>

        <div class="create-form">
          <input
            v-model="newGameName"
            type="text"
            placeholder="Enter game name"
            class="name-input"
            @keyup.enter="createGame"
          />

          <button
            class="create-btn"
            :disabled="!canStart"
            @click="createGame"
          >
            Create Game
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap');

.start-page {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 100vw;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: radial-gradient(circle, #6e91c2ff 0%, #0956bf 100%);
  background-size: cover;
  overflow-y: auto;
}

.title {
  animation: none !important;
  font-family: 'Luckiest Guy', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  font-size: clamp(56px, 9vw, 88px);
  color: #fff;
  margin: 0 0 2rem 1.5rem;
  letter-spacing: 1px;
  text-shadow:
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 2px 0 rgba(0,0,0,0.25);
  display: inline-block;
  transition: transform 180ms ease;
  will-change: transform;
}

.title:hover {
  transform: scale(1.08);
}

.content-container {
  display: flex;
  gap: 2rem;
  max-width: 1200px;
  width: 100%;
  justify-content: center;
}

.games-section,
.create-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
}

.games-section {
  flex: 2;
  min-width: 500px;
}

.create-section {
  flex: 1;
  min-width: 300px;
  align-self: flex-start;
}

.section-title {
  font-family: 'Luckiest Guy', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  font-size: 1.8rem;
  color: #0956bf;
  margin: 0 0 1.5rem 0;
  text-align: center;
  letter-spacing: 0.5px;
}

.player-input-container {
  margin-bottom: 1.5rem;
  width: 400px;
}

.table-container {
  font-family: 'Trebuchet MS', sans-serif;
  overflow-x: auto;
}

.games-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.games-table th {
  background: #0956bf;
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
}

.games-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 500;
}

.games-table tr:last-child td {
  border-bottom: none;
}

.games-table tr:hover {
  background: #f8fafc;
}

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.waiting {
  background: #dcfce7;
  color: #166534;
}

.status-badge.starting {
  background: #fef9c3;
  color: #854d0e;
}

.join-btn,
.create-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 140ms ease;
  width: 100%;
}

.join-btn {
  background: #0956bf;
  color: white;
}

.join-btn:hover:not(:disabled) {
  background: #1e4e8c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.create-btn {
  background: #dc2626;
  color: white;
  margin-top: 1rem;
}

.create-btn:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.join-btn:disabled,
.create-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  background: #94a3b8;
  box-shadow: none;
}

.name-input {
  width: 90%;
  padding: 16px 18px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  color: #0f172a;
  background: #ffffff;
  box-shadow:
    0 6px 12px rgba(0, 0, 0, 0.15),
    0 0 0 0 rgba(253, 224, 71, 0);
  outline: none;
  transition: box-shadow 160ms ease, transform 120ms ease;
  margin-bottom: 1rem;
}

.name-input::placeholder {
  color: #999;
}

.name-input:focus {
  transform: translateY(-1px);
  box-shadow:
    0 8px 16px rgba(0, 0, 0, 0.2),
    0 0 0 3px rgba(253, 224, 71, 0.4);
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.no-games {
  text-align: center;
  padding: 2rem;
  color: #64748b;
  font-style: italic;
}

/* Responsive design */
@media (max-width: 768px) {
  .content-container {
    flex-direction: column;
    align-items: center;
  }

  .games-section,
  .create-section {
    min-width: 100%;
    width: 100%;
  }

  .start-page {
    padding: 16px;
  }
}
</style>
