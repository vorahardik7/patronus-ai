// src/types/index.ts

// Original types for the existing UI components
export interface Summary {
  id: string;
  title: string;
  drugName: string;
  createdAt: string;
  updatedAt: string;
  presenter: string;
  doctorName: string;
  keyPoints: string[];
  relevantPatients?: number;
  tags: string[];
}

export interface FilterOptions {
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}

export interface TranscriptSegment {
  id: string;
  speaker: 'rep' | 'doctor';
  text: string;
  timestamp: number;
}

export interface Recording {
  id: string;
  title: string;
  createdAt: string;
  duration: number;
  fileUrl?: string;
  transcript: TranscriptSegment[];
  isProcessing: boolean;
  isComplete: boolean;
}

export type SortOrder = 'newest' | 'oldest' | 'relevance';

// New types for Supabase data
export interface MeetingData {
  id: string;
  doctor_name: string;
  rep_name: string;
  drugs_discussed: string;
  title: string;
  transcript: string;
  key_points?: string[]; // Added key_points as optional array of strings
  created_at: string;
  updated_at: string;
}

export interface MeetingTag {
  id: string;
  meeting_id: string;
  tag_name: string;
  created_at: string;
}

export interface MeetingAudio {
  id: string;
  meeting_id: string;
  audio_url: string;
  created_at: string;
}

// Combined meeting data with tags
export interface MeetingWithTags extends MeetingData {
  tags: string[];
  audio_url?: string;
}

// Function to convert MeetingWithTags to Summary for compatibility with existing components
export function meetingToSummary(meeting: MeetingWithTags): Summary {
  // Use stored key points if available, otherwise extract from transcript
  const keyPoints = meeting.key_points && meeting.key_points.length > 0
    ? meeting.key_points
    : meeting.transcript
      ? extractKeyPointsFromTranscript(meeting.transcript)
      : [];
  
  return {
    id: meeting.id,
    title: meeting.title,
    drugName: meeting.drugs_discussed || 'Not specified',
    createdAt: meeting.created_at,
    updatedAt: meeting.updated_at,
    presenter: meeting.rep_name,
    doctorName: meeting.doctor_name,
    keyPoints: keyPoints,
    tags: meeting.tags || [],
  };
}

// Helper function to extract key points from transcript
function extractKeyPointsFromTranscript(transcript: string): string[] {
  // This is a simplified implementation
  // In a real app, you might use AI to extract key points
  // or have a separate field in the database
  
  // For now, just split by sentences and take the first few that seem important
  const sentences = transcript.split(/[.!?]\s+/);
  
  return sentences
    .filter(sentence => 
      sentence.length > 20 && 
      !sentence.toLowerCase().includes('um') && 
      !sentence.toLowerCase().includes('uh')
    )
    .slice(0, 4)
    .map(sentence => sentence.trim() + '.');
}