/*
  # Create watch sessions table

  1. New Tables
    - `watch_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `video_id` (text)
      - `start_time` (timestamp)
      - `end_time` (timestamp)
      - `watched_duration` (integer)
      - `total_duration` (integer)
      - `completion_rate` (decimal)
      - `interactions` (jsonb)
      - `quiz_results` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `watch_sessions` table
    - Add policies for users to manage their own sessions
*/

CREATE TABLE IF NOT EXISTS watch_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  video_id text NOT NULL,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  watched_duration integer DEFAULT 0,
  total_duration integer DEFAULT 0,
  completion_rate decimal(5,4) DEFAULT 0,
  interactions jsonb DEFAULT '[]',
  quiz_results jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE watch_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own watch sessions
CREATE POLICY "Users can read own watch sessions"
  ON watch_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own watch sessions
CREATE POLICY "Users can insert own watch sessions"
  ON watch_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own watch sessions
CREATE POLICY "Users can update own watch sessions"
  ON watch_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for better query performance
CREATE INDEX IF NOT EXISTS idx_watch_sessions_user_id ON watch_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_sessions_video_id ON watch_sessions(video_id);
CREATE INDEX IF NOT EXISTS idx_watch_sessions_created_at ON watch_sessions(created_at);