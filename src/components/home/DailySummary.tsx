// src/components/home/DailySummary.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MeetingWithTags } from '@/types';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { SpeakerWaveIcon, ChatBubbleLeftRightIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import RealtimeSpeechAgent from '../speech/RealtimeSpeechAgent';

// Interface for cached summary data
interface CachedSummary {
  date: string; 
  audioUrl: string;
  summaryText: string;
  meetingIds: string[]; // To track which meetings were included in the summary
}

interface DailySummaryProps {
  meetings: MeetingWithTags[];
}

export default function DailySummary({ meetings }: DailySummaryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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

  // Function to generate summary audio
  const generateSummaryAudio = useCallback(async () => {
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
      
      // Store the data in state
      setAudioUrl(data.audioUrl);
      setSummaryText(data.summaryText);
      
      // Store the data in localStorage for caching
      const today = new Date().toISOString().split('T')[0];
      const cacheData: CachedSummary = {
        date: today,
        audioUrl: data.audioUrl,
        summaryText: data.summaryText,
        meetingIds: todayMeetings.map(m => m.id)
      };
      
      localStorage.setItem('dailySummaryCache', JSON.stringify(cacheData));
      console.log('Daily summary cached successfully');
    } catch (error) {
      console.error('Error generating summary audio:', error);
      setGenerationError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [todayMeetings]);

  // Check for cached summary and generate new one if needed
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const checkCache = async () => {
      try {
        // Try to get cached summary from localStorage
        const cachedDataString = localStorage.getItem('dailySummaryCache');
        
        if (cachedDataString) {
          const cachedData = JSON.parse(cachedDataString) as CachedSummary;
          
          // Check if the cache is from today
          if (cachedData.date === today) {
            // Check if all today's meetings are included in the cached summary
            const todayMeetingIds = todayMeetings.map(m => m.id);
            const allMeetingsIncluded = todayMeetingIds.every(id => 
              cachedData.meetingIds.includes(id)
            );
            
            // If we have a valid cache, use it
            if (allMeetingsIncluded || todayMeetingIds.length === 0) {
              console.log('Using cached daily summary');
              setAudioUrl(cachedData.audioUrl);
              setSummaryText(cachedData.summaryText);
              setIsCached(true);
              return;
            }
          }
        }
        
        // If we have meetings from today and no valid cache, generate a new summary
        if (todayMeetings.length > 0 && !audioUrl && !isLoading) {
          generateSummaryAudio();
        }
      } catch (error) {
        console.error('Error checking cache:', error);
        // If there's an error with the cache, generate a new summary
        if (todayMeetings.length > 0 && !audioUrl && !isLoading) {
          generateSummaryAudio();
        }
      }
    };
    
    checkCache();
  }, [meetings, audioUrl, isLoading, todayMeetings, generateSummaryAudio]);

  // Set up audio element
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
        audio.currentTime = 0;
      });
      
      return () => {
        audio.pause();
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('loadedmetadata', () => {});
        audio.removeEventListener('ended', () => {});
      };
    }
  }, [audioUrl]);
  
  const updateProgress = () => {
    if (audioRef.current) {
      const value = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(value);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const seekTo = Number(e.target.value);
    const seekTime = (seekTo / 100) * audioRef.current.duration;
    
    audioRef.current.currentTime = seekTime;
    setProgress(seekTo);
  };
  
  // Function to clear the cache for testing purposes
  const clearCache = () => {
    localStorage.removeItem('dailySummaryCache');
    setAudioUrl(null);
    setSummaryText(null);
    setIsCached(false);
    console.log('Daily summary cache cleared');
  };

  // If no meetings today, don't render the component
  if (todayMeetings.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden mb-8">
      <div 
        className="p-4 flex justify-between items-center hover:bg-secondary-50 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center">
          <div className="mr-4">
            <div>
              <h2 className="text-xl font-semibold text-secondary-900">Today&apos;s Summary</h2>
              <p className="text-secondary-600 mt-1">
                {todayMeetings.length} {todayMeetings.length === 1 ? 'meeting' : 'meetings'} recorded today
              </p>
            </div>
            {isCached && (
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Cached
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Ask AI Button - Always visible */}
          <div onClick={(e) => e.stopPropagation()}>
            <RealtimeSpeechAgent 
              meetings={todayMeetings} 
              isActive={true}
            />
          </div>
          
          {/* Play button - Always visible if audio available */}
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
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              className="flex items-center justify-center bg-primary-100 hover:bg-primary-200 text-primary-800 font-medium py-2 px-4 rounded-full transition-colors duration-200 cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <PauseIcon className="h-5 w-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Play
                </>
              )}
            </button>
          ) : generationError ? (
            <div className="flex items-center text-red-600" onClick={(e) => e.stopPropagation()}>
              <span className="mr-2">❌</span>
              {generationError}
            </div>
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                generateSummaryAudio();
              }}
              className="flex items-center justify-center bg-primary-100 hover:bg-primary-200 text-primary-800 font-medium py-2 px-4 rounded-full transition-colors duration-200"
            >
              <SpeakerWaveIcon className="h-5 w-5 mr-2" />
              Generate Audio Summary
            </button>
          )}

          {/* Collapse/Expand Button */}
          <button 
            className="text-secondary-500 hover:text-secondary-700"
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
          >
            {isCollapsed ? 
              <ChevronDownIcon className="h-5 w-5" /> : 
              <ChevronUpIcon className="h-5 w-5" />
            }
          </button>
        </div>
      </div>
      
      {/* Audio player controls - Always visible when playing */}
      {audioUrl && isPlaying && (
        <div className="px-4 pb-2">
          <div className="p-3 bg-primary-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-secondary-600">
                {audioRef.current ? 
                  `${Math.floor(audioRef.current.currentTime / 60)}:${String(Math.floor(audioRef.current.currentTime % 60)).padStart(2, '0')}` : 
                  '0:00'
                } / 
                {duration ? 
                  `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}` : 
                  '0:00'
                }
              </div>
              {isCached && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Cached Audio
                </span>
              )}
            </div>
            
            {/* Progress bar */}
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
          </div>
        </div>
      )}
      
      {!isCollapsed && (
        <div className="p-4 border-t border-secondary-100">
          {/* Display the summary text if available */}
          {summaryText && (
            <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-medium text-secondary-900">Summary</h3>
                <div className="flex items-center space-x-4">
                  {isCached && (
                    <button
                      onClick={clearCache}
                      className="text-xs text-secondary-500 hover:text-secondary-700 underline"
                    >
                      Clear cache (for testing)
                    </button>
                  )}
                </div>
              </div>
              <p className="text-secondary-700 text-sm whitespace-pre-line">{summaryText}</p>
            </div>
          )}
          
          {/* Show the additional info if there's no summary yet */}
          {!summaryText && todayMeetings.length > 0 && (
            <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-secondary-600" />
                  <h3 className="text-md font-medium text-secondary-900">Ask about today&apos;s meetings</h3>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}