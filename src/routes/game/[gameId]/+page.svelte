<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Scorecard from "$lib/components/Scorecard.svelte";
  import { joinGame, cleanupGameSubscription } from "$lib/gameSync";
  import { gameState } from "$lib/stores/gameStore";

  let playerName = $state('');
  let isLoading = $state(true);
  let errorMessage = $state('');
  let showNamePrompt = $state(false);

  const state = $derived($gameState);
  const gameId = $derived($page.params.gameId);

  async function handleJoinGame() {
    if (!playerName.trim()) {
      errorMessage = 'Please enter your name';
      return;
    }

    try {
      isLoading = true;
      errorMessage = '';
      await joinGame(gameId, playerName.trim());
      showNamePrompt = false;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Failed to join game';
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    // Check if we're already in this game
    if (state.gameId === gameId && state.playerName) {
      isLoading = false;
      return;
    }

    // If we have a stored player name, try to auto-join
    const storedPlayerName = localStorage.getItem('yahtzee_player_name');
    if (storedPlayerName) {
      playerName = storedPlayerName;
      handleJoinGame();
    } else {
      showNamePrompt = true;
      isLoading = false;
    }

    return () => {
      cleanupGameSubscription();
    };
  });

  // Save player name to localStorage when they join
  $effect(() => {
    if (playerName && state.gameId === gameId) {
      localStorage.setItem('yahtzee_player_name', playerName);
    }
  });
</script>

<svelte:head>
  <title>Yahtzee Game {gameId}</title>
</svelte:head>

<div class="min-h-screen bg-gray-100">
  {#if isLoading}
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading game...</p>
      </div>
    </div>
  {:else if showNamePrompt}
    <div class="flex items-center justify-center min-h-screen">
      <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <h1 class="text-2xl font-bold text-center mb-6">Join Game</h1>
        <p class="text-gray-600 text-center mb-6">Game ID: <code class="bg-gray-100 px-2 py-1 rounded">{gameId}</code></p>

        {#if errorMessage}
          <div class="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {errorMessage}
          </div>
        {/if}

        <div class="space-y-4">
          <div>
            <label for="playerName" class="block text-sm font-medium mb-2">Your Name</label>
            <input
              id="playerName"
              bind:value={playerName}
              onkeydown={(e) => e.key === 'Enter' && handleJoinGame()}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
              autofocus
            />
          </div>

          <button
            onclick={handleJoinGame}
            disabled={isLoading || !playerName.trim()}
            class="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? '⏳ Joining...' : '🎯 Join Game'}
          </button>
        </div>
      </div>
    </div>
  {:else if state.gameId === gameId}
    <Scorecard />
  {:else}
    <div class="flex items-center justify-center min-h-screen">
      <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
        <h1 class="text-2xl font-bold mb-4 text-red-600">Game Not Found</h1>
        <p class="text-gray-600 mb-6">The game "{gameId}" could not be found or is no longer active.</p>
        <button
          onclick={() => goto('/')}
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          🏠 Go Home
        </button>
      </div>
    </div>
  {/if}
</div>
