<script lang="ts">
  import UpperSection from "$lib/components/UpperSection.svelte";
  import LowerSection from "$lib/components/LowerSection.svelte";
  import PlayerList from "$lib/components/PlayerList.svelte";
  import YahtzeeBonus from "$lib/components/YahtzeeBonus.svelte";
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

<div class="scorecard-container max-w-6xl mx-auto p-6 space-y-8">
  <!-- Player Header -->
  <div class="text-center">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Yahtzee Scorecard</h1>
    <h2 class="text-xl text-gray-600">{displayPlayerName}</h2>
    {#if displayGameId}
      <p class="text-sm text-gray-500 mt-1">Game: {displayGameId}</p>
    {/if}
  </div>

  <!-- Main Content Grid -->
  <div class="grid lg:grid-cols-2 gap-8">
    <!-- Scorecard Sections -->
    <!-- <div class="lg:col-span-2 grid lg:grid-cols-2 gap-8"> -->
    <div class="flex flex-col">
      <!-- Upper Section -->
      <div>
        <UpperSection />
      </div>

      <!-- Lower Section -->
      <div>
        <LowerSection />
      </div>

      <div>
        <YahtzeeBonus />
      </div>
    </div>

    <!-- Sidebar with Player List -->
    <div class="space-y-6">
      <PlayerList />
    </div>
  </div>

  <!-- Grand Total Display -->
  <div class="sticky bottom-0 max-w-2xl mx-auto rounded-t-lg p-2 sm:p-6 border bg-primary/20 border-primary">
    <div class="grid grid-cols-3 sm:gap-4 text-center">
      <div>
        <p class="text-sm font-medium text-gray-600">Upper Total</p>
        <p class="text-lg sm:text-2xl font-bold text-primary">{totals.upperTotal}</p>
      </div>
      <div>
        <p class="text-sm font-medium text-gray-600">Lower Total</p>
        <p class="text-lg sm:text-2xl font-bold text-primary">{totals.lowerTotal}</p>
      </div>
      <div>
        <p class="text-sm font-medium text-gray-600">Grand Total</p>
        <p class="text-lg sm:text-2xl font-bold text-primary">{totals.grandTotal + (state.yahtzeBonusCount || 0) * 100}</p>
      </div>
    </div>
  </div>
</div>
