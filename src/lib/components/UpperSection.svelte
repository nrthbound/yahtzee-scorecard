<script lang="ts">
  import { calculateUpper } from "$lib/scoring";

  type UpperValue = number | 'scratch' | null;

  function parseSelectValue(value: string): number | 'scratch' | null {
    return value === 'scratch' ? 'scratch' :
           value === '' ? null :
           Number(value);
  }

  const upper = $state<Record<string, UpperValue>>({
    ones: null,
    twos: null,
    threes: null,
    fours: null,
    fives: null,
    sixes: null,
  })

  const score = $derived(() => calculateUpper(upper));
</script>

<select bind:value={upper.ones} onchange={
  (e) => {
    upper.ones = parseSelectValue((e.target as HTMLSelectElement).value);
  }
}>
  <option value={null}>--</option>
  <option value="scratch">Scratch</option>
  {#each [0, 1, 2, 3, 4, 5] as n}
    <option value={n}>{n}</option>
  {/each}
</select>

