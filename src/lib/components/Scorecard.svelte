<script lang="ts">
  import UpperSection from "$lib/components/UpperSection.svelte";
  import LowerSection from "$lib/components/LowerSection.svelte";
  import { calculateGrandTotal } from "$lib/scoring";
  import { gameState } from "$lib/stores/gameStore";

  // Props for when we need multiplayer/game state later
  const {
    gameId,
    playerId,
    playerName = "Player 1"
  } = $props<{
    gameId?: string;
    playerId?: string;
    playerName?: string;
  }>();

  // Get state from store and calculate totals
  const state = $derived($gameState);
  const totals = $derived(calculateGrandTotal(state.upper, state.lower));

  // Use player name from store if available, fallback to prop
  const displayPlayerName = $derived(state.playerName || playerName || "Player 1");
  const displayGameId = $derived(state.gameId || gameId);
</script>

<div class="scorecard-container max-w-4xl mx-auto p-6 space-y-8">
  <!-- Player Header -->
  <div class="text-center">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Yahtzee Scorecard</h1>
    <h2 class="text-xl text-gray-600">{displayPlayerName}</h2>
    {#if displayGameId}
      <p class="text-sm text-gray-500 mt-1">Game: {displayGameId}</p>
    {/if}
  </div>

  <!-- Scorecard Sections -->
  <div class="grid lg:grid-cols-2 gap-8">
    <!-- Upper Section -->
    <div>
      <UpperSection />
    </div>

    <!-- Lower Section -->
    <div>
      <LowerSection />
    </div>
  </div>

  <!-- Grand Total Display -->
  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
    <div class="grid grid-cols-3 gap-4 text-center">
      <div>
        <p class="text-sm font-medium text-gray-600">Upper Total</p>
        <p class="text-2xl font-bold text-blue-600">{totals.upperTotal}</p>
      </div>
      <div>
        <p class="text-sm font-medium text-gray-600">Lower Total</p>
        <p class="text-2xl font-bold text-blue-600">{totals.lowerTotal}</p>
      </div>
      <div>
        <p class="text-sm font-medium text-gray-600">Grand Total</p>
        <p class="text-3xl font-bold text-indigo-700">{totals.grandTotal}</p>
      </div>
    </div>
  </div>

  <!-- TODO: Add Yahtzee bonus section here -->
</div>
