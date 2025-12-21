<script module lang="ts">
  export type UpperValue = number | 'scratch' | null;
</script>

<script lang="ts">

  import type { UpperValue } from "./UpperRow.svelte";

  const {label, faceValue, value, onChange} = $props<{
    label: string;
    faceValue: number;
    value: UpperValue;
    onChange: (v: UpperValue) => void;
  }>()


  function handleChange(e: Event) {
    const select = e.currentTarget as HTMLSelectElement;
    const raw = select.value;

    const parsed: UpperValue =
      raw === 'scratch' ? 'scratch' :
      raw === '' ? null :
      Number(raw);

    onChange(parsed);
  }

  const score = $derived(
    () =>
      value === 'scratch' ? 0 :
      value === null ? 0 :
      value * faceValue
  )
</script>

<tr>
  <td>{label}</td>
  <td>{score}</td>
  <td>
    <select onchange={handleChange}>
      <option value="">—</option>
      <option value="scratch">Scratch</option>
      {#each [0,1,2,3,4,5] as n}
        <option value={n} selected={value === n}>{n}</option>
      {/each}
    </select>
  </td>
</tr>
