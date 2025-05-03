// src/app/transcribe/page.tsx
'use client';

import { useState } from 'react';
import RecordingInterface from '@/components/transcribe/RecordingInterface';
import TranscriptEditor from '@/components/transcribe/TranscriptEditor';
import SummaryGenerator from '@/components/transcribe/SummaryGenerator';
import { TranscriptSegment } from '@/types';

export default function TranscribePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [summary, setSummary] = useState<string>('');

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingComplete(false);
    setTranscript([]);
    setSummary('');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setRecordingComplete(true);
    
    // Mock transcript data for demo purposes
    setTranscript([
      {
        id: '1',
        speaker: 'rep',
        text: 'Good morning, Dr. Johnson. I\'m here to tell you about our new drug, Cardiofix, which has shown remarkable results in treating hypertension.',
        timestamp: 0
      },
      {
        id: '2',
        speaker: 'doctor',
        text: 'Good morning. I\'ve heard about it. Could you tell me about the clinical trials?',
        timestamp: 8
      },
      {
        id: '3',
        speaker: 'rep',
        text: 'Absolutely. In our phase 3 trials, Cardiofix reduced blood pressure by an average of 15% more effectively than the current standard treatments, with minimal side effects.',
        timestamp: 12
      },
      {
        id: '4',
        speaker: 'doctor',
        text: 'What about patients with comorbidities, especially diabetes?',
        timestamp: 20
      },
      {
        id: '5',
        speaker: 'rep',
        text: 'That\'s an excellent question. Cardiofix was specifically tested in patients with diabetes and showed no negative impact on blood glucose levels. In fact, 40% of our trial participants had type 2 diabetes.',
        timestamp: 25
      },
      {
        id: '6',
        speaker: 'doctor',
        text: 'And dosing schedule?',
        timestamp: 38
      },
      {
        id: '7',
        speaker: 'rep',
        text: 'It\'s a once-daily oral tablet, which should help with patient compliance. We also have a extended-release formulation coming soon.',
        timestamp: 40
      }
    ]);
  };

  const handleTranscriptEdit = (updatedTranscript: TranscriptSegment[]) => {
    setTranscript(updatedTranscript);
  };

  const handleGenerateSummary = () => {
    // In a real app, this would be an API call to process the transcript
    setTimeout(() => {
      setSummary(`
        Presentation on Cardiofix for hypertension treatment
        
        Key points:
        - Reduces blood pressure by 15% more effectively than standard treatments
        - Minimal side effects in clinical trials
        - Safe for patients with diabetes (40% of trial participants had type 2 diabetes)
        - No negative impact on blood glucose levels
        - Once-daily oral tablet for better compliance
        - Extended-release formulation in development
        
        Potentially relevant for patients with:
        - Hypertension, especially difficult to control cases
        - Comorbid diabetes and hypertension
        - Compliance issues with multiple daily doses
      `);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          Record & Transcribe Conversations
        </h1>
        <p className="text-secondary-600">
          Capture, transcribe, and summarize pharmaceutical sales representative conversations
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RecordingInterface 
            isRecording={isRecording}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
          />
        </div>
        
        <div className="lg:col-span-2">
          {recordingComplete && (
            <>
              <TranscriptEditor 
                transcript={transcript} 
                onTranscriptEdit={handleTranscriptEdit} 
              />
              
              <div className="mt-6">
                <SummaryGenerator 
                  transcript={transcript}
                  summary={summary}
                  onGenerateSummary={handleGenerateSummary}
                />
              </div>
            </>
          )}
          
          {!recordingComplete && !isRecording && (
            <div className="card p-8 text-center">
              <p className="text-secondary-600 mb-2">
                No active recording or transcript
              </p>
              <p className="text-secondary-500 text-sm">
                Start a new recording or upload an audio file to begin
              </p>
            </div>
          )}
          
          {isRecording && (
            <div className="card p-8">
              <div className="flex flex-col items-center justify-center">
                <div className="w-full max-w-md mx-auto">
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-primary-200">
                      <div className="animate-pulse w-full h-full bg-primary-500"></div>
                    </div>
                  </div>
                  <p className="text-center mt-4 text-secondary-600">
                    Recording in progress... 
                  </p>
                  <p className="text-center mt-2 text-secondary-500 text-sm">
                    Speech is being transcribed in real-time
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
