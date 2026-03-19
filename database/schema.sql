-- Profile Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  username VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE,
  password_hash VARCHAR,
  balance INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  role VARCHAR DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Games Table
CREATE TABLE IF NOT EXISTS games (
  id BIGSERIAL PRIMARY KEY,
  team_a VARCHAR NOT NULL,
  team_b VARCHAR NOT NULL,
  phase VARCHAR CHECK (phase IN ('group', 'semifinals', 'final')),
  group_name VARCHAR,
  start_time TIMESTAMP WITH TIME ZONE,
  status VARCHAR DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
  winner VARCHAR,
  loser VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bets Table
CREATE TABLE IF NOT EXISTS bets (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  game_id BIGINT REFERENCES games(id) ON DELETE CASCADE,
  predicted_winner VARCHAR NOT NULL,
  is_correct BOOLEAN DEFAULT NULL,
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- Game Status Log
CREATE TABLE IF NOT EXISTS game_status_log (
  id BIGSERIAL PRIMARY KEY,
  game_id BIGINT REFERENCES games(id),
  old_status VARCHAR,
  new_status VARCHAR,
  changed_by UUID REFERENCES profiles(id),
  changed_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
