<script lang="ts">
  import LowerRow, { type LowerValue } from "./LowerRow.svelte";
  import { calculateLower } from "$lib/scoring";
  import { gameState, updateLowerCategory } from "$lib/stores/gameStore";

  // Get state from store using runes
  const state = $derived($gameState);
  const lower = $derived(state.lower);
  const lowerTotal = $derived(calculateLower(lower));
</script>

<div class="bg-white max-w-2xl mx-auto p-6 rounded-lg shadow-lg space-y-4 mt-6">
  <h3 class="text-lg font-semibold mb-4 text-gray-800">Lower Section</h3>

  <div class="space-y-1">
    <LowerRow
      label="Three of a Kind"
      inputType="number"
      value={lower.threeOfAKind}
      onChange={(v) => updateLowerCategory('threeOfAKind', v)}
    />

    <LowerRow
      label="Four of a Kind"
      inputType="number"
      value={lower.fourOfAKind}
      onChange={(v) => updateLowerCategory('fourOfAKind', v)}
    />

    <LowerRow
      label="Full House"
      inputType="checkbox"
      fixedValue={25}
      value={lower.fullHouse}
      onChange={(v) => updateLowerCategory('fullHouse', v)}
    />

    <LowerRow
      label="Small Straight"
      inputType="checkbox"
      fixedValue={30}
      value={lower.smallStraight}
      onChange={(v) => updateLowerCategory('smallStraight', v)}
    />

    <LowerRow
      label="Large Straight"
      inputType="checkbox"
      fixedValue={40}
      value={lower.largeStraight}
      onChange={(v) => updateLowerCategory('largeStraight', v)}
    />

    <LowerRow
      label="Yahtzee"
      inputType="checkbox"
      fixedValue={50}
      value={lower.yahtzee}
      onChange={(v) => updateLowerCategory('yahtzee', v)}
    />

    <LowerRow
      label="Chance"
      inputType="number"
      value={lower.chance}
      onChange={(v) => updateLowerCategory('chance', v)}
    />
  </div>

  <!-- TODO: Add lower section totals and Yahtzee bonus section -->
  <div class="mt-6 pt-4 border-t border-gray-300">
    <div class="text-sm text-gray-600">
      Lower Total: {lowerTotal}
      <!-- Yahtzee bonus section will go here -->
    </div>
  </div>
</div>
