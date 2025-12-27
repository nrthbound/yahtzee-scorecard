<script lang="ts">
  import { gameState, updateLowerCategory } from '$lib/stores/gameStore';

  const state = $derived($gameState);
  const bonusCount = $derived(state.yahtzeBonusCount || 0);
  const yahtzeeScore = $derived(state.lower.yahtzee);

  // Yahtzee bonus is only available if original Yahtzee was scored (not scratched)
  const canScoreBonus = $derived(
    yahtzeeScore !== null &&
    yahtzeeScore !== 'scratch' &&
    yahtzeeScore === true
  );

  function addYahtzeeBonus() {
    if (!canScoreBonus) return;

    gameState.update(state => {
      const newState = {
        ...state,
        yahtzeBonusCount: (state.yahtzeBonusCount || 0) + 1
      };

      // Auto-save if we have game info
      if (newState.gameId && newState.playerName) {
        import('$lib/gameSync').then(({ saveGameState }) => {
          saveGameState(newState);
        });
      }

      return newState;
    });
  }

  function removeYahtzeeBonus() {
    if (bonusCount <= 0) return;

    gameState.update(state => {
      const newState = {
        ...state,
        yahtzeBonusCount: Math.max(0, (state.yahtzeBonusCount || 0) - 1)
      };

      // Auto-save if we have game info
      if (newState.gameId && newState.playerName) {
        import('$lib/gameSync').then(({ saveGameState }) => {
          saveGameState(newState);
        });
      }

      return newState;
    });
  }
</script>

<div class="bg-white max-w-2xl mx-auto p-6 rounded-lg shadow-lg space-y-4 mt-6 {canScoreBonus ? 'block' : 'hidden'}">
  <h3 class="text-lg font-semibold text-gray-800">Yahtzee Bonus</h3>

  <div class="space-y-3">
    <!-- <div class="text-sm text-gray-600">
      {#if !canScoreBonus}
        <p class="italic">Score a Yahtzee first to unlock bonuses!</p>
      {:else}
        <p>Each additional Yahtzee earns a 100-point bonus</p>
      {/if}
    </div> -->

    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <span class="text-lg font-semibold text-gray-700">
          Bonuses: {bonusCount}
        </span>
        <span class="text-lg font-bold text-yellow-700">
          +{bonusCount * 100} pts
        </span>
      </div>

      <div class="flex space-x-2">
        <button
          onclick={addYahtzeeBonus}
          disabled={!canScoreBonus}
          class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
        >
          Add Bonus
        </button>

        <button
          onclick={removeYahtzeeBonus}
          disabled={bonusCount <= 0}
          class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
        >
          Remove
        </button>
      </div>
    </div>

    <!-- {#if bonusCount > 0}
      <div class="text-xs text-gray-500">
        Note: When scoring additional Yahtzees, you may choose to score them in any open upper section category or as a chance.
      </div>
    {/if} -->
  </div>
</div>
