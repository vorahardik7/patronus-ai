// src/components/home/DailySummary.tsx
'use client';

import { useState, useEffect } from 'react';
import { MeetingWithTags } from '@/types';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';

interface DailySummaryProps {
  meetings: MeetingWithTags[];
}

export default function DailySummary({ meetings }: DailySummaryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // Filter meetings from today
  const todayMeetings = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.created_at);
    const today = new Date();
    return (
      meetingDate.getDate() === today.getDate() &&
      meetingDate.getMonth() === today.getMonth() &&
      meetingDate.getFullYear() === today.getFullYear()
    );
  });

  // Generate summary on component mount if we have meetings from today
  useEffect(() => {
    if (todayMeetings.length > 0 && !audioUrl && !isLoading) {
      generateSummaryAudio();
    }
  }, [meetings]);

  // Set up audio element
  useEffect(() => {
    if (audioUrl && !audioElement) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
    }
    
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioUrl]);

  const generateSummaryAudio = async () => {
    if (todayMeetings.length === 0) return;
    
    setIsLoading(true);
    setGenerationError(null);
    
    try {
      // Combine all transcripts from today's meetings
      const combinedTranscripts = todayMeetings.map(meeting => {
        return `Meeting with ${meeting.doctor_name} about ${meeting.drugs_discussed}: ${meeting.transcript}`;
      }).join('\n\n');
      
      // Call API to generate summary audio
      const response = await fetch('/api/generate-summary-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: combinedTranscripts }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate summary: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAudioUrl(data.audioUrl);
    } catch (error) {
      console.error('Error generating summary audio:', error);
      setGenerationError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  // If no meetings today, don't render the component
  if (todayMeetings.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-secondary-900">Today's Summary</h2>
          <p className="text-secondary-600 mt-1">
            {todayMeetings.length} {todayMeetings.length === 1 ? 'meeting' : 'meetings'} recorded today
          </p>
        </div>
        
        <div className="flex items-center">
          {isLoading ? (
            <div className="flex items-center text-secondary-600">
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating summary...
            </div>
          ) : audioUrl ? (
            <button 
              onClick={togglePlayPause}
              className="flex items-center justify-center bg-primary-100 hover:bg-primary-200 text-primary-800 font-medium py-2 px-4 rounded-full transition-colors duration-200"
            >
              {isPlaying ? (
                <>
                  <PauseIcon className="h-5 w-5 mr-2" />
                  Pause Summary
                </>
              ) : (
                <>
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Play Summary
                </>
              )}
            </button>
          ) : generationError ? (
            <div className="flex items-center text-red-600">
              <span className="mr-2">❌</span>
              {generationError}
            </div>
          ) : (
            <button 
              onClick={generateSummaryAudio}
              className="flex items-center justify-center bg-primary-100 hover:bg-primary-200 text-primary-800 font-medium py-2 px-4 rounded-full transition-colors duration-200"
            >
              <SpeakerWaveIcon className="h-5 w-5 mr-2" />
              Generate Audio Summary
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
