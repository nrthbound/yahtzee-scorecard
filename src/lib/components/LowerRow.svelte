<script module lang="ts">
  export type LowerValue = number | boolean | 'scratch' | null;
</script>

<script lang="ts">
  const {label, inputType, fixedValue, value, onChange} = $props<{
    label: string;
    inputType: 'number' | 'checkbox';
    fixedValue?: number; // For checkbox types (e.g., 30 for Small Straight)
    value: LowerValue;
    onChange: (v: LowerValue) => void;
  }>()

  // Generate unique name for this input group
  const inputGroupName = $derived(`lower-${label.toLowerCase().replace(/\s+/g, '-')}`);

  function handleNumberChange(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const parsed = input.value === '' ? null : Number(input.value);
    onChange(parsed);
  }

  function handleCheckboxChange() {
    onChange(value === true ? null : true);
  }

  function handleScratch() {
    // Toggle scratch: if already scratched, clear it; otherwise scratch it
    onChange(value === 'scratch' ? null : 'scratch');
  }

  const score = $derived(
    value === 'scratch' ? 0 :
    value === null ? 0 :
    inputType === 'checkbox' ? (value ? fixedValue : 0) :
    typeof value === 'number' ? value : 0
  )

  const isScratched = $derived(value === 'scratch');
</script>

<div class="row grid grid-cols-[1fr_2fr_auto] gap-4 items-center border-b border-gray-200/60 pb-2 mb-2">
  <div class="">
    {label}
  </div>

  <!-- Pill-shaped input group -->
  <div class="flex">
    {#if inputType === 'number'}
      <!-- Number input (left side of pill) -->
      <input
        type="number"
        min="0"
        max="30"
        value={typeof value === 'number' ? value : ''}
        onchange={handleNumberChange}
        disabled={isScratched}
        class="w-full px-3 py-2 border-2 border-r-0 rounded-l-lg border-gray-300 bg-white disabled:bg-gray-100 disabled:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
        placeholder="0"
      />
    {:else}
      <!-- Checkbox input (left side of pill) -->
      <button
        onclick={handleCheckboxChange}
        disabled={isScratched}
        class="flex-1 px-3 py-2 border-2 border-r-0 rounded-l-lg border-gray-300 bg-white disabled:bg-gray-100 transition-colors focus:outline-none focus:border-blue-500 {
          value === true
            ? 'bg-blue-50 border-blue-300 text-blue-700'
            : 'hover:bg-gray-50'
        }"
      >
        <div class="flex items-center justify-center">
          {#if value === true}
            <!-- <span class="text-sm font-medium">{fixedValue}</span> -->
            <span class="text-sm font-medium">✓</span>
          {:else}
            <span class="text-sm text-gray-500">—</span>
          {/if}
        </div>
      </button>
    {/if}

    <!-- Scratch button (right side of pill) -->
    <button
      onclick={handleScratch}
      class="px-4 py-2 border-2 border-l-0 rounded-r-lg border-gray-300 bg-white transition-colors focus:outline-none focus:border-red-500 {
        isScratched
          ? 'bg-red-50 border-red-300 text-red-700'
          : 'hover:bg-gray-50'
      }"
    >
      <span class="text-sm font-medium">/</span>
    </button>
  </div>

  <!-- Score display -->
  <div class="score">
    <div class="bg-gray-200 inline-flex h-8 w-8 sm:w-10 sm:h-10 justify-center items-center rounded-md text-sm sm:text-base">
      {score}
    </div>
  </div>
</div>
