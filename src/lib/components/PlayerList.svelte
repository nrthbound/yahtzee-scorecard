<script lang="ts">
  import { gameState } from '$lib/stores/gameStore';
  import { calculateGrandTotal } from '$lib/scoring';
  import { onMount } from 'svelte';

  interface Player {
    player_name: string;
    joined_at: string;
    scores?: {
      ones?: number | null;
      twos?: number | null;
      threes?: number | null;
      fours?: number | null;
      fives?: number | null;
      sixes?: number | null;
      three_of_a_kind?: number | null;
      four_of_a_kind?: number | null;
      full_house?: boolean | null;
      small_straight?: boolean | null;
      large_straight?: boolean | null;
      yahtzee?: boolean | null;
      chance?: number | null;
      yahtzee_bonus_count?: number;
      scratched_categories?: string[];
    };
  }

  let players = $state<Player[]>([]);
  let loading = $state(true);
  let error = $state('');

  const state = $derived($gameState);

  // Fetch all players and their scores for current game
  async function fetchPlayersForGame() {
    if (!state.gameId) return;

    try {
      loading = true;
      error = '';

      const { fetchGamePlayers } = await import('$lib/gameSync');
      players = await fetchGamePlayers(state.gameId);

    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load players';
      console.error('Failed to fetch game players:', err);
    } finally {
      loading = false;
    }
  }

  // Calculate total score for a player
  function calculatePlayerTotal(playerScores: any) {
    if (!playerScores) return 0;

    const scratchedCategories = playerScores.scratched_categories || [];

    // Convert database format to our internal format
    const upperState = {
      ones: scratchedCategories.includes('ones') ? 'scratch' : playerScores.ones,
      twos: scratchedCategories.includes('twos') ? 'scratch' : playerScores.twos,
      threes: scratchedCategories.includes('threes') ? 'scratch' : playerScores.threes,
      fours: scratchedCategories.includes('fours') ? 'scratch' : playerScores.fours,
      fives: scratchedCategories.includes('fives') ? 'scratch' : playerScores.fives,
      sixes: scratchedCategories.includes('sixes') ? 'scratch' : playerScores.sixes
    };

    const lowerState = {
      threeOfAKind: scratchedCategories.includes('threeOfAKind') ? 'scratch' : playerScores.three_of_a_kind,
      fourOfAKind: scratchedCategories.includes('fourOfAKind') ? 'scratch' : playerScores.four_of_a_kind,
      fullHouse: scratchedCategories.includes('fullHouse') ? 'scratch' : playerScores.full_house,
      smallStraight: scratchedCategories.includes('smallStraight') ? 'scratch' : playerScores.small_straight,
      largeStraight: scratchedCategories.includes('largeStraight') ? 'scratch' : playerScores.large_straight,
      yahtzee: scratchedCategories.includes('yahtzee') ? 'scratch' : playerScores.yahtzee,
      chance: scratchedCategories.includes('chance') ? 'scratch' : playerScores.chance
    };

    const baseTotal = calculateGrandTotal(upperState, lowerState).grandTotal;
    const yahtzeeBonus = (playerScores.yahtzee_bonus_count || 0) * 100;

    return baseTotal + yahtzeeBonus;
  }

  onMount(() => {
    fetchPlayersForGame();

    // Refresh player list every 10 seconds
    // const interval = setInterval(fetchPlayersForGame, 10000);

    // return () => clearInterval(interval);
  });

  // Reactive: refetch when game changes
  $effect(() => {
    if (state.gameId) {
      fetchPlayersForGame();
    }
  });
</script>

{#if state.gameId}
  <div class="bg-white rounded-lg shadow-md p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800">Players in Game</h3>
      <button
        onclick={fetchPlayersForGame}
        class="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
      >
        Refresh
      </button>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span class="ml-2 text-gray-600">Loading players...</span>
      </div>
    {:else if error}
      <div class="bg-red-50 border border-red-200 rounded p-3">
        <p class="text-red-700 text-sm">⚠️ {error}</p>
      </div>
    {:else if players.length === 0}
      <div class="text-center py-8 text-gray-500">
        <p>No players found</p>
      </div>
    {:else}
      <div class="space-y-2">
        {#each players as player}
          <div class="flex items-center justify-between p-3 border rounded-lg {player.player_name === state.playerName ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-linear-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {player.player_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p class="font-medium text-gray-900">
                  {player.player_name}
                  {#if player.player_name === state.playerName}
                    <span class="text-blue-600 text-sm">(You)</span>
                  {/if}
                </p>
                <p class="text-xs text-gray-500">
                  Joined {new Date(player.joined_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-lg font-bold text-gray-900">
                {calculatePlayerTotal(player.scores)}
              </p>
              <p class="text-xs text-gray-500">Total Score</p>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}
