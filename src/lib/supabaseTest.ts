import { supabase } from '$lib/supabase';

// Test connection and create a sample game
export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');

  try {
    // Test 1: Create a new game
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .insert({
        created_by: 'Test Player',
        status: 'active'
      })
      .select()
      .single();

    if (gameError) throw gameError;
    console.log('✅ Game created:', gameData);

    // Test 2: Add a player to the game
    const { data: playerData, error: playerError } = await supabase
      .from('game_players')
      .insert({
        game_id: gameData.id,
        player_name: 'Test Player'
      })
      .select()
      .single();

    if (playerError) throw playerError;
    console.log('✅ Player added:', playerData);

    // Test 3: Create initial score record
    const { data: scoreData, error: scoreError } = await supabase
      .from('game_scores')
      .insert({
        game_id: gameData.id,
        player_name: 'Test Player',
        ones: 3,
        full_house: true,
        scratched_categories: ['twos']
      })
      .select()
      .single();

    if (scoreError) throw scoreError;
    console.log('✅ Score record created:', scoreData);

    console.log('🎯 All tests passed! Supabase is ready.');
    return gameData.id;

  } catch (error) {
    console.error('❌ Supabase test failed:', error);
    throw error;
  }
}
