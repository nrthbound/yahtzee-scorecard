<script lang="ts">
  import Scorecard from "$lib/components/Scorecard.svelte";
  // import { testSupabaseConnection } from "$lib/supabaseTest";
  import { createGame, joinGame, cleanupGameSubscription } from "$lib/gameSync";
  import { gameState } from "$lib/stores/gameStore";
  import { onDestroy } from 'svelte';
  import { goto } from '$app/navigation';

  let playerName = $state('Travis');
  let gameIdToJoin = $state('');
  let customGameId = $state(''); // New: custom game ID input
  let isLoading = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');

  const state = $derived($gameState);

  // Clear messages after a delay
  function showMessage(message: string, isError: boolean = false) {
    if (isError) {
      errorMessage = message;
      successMessage = '';
    } else {
      successMessage = message;
      errorMessage = '';
    }

    setTimeout(() => {
      errorMessage = '';
      successMessage = '';
    }, 5000);
  }

  // async function handleTestConnection() {
  //   try {
  //     isLoading = true;
  //     const gameId = await testSupabaseConnection();
  //     showMessage(`Connection successful! Test game: ${gameId}`);
  //   } catch (error) {
  //     showMessage(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`, true);
  //   } finally {
  //     isLoading = false;
  //   }
  // }

  async function handleCreateGame() {
    if (!playerName.trim()) {
      showMessage('Please enter your name first', true);
      return;
    }

    try {
      isLoading = true;
      const gameId = await createGame(playerName.trim(), customGameId.trim() || undefined);
      // Store player name for the game route
      localStorage.setItem('yahtzee_player_name', playerName.trim());
      // Redirect to the game page
      goto(`/game/${gameId}`);
    } catch (error) {
      showMessage(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`, true);
    } finally {
      isLoading = false;
    }
  }

  async function handleJoinGame() {
    if (!gameIdToJoin.trim()) {
      showMessage('Please enter a game ID', true);
      return;
    }

    if (!playerName.trim()) {
      showMessage('Please enter your name first', true);
      return;
    }

    try {
      isLoading = true;
      // Store player name for the game route
      localStorage.setItem('yahtzee_player_name', playerName.trim());
      // Redirect to the game page
      goto(`/game/${gameIdToJoin.trim()}`);
    } catch (error) {
      showMessage(`❌ Failed to join game: ${error instanceof Error ? error.message : 'Unknown error'}`, true);
      showMessage(`Failed to join game: ${error instanceof Error ? error.message : 'Unknown error'}`, true);
    } finally {
      isLoading = false;
    }
  }

  // Cleanup subscription when component is destroyed
  onDestroy(() => {
    cleanupGameSubscription();
  });
</script>

<div class="p-4 bg-gray-100 border-b">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-lg font-bold mb-4">Game Management</h2>

    <!-- Messages -->
    {#if errorMessage}
      <div class="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
        {errorMessage}
      </div>
    {/if}

    {#if successMessage}
      <div class="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
        {successMessage}
      </div>
    {/if}

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

      <div class="bg-white rounded-lg p-4 border">
        <h3 class="font-semibold text-gray-800 mb-3">New Game</h3>

        <div class="space-y-3">
          <div>
            <label for="playerName" class="block text-sm font-medium mb-1">Your Name</label>
            <input
              id="playerName"
              bind:value={playerName}
              disabled={isLoading}
              class="w-full px-3 py-2 border rounded disabled:bg-gray-100"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label for="customGameId" class="block text-sm font-medium mb-1">
              Custom Game ID
              <span class="text-gray-500 text-xs">(optional - leave blank for auto-generated)</span>
            </label>
            <input
              id="customGameId"
              bind:value={customGameId}
              disabled={isLoading}
              class="w-full px-3 py-2 border rounded disabled:bg-gray-100"
              placeholder="e.g. FAMILY2024 or leave blank"
              maxlength="12"
            />
            <p class="text-xs text-gray-500 mt-1">3-12 characters, letters and numbers only</p>
          </div>

          <button
            onclick={handleCreateGame}
            disabled={isLoading}
            class="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Game'}
          </button>
        </div>
      </div>

      <!-- Join Game Section -->
      <div class="bg-white rounded-lg p-4 border">
        <h3 class="font-semibold text-gray-800 mb-3">🎯 Join Existing Game</h3>

        <div class="space-y-3">
          <div>
            <label for="playerNameJoin" class="block text-sm font-medium mb-1">Your Name</label>
            <input
              id="playerNameJoin"
              bind:value={playerName}
              disabled={isLoading}
              class="w-full px-3 py-2 border rounded disabled:bg-gray-100"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label for="gameIdInput" class="block text-sm font-medium mb-1">Game ID</label>
            <input
              id="gameIdInput"
              bind:value={gameIdToJoin}
              disabled={isLoading}
              class="w-full px-3 py-2 border rounded disabled:bg-gray-100"
              placeholder="Enter game ID to join"
            />
          </div>

          <button
            onclick={handleJoinGame}
            disabled={isLoading}
            class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Joining...' : 'Join Game'}
          </button>
        </div>
      </div>
    </div>

    {#if state.gameId}
      <div class="bg-white rounded-lg p-3 border flex items-center justify-center space-x-2 text-sm">
        <span class="text-green-600">🟢</span>
        <span>Active Game: <code class="bg-gray-100 px-2 py-1 rounded font-mono">{state.gameId}</code></span>
        <span>|</span>
        <span>Player: <strong>{state.playerName}</strong></span>
        <span class="text-blue-600 text-xs">(Auto-saving)</span>
      </div>
    {/if}
  </div>
</div>

{#if state.gameId}
  <Scorecard />
{:else}
  <div class="max-w-6xl mx-auto p-8 text-center">
    <h2 class="text-2xl font-bold text-gray-700 mb-4">Ready to Play Yahtzee?</h2>
    <p class="text-gray-600 mb-6">Create a new game or join an existing one to get started!</p>
    <div class="text-6xl mb-4">🎲</div>
  </div>
{/if}

