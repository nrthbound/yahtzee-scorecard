<script module lang="ts">
  export type UpperValue = number | 'scratch' | null;
</script>

<script lang="ts">

  const {label, faceValue, value, onChange} = $props<{
    label: string;
    faceValue: number;
    value: UpperValue;
    onChange: (v: UpperValue) => void;
  }>()

  // Generate unique name for this radio group
  const radioGroupName = $derived(`upper-${faceValue}`);

  function handleChange(newValue: UpperValue) {
    onChange(newValue);
  }

  const score = $derived(
    value === 'scratch' ? 0 :
    value === null ? 0 :
    value * faceValue
  )
</script>

<div class="row grid grid-cols-[1fr_2fr_1fr] gap-2 sm:gap-4 items-center border-b border-gray-200/60 pb-2 mb-2">
  <div class="">
    {label}
  </div>
  <div class="flex">
    <!-- Number buttons -->
    {#each [0,1,2,3,4,5] as n}
      <label class="cursor-pointer">
        <input
          type="radio"
          name={radioGroupName}
          value={n}
          checked={value === n}
          onchange={() => handleChange(n)}
          class="sr-only"
        />
        <div class="w-8 h-8 border border-gray-300 flex items-center justify-center text-sm font-medium transition-colors {
          value === n
            ? 'bg-blue-50 text-blue-700'
            : 'bg-white hover:bg-gray-300/20'
          } {
            n === 0 ? 'rounded-l-md border-l text-gray-400 border-gray-400 bg-gray-400/20' : 'border-l-0'
          }">
          {n}
        </div>
      </label>
    {/each}
    <!-- Scratch button -->
    <label class="cursor-pointer">
      <input
        type="radio"
        name={radioGroupName}
        value="scratch"
        checked={value === 'scratch'}
        onchange={() => handleChange('scratch')}
        class="sr-only"
      />
      <div class="w-8 h-8 rounded-r-md border border-l-0 flex items-center justify-center text-sm font-medium transition-colors {
        value === 'scratch'
          ? 'border-red-500 bg-red-50 text-red-700'
          : 'border-gray-300 bg-white hover:border-gray-400'
      }">
        /
      </div>
    </label>
  </div>
  <div class="score">
    <div class="bg-gray-200 inline-flex w-8 h-8 sm:w-10 sm:h-10 justify-center items-center rounded-md text-sm sm:text-base">
      {score}
    </div>
  </div>
</div>


