import { supabase } from '$lib/supabase';
import { gameState, setGameInfo } from '$lib/stores/gameStore';
import type { GameState } from '$lib/stores/gameStore';

// Create a new game session
export async function createGame(createdBy: string) {
  try {
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .insert({
        created_by: createdBy,
        status: 'active'
      })
      .select()
      .single();

    if (gameError) throw gameError;

    // Add the creator as the first player
    const { error: playerError } = await supabase
      .from('game_players')
      .insert({
        game_id: gameData.id,
        player_name: createdBy
      });

    if (playerError) throw playerError;

    // Create initial score record
    const { error: scoreError } = await supabase
      .from('game_scores')
      .insert({
        game_id: gameData.id,
        player_name: createdBy,
        scratched_categories: []
      });

    if (scoreError) throw scoreError;

    // Update local store with game info
    setGameInfo(gameData.id, crypto.randomUUID(), createdBy);

    console.log('✅ Game created:', gameData.id);
    return gameData.id;

  } catch (error) {
    console.error('❌ Failed to create game:', error);
    throw error;
  }
}

// Join an existing game
export async function joinGame(gameId: string, playerName: string) {
  try {
    console.log('🔍 Attempting to join game:', { gameId, playerName });

    // Check if game exists and is active
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .eq('status', 'active')
      .single();

    if (gameError) {
      console.error('❌ Game query error:', gameError);
      throw new Error(`Game not found: ${gameError.message}`);
    }

    if (!gameData) {
      throw new Error('Game not found or not active');
    }

    console.log('✅ Game found:', gameData);

    // Add player to game (or update if already exists)
    const { error: playerError } = await supabase
      .from('game_players')
      .upsert({
        game_id: gameId,
        player_name: playerName,
        joined_at: new Date().toISOString()
      }, {
        onConflict: 'game_id,player_name'
      });

    if (playerError) {
      console.error('❌ Player insert error:', playerError);
      throw new Error(`Failed to add player: ${playerError.message}`);
    }

    console.log('✅ Player added/updated');

    // Check if score record already exists
    const { data: existingScore, error: checkError } = await supabase
      .from('game_scores')
      .select('*')
      .eq('game_id', gameId)
      .eq('player_name', playerName)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found, which is OK
      console.error('❌ Score check error:', checkError);
      throw new Error(`Failed to check existing scores: ${checkError.message}`);
    }

    // Only create initial score record if it doesn't exist
    if (!existingScore) {
      console.log('🆕 Creating new score record');
      const { error: scoreError } = await supabase
        .from('game_scores')
        .insert({
          game_id: gameId,
          player_name: playerName,
          scratched_categories: []
        });

      if (scoreError) {
        console.error('❌ Score insert error:', scoreError);
        throw new Error(`Failed to create score record: ${scoreError.message}`);
      }
    } else {
      console.log('✅ Score record already exists, skipping creation');
    }

    // Update local store
    setGameInfo(gameId, crypto.randomUUID(), playerName);

    // Load existing game state for this player
    await loadGameState(gameId, playerName);

    console.log('✅ Joined game:', gameId);
    return gameId;

  } catch (error) {
    console.error('❌ Failed to join game:', error);
    throw error;
  }
}

// Load game state from database
export async function loadGameState(gameId: string, playerName: string) {
  try {
    console.log('🔍 Loading game state for:', { gameId, playerName });

    const { data, error } = await supabase
      .from('game_scores')
      .select('*')
      .eq('game_id', gameId)
      .eq('player_name', playerName)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found is OK for new games
      console.error('❌ Load game state error:', error);
      throw error;
    }

    if (data) {
      console.log('📊 Raw database data:', data);

      // Handle scratched categories
      const scratchedCategories = data.scratched_categories || [];

      // Helper function to get value (null, number, or 'scratch')
      const getValue = (dbValue: any, categoryName: string) => {
        if (scratchedCategories.includes(categoryName)) {
          return 'scratch';
        }
        return dbValue; // This could be null, number, or boolean
      };

      // Update store with loaded data
      gameState.update(state => ({
        ...state,
        upper: {
          ones: getValue(data.ones, 'ones'),
          twos: getValue(data.twos, 'twos'),
          threes: getValue(data.threes, 'threes'),
          fours: getValue(data.fours, 'fours'),
          fives: getValue(data.fives, 'fives'),
          sixes: getValue(data.sixes, 'sixes')
        },
        lower: {
          threeOfAKind: getValue(data.three_of_a_kind, 'threeOfAKind'),
          fourOfAKind: getValue(data.four_of_a_kind, 'fourOfAKind'),
          fullHouse: getValue(data.full_house, 'fullHouse'),
          smallStraight: getValue(data.small_straight, 'smallStraight'),
          largeStraight: getValue(data.large_straight, 'largeStraight'),
          yahtzee: getValue(data.yahtzee, 'yahtzee'),
          chance: getValue(data.chance, 'chance')
        },
        yahtzeBonusCount: data.yahtzee_bonus_count || 0
      }));

      console.log('✅ Game state loaded and updated');
    } else {
      console.log('ℹ️ No existing game state found (new player)');
    }

  } catch (error) {
    console.error('❌ Failed to load game state:', error);
    throw error;
  }
}

// Save current game state to database
export async function saveGameState(state: GameState) {
  if (!state.gameId || !state.playerName) {
    console.warn('No game ID or player name, skipping save');
    return;
  }

  try {
    // Map scratched categories
    const scratchedCategories: string[] = [];

    // Check upper section for scratches
    Object.entries(state.upper).forEach(([key, value]) => {
      if (value === 'scratch') {
        scratchedCategories.push(key);
      }
    });

    // Check lower section for scratches
    Object.entries(state.lower).forEach(([key, value]) => {
      if (value === 'scratch') {
        scratchedCategories.push(key);
      }
    });

    const { error } = await supabase
      .from('game_scores')
      .upsert({
        game_id: state.gameId,
        player_name: state.playerName,

        // Upper section
        ones: state.upper.ones === 'scratch' ? null : state.upper.ones,
        twos: state.upper.twos === 'scratch' ? null : state.upper.twos,
        threes: state.upper.threes === 'scratch' ? null : state.upper.threes,
        fours: state.upper.fours === 'scratch' ? null : state.upper.fours,
        fives: state.upper.fives === 'scratch' ? null : state.upper.fives,
        sixes: state.upper.sixes === 'scratch' ? null : state.upper.sixes,

        // Lower section
        three_of_a_kind: state.lower.threeOfAKind === 'scratch' ? null : state.lower.threeOfAKind,
        four_of_a_kind: state.lower.fourOfAKind === 'scratch' ? null : state.lower.fourOfAKind,
        full_house: state.lower.fullHouse === 'scratch' ? null : state.lower.fullHouse,
        small_straight: state.lower.smallStraight === 'scratch' ? null : state.lower.smallStraight,
        large_straight: state.lower.largeStraight === 'scratch' ? null : state.lower.largeStraight,
        yahtzee: state.lower.yahtzee === 'scratch' ? null : state.lower.yahtzee,
        chance: state.lower.chance === 'scratch' ? null : state.lower.chance,

        yahtzee_bonus_count: state.yahtzeBonusCount || 0,
        scratched_categories: scratchedCategories,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'game_id,player_name'
      });

    if (error) throw error;

    console.log('✅ Game state saved');

  } catch (error) {
    console.error('❌ Failed to save game state:', error);
    // Don't throw - we don't want to break the UI for save failures
  }
}
