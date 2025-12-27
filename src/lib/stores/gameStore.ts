import { writable } from 'svelte/store';
import type { UpperValue } from '$lib/components/UpperRow.svelte';
import type { LowerValue } from '$lib/components/LowerRow.svelte';

export interface GameState {
  // Upper section state
  upper: {
    ones: UpperValue;
    twos: UpperValue;
    threes: UpperValue;
    fours: UpperValue;
    fives: UpperValue;
    sixes: UpperValue;
  };

  // Lower section state
  lower: {
    threeOfAKind: LowerValue;
    fourOfAKind: LowerValue;
    fullHouse: LowerValue;
    smallStraight: LowerValue;
    largeStraight: LowerValue;
    yahtzee: LowerValue;
    chance: LowerValue;
  };

  // Future game metadata
  gameId?: string;
  playerId?: string;
  playerName?: string;
  createdAt?: Date;
  yahtzeBonusCount?: number;
}

// Initial state - upper categories start as 0 (default selected), lower as null
const initialState: GameState = {
  upper: {
    ones: 0,
    twos: 0,
    threes: 0,
    fours: 0,
    fives: 0,
    sixes: 0,
  },
  lower: {
    threeOfAKind: null,
    fourOfAKind: null,
    fullHouse: null,
    smallStraight: null,
    largeStraight: null,
    yahtzee: null,
    chance: null,
  },
  yahtzeBonusCount: 0,
};

// Create the writable store
export const gameState = writable<GameState>(initialState);

// Helper functions for updating specific parts of the state
export const updateUpperCategory = (category: keyof GameState['upper'], value: UpperValue) => {
  gameState.update(state => {
    const newState = {
      ...state,
      upper: {
        ...state.upper,
        [category]: value
      }
    };
    // Auto-save if we have game info
    if (newState.gameId && newState.playerName) {
      import('$lib/gameSync').then(({ saveGameState }) => {
        saveGameState(newState);
      });
    }
    return newState;
  });
};

export const updateLowerCategory = (category: keyof GameState['lower'], value: LowerValue) => {
  gameState.update(state => {
    const newState = {
      ...state,
      lower: {
        ...state.lower,
        [category]: value
      }
    };
    // Auto-save if we have game info
    if (newState.gameId && newState.playerName) {
      import('$lib/gameSync').then(({ saveGameState }) => {
        saveGameState(newState);
      });
    }
    return newState;
  });
};

// Reset game state (useful for new games)
export const resetGame = () => {
  gameState.set(initialState);
};

// Set game metadata (when joining/creating games)
export const setGameInfo = (gameId: string, playerId: string, playerName: string) => {
  gameState.update(state => ({
    ...state,
    gameId,
    playerId,
    playerName,
    createdAt: new Date()
  }));
};
