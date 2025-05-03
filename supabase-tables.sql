CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY,
  doctor_name TEXT NOT NULL,
  rep_name TEXT NOT NULL,
  drugs_discussed TEXT,
  title TEXT NOT NULL,
  transcript TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS meeting_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS meeting_audio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_meeting_tags_meeting_id ON meeting_tags(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_audio_meeting_id ON meeting_audio(meeting_id);
