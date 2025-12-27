-- Games table - each game session
CREATE TABLE games (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by TEXT NOT NULL, -- Player name who created the game
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  max_players INTEGER DEFAULT 4,
  current_players INTEGER DEFAULT 1
);

-- Players in games - who's playing in each game
CREATE TABLE game_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(game_id, player_name)
);

-- Game scores - individual category scores for each player
CREATE TABLE game_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,

  -- Upper section scores
  ones INTEGER,
  twos INTEGER,
  threes INTEGER,
  fours INTEGER,
  fives INTEGER,
  sixes INTEGER,

  -- Lower section scores
  three_of_a_kind INTEGER,
  four_of_a_kind INTEGER,
  full_house BOOLEAN,
  small_straight BOOLEAN,
  large_straight BOOLEAN,
  yahtzee BOOLEAN,
  chance INTEGER,

  -- Special scoring
  yahtzee_bonus_count INTEGER DEFAULT 0,

  -- Scratched categories (stored as array of category names)
  scratched_categories TEXT[],

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  UNIQUE(game_id, player_name)
);

-- Enable real-time subscriptions
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (we'll tighten this up later)
CREATE POLICY "Allow all operations" ON games FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON game_players FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON game_scores FOR ALL USING (true);
