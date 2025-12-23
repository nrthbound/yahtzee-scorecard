<script lang="ts">
  import Scorecard from "$lib/components/Scorecard.svelte";
  import { testSupabaseConnection } from "$lib/supabaseTest";
  import { createGame, joinGame, saveGameState } from "$lib/gameSync";
  import { gameState } from "$lib/stores/gameStore";

  // @ts-ignore - Svelte 5 runes
  let playerName = 'Travis';
  // @ts-ignore - Svelte 5 runes
  let gameIdToJoin = '';

  const state = $derived($gameState);

  async function handleTestConnection() {
    try {
      const gameId = await testSupabaseConnection();
      alert(`Success! Created test game: ${gameId}`);
    } catch (error) {
      alert(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function handleCreateGame() {
    try {
      const gameId = await createGame(playerName);
      alert(`Game created! ID: ${gameId}`);
    } catch (error) {
      alert(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function handleJoinGame() {
    if (!gameIdToJoin.trim()) {
      alert('Please enter a game ID');
      return;
    }

    try {
      await joinGame(gameIdToJoin.trim(), playerName);
      alert(`Joined game: ${gameIdToJoin}`);
    } catch (error) {
      alert(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function handleSaveGame() {
    try {
      await saveGameState(state);
      alert('Game saved!');
    } catch (error) {
      alert(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
</script>

<div class="p-4 bg-gray-100 border-b">
  <div class="max-w-4xl mx-auto">
    <h2 class="text-lg font-bold mb-4">Game Management</h2>

    <div class="flex gap-4 items-end mb-4">
      <div>
        <label for="playerName" class="block text-sm font-medium mb-1">Your Name</label>
        <input
          id="playerName"
          bind:value={playerName}
          class="px-3 py-2 border rounded"
          placeholder="Enter your name"
        />
      </div>

      <button
        onclick={handleCreateGame}
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Create New Game
      </button>
    </div>

    <div class="flex gap-4 items-end mb-4">
      <div>
        <label for="gameIdInput" class="block text-sm font-medium mb-1">Game ID</label>
        <input
          id="gameIdInput"
          bind:value={gameIdToJoin}
          class="px-3 py-2 border rounded"
          placeholder="Enter game ID to join"
        />
      </div>

      <button
        onclick={handleJoinGame}
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Join Game
      </button>
    </div>

    <div class="flex gap-2">
      <button
        onclick={handleTestConnection}
        class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
      >
        Test Connection
      </button>

      {#if state.gameId}
        <button
          onclick={handleSaveGame}
          class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
        >
          Save Game
        </button>

        <div class="px-3 py-2 bg-white rounded border text-sm">
          Game: <code>{state.gameId}</code> | Player: <strong>{state.playerName}</strong>
        </div>
      {/if}
    </div>
  </div>
</div>

{#if state.gameId}
  <Scorecard />
{:else}
  <div class="max-w-4xl mx-auto p-8 text-center">
    <h2 class="text-2xl font-bold text-gray-700 mb-4">Ready to Play Yahtzee?</h2>
    <p class="text-gray-600 mb-6">Create a new game or join an existing one to get started!</p>
    <div class="text-6xl mb-4">🎲</div>
  </div>
{/if}

