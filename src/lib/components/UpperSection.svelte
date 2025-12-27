<script lang="ts">
  import { calculateUpper } from "$lib/scoring";
  import UpperRow, { type UpperValue } from "./UpperRow.svelte";
  import { gameState, updateUpperCategory } from "$lib/stores/gameStore";

  // Get state from store using runes
  const state = $derived($gameState);
  const upper = $derived(state.upper);
  const score = $derived(calculateUpper(upper));

  // Check if all upper section categories are filled (either scored > 0 or scratched)
  const isUpperSectionComplete = $derived(
    Object.values(upper).every(value =>
      value === 'scratch' || (typeof value === 'number' && value > 0)
    )
  );
</script>
<div class="bg-white max-w-2xl mx-auto p-6 rounded-lg shadow-lg space-y-4 transition-all duration-300 {
  isUpperSectionComplete
    ? 'border border-blue-400'
    : 'border border-gray-200'
}">
  <div class="heading border-b-2 border-gray-200/40 pb-4">
    <h1 class="text-xl font-bold">Yahtzee</h1>
  </div>
  <div class="flex flex-col">
  <UpperRow
    label="1's"
    faceValue={1}
    value={upper.ones}
    onChange={(v) => updateUpperCategory('ones', v)}
  />
  <UpperRow
    label="2's"
    faceValue={2}
    value={upper.twos}
    onChange={(v) => updateUpperCategory('twos', v)}
  />
  <UpperRow
    label="3's"
    faceValue={3}
    value={upper.threes}
    onChange={(v) => updateUpperCategory('threes', v)}
  />
  <UpperRow
    label="4's"
    faceValue={4}
    value={upper.fours}
    onChange={(v) => updateUpperCategory('fours', v)} />
  <UpperRow
    label="5's"
    faceValue={5}
    value={upper.fives}
    onChange={(v) => updateUpperCategory('fives', v)}
  />
  <UpperRow
    label="6's"
    faceValue={6}
    value={upper.sixes}
    onChange={(v) => updateUpperCategory('sixes', v)}
  />
  </div>
  <div class="scoring">
    <div class="label font-bold">Upper Section Score:</div>
    <div class="value font-semibold">Subtotal: {score.subtotal}</div>
    <div class="value font-semibold">Bonus: {score.bonus}</div>
    <div class="value font-semibold">Total: {score.total}</div>
    <!-- {#if score.subtotal >= 63}
      <div class="bonus text-green-600 font-medium">+35 Bonus Achieved!</div>
    {:else}
      <div class="bonus text-gray-500 font-medium">Need {63 - score.subtotal} more for bonus</div>
    {/if} -->
  </div>
</div>
