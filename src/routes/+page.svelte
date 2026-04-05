<script lang="ts">
	import Scorecard from '$lib/components/Scorecard.svelte';
	// import { testSupabaseConnection } from "$lib/supabaseTest";
	import { createGame, joinGame, cleanupGameSubscription } from '$lib/gameSync';
	import { gameState } from '$lib/stores/gameStore';
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
			showMessage(
				`Failed to join game: ${error instanceof Error ? error.message : 'Unknown error'}`,
				true
			);
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

<div>
	<div class="mx-auto max-w-6xl">
		{#if errorMessage}
			<div class="mb-4 rounded border border-red-300 bg-red-100 p-3 text-red-700">
				{errorMessage}
			</div>
		{/if}

		{#if successMessage}
			<div class="mb-4 rounded border border-green-300 bg-green-100 p-3 text-green-700">
				{successMessage}
			</div>
		{/if}

		<div class="mx-auto mt-4 mb-6 max-w-2xl px-4 md:px-0">
			<div class="rounded-md border border-border bg-surface p-4 shadow-xl">
				<h3 class=" mb-3 text-gray-800">New Game</h3>

				<div class="space-y-5">
					<div>
						<label for="playerName" class="mb-1 block text-sm/6 font-medium text-gray-900">
							Name</label
						>
						<input
							id="playerName"
							bind:value={playerName}
							disabled={isLoading}
							class="w-full rounded border border-gray-300 px-3 py-2 disabled:bg-gray-100"
						/>
					</div>

					<div>
						<label for="customGameId" class="mb-1 block text-sm font-medium">
							Game ID
							<span class="text-xs text-gray-500">(optional - leave blank for auto-generated)</span>
						</label>
						<input
							id="customGameId"
							bind:value={customGameId}
							disabled={isLoading}
							class="w-full rounded border border-gray-300 px-3 py-2 disabled:bg-gray-100"
							placeholder=""
							maxlength="12"
						/>
						<p class="mt-1 text-xs text-gray-500">3-12 characters, letters and numbers only</p>
					</div>

					<div class="flex justify-end gap-x-3">
						<button
							onclick={handleJoinGame}
							disabled={isLoading}
							class="cursor-pointer rounded-md px-3 py-2 text-sm font-semibold text-accent shadow-xs outline-1 outline-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-dark"
						>
							{isLoading ? 'Joining...' : 'Join Game'}
						</button>

						<button
							onclick={handleCreateGame}
							disabled={isLoading}
							class="hover:bg-primary/80 focus-visible:outline-primary cursor-pointer rounded-md bg-background px-3 py-2 text-sm font-semibold text-accent-dark shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2"
						>
							{isLoading ? 'Creating...' : 'Create Game'}
						</button>
					</div>
				</div>
			</div>

			<div class="hidden border border-gray-200/80 bg-white p-4 shadow-lg">
				<h3 class=" mb-3 text-gray-800">Join Existing Game</h3>

				<div class="space-y-3">
					<div>
						<label for="playerNameJoin" class="mb-1 block text-sm/6 font-medium text-gray-900"
							>Name</label
						>
						<input
							id="playerNameJoin"
							bind:value={playerName}
							disabled={isLoading}
							class="w-full rounded border px-3 py-2 disabled:bg-gray-100"
							placeholder="Enter your name"
						/>
					</div>

					<div>
						<label for="gameIdInput" class="mb-1 block text-sm font-medium">Game ID</label>
						<input
							id="gameIdInput"
							bind:value={gameIdToJoin}
							disabled={isLoading}
							class="w-full rounded border px-3 py-2 disabled:bg-gray-100"
							placeholder="Enter game ID to join"
						/>
					</div>

					<button
						onclick={handleJoinGame}
						disabled={isLoading}
						class="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
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
	<div class="mx-auto max-w-6xl p-8 text-center">
		<h2 class="mb-4 text-2xl font-bold text-gray-700">Ready to Play Yahtzee?</h2>
		<p class="mb-6 text-gray-600">Create a new game or join an existing one to get started!</p>
	</div>
{/if}
