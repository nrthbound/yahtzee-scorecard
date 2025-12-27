<script lang="ts">
  import Scorecard from "$lib/components/Scorecard.svelte";
  // import { testSupabaseConnection } from "$lib/supabaseTest";
  import { createGame, joinGame, cleanupGameSubscription } from "$lib/gameSync";
  import { gameState } from "$lib/stores/gameStore";
  import { onDestroy, onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let playerName = $state('');
  let gameIdToJoin = $state('');
  let customGameId = $state('');
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
      showMessage(`${error instanceof Error ? error.message : 'Unknown error'}`, true);
    } finally {
      isLoading = false;
    }
  }

  async function handleJoinGame() {
    if (!customGameId.trim()) {
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
      goto(`/game/${customGameId.trim()}`);
    } catch (error) {
      goto('/');
      showMessage(`Failed to join game: ${error instanceof Error ? error.message : 'Unknown error'}`, true);
    } finally {
      isLoading = false;
    }
  }

  // Cleanup subscription when component is destroyed
  onDestroy(() => {
    cleanupGameSubscription();
  });

  onMount(() => {
    // If already in a game, redirect there
    if (state.gameId && state.playerName) {
      goto(`/game/${state.gameId}`);
    }

    if (!playerName) {
      playerName = localStorage.getItem('yahtzee_player_name');
    }
  });
</script>

<div class="mt-6 flex items-center justify-end gap-x-6 hidden">
    <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div class="sm:col-span-3">
          <label for="first-name" class="block text-sm/6 font-medium text-gray-900">First name</label>
          <div class="mt-2">
            <input id="first-name" type="text" name="first-name" autocomplete="given-name" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
          </div>
        </div>
    <button type="button" class="text-sm/6 font-semibold text-gray-900">Cancel</button>
    <button type="submit" class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Save</button>
    </div>
  </div>

<div class=" bg-white">
  <div class="max-w-6xl mx-auto">

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

    <div class="mb-6 max-w-2xl mx-auto">

      <div class="bg-white shadow-lg p-4 rounded-md">
        <h3 class=" text-gray-800 mb-3">New Game</h3>

        <div class="space-y-5">
          <div>
            <label for="playerName" class="block text-sm/6 font-medium text-gray-900 mb-1"> Name</label>
            <input
              id="playerName"
              bind:value={playerName}
              disabled={isLoading}
              class="w-full px-3 py-2 border border-gray-300 rounded disabled:bg-gray-100"
            />
          </div>

          <div>
            <label for="customGameId" class="block text-sm font-medium mb-1">
              Game ID
              <span class="text-gray-500 text-xs">(optional - leave blank for auto-generated)</span>
            </label>
            <input
              id="customGameId"
              bind:value={customGameId}
              disabled={isLoading}
              class="w-full px-3 py-2 border border-gray-300 rounded disabled:bg-gray-100"
              placeholder=""
              maxlength="12"
            />
            <p class="text-xs text-gray-500 mt-1">3-12 characters, letters and numbers only</p>
          </div>

          <div class="flex justify-end gap-x-3">
            <button
              onclick={handleJoinGame}
              disabled={isLoading}
              class="rounded-md cursor-pointer outline-1 outline-primary-dark text-primary-dark px-3 py-2 text-sm font-semibold shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-dark"
            >
              {isLoading ? 'Joining...' : 'Join Game'}
            </button>

            <button
              onclick={handleCreateGame}
              disabled={isLoading}
              class="rounded-md cursor-pointer bg-primary px-3 py-2 text-sm font-semibold text-primary-dark shadow-xs hover:bg-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {isLoading ? 'Creating...' : 'Create Game'}
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white shadow-lg p-4 border border-gray-200/80 hidden">
        <h3 class=" text-gray-800 mb-3">Join Existing Game</h3>

        <div class="space-y-3">
          <div>
            <label for="playerNameJoin" class="block text-sm/6 font-medium text-gray-900 mb-1">Name</label>
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

    <!-- {#if state.gameId}
      <div class="bg-white rounded-lg p-3 border flex items-center justify-center space-x-2 text-sm">
        <span>Active Game: <code class="bg-gray-100 px-2 py-1 rounded font-mono">{state.gameId}</code></span>
        <span>|</span>
        <span>Player: <strong>{state.playerName}</strong></span>
        <span class="text-blue-600 text-xs">(Auto-saving)</span>
      </div>
    {/if} -->
  </div>
</div>

{#if state.gameId}
  <Scorecard />
{:else}
  <div class="max-w-6xl mx-auto p-8 text-center">
    <h2 class="text-2xl font-bold text-gray-700 mb-4">Ready to Play Yahtzee?</h2>
    <p class="text-gray-600 mb-6">Create a new game or join an existing one to get started!</p>
  </div>
{/if}

