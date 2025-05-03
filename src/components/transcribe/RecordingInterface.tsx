// src/components/transcribe/RecordingInterface.tsx
import { useState } from 'react';
import { 
  MicrophoneIcon, 
  StopIcon, 
  ArrowUpTrayIcon,
  PauseIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface RecordingInterfaceProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export default function RecordingInterface({
  isRecording,
  onStartRecording,
  onStopRecording
}: RecordingInterfaceProps) {
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // In a real app, this would be connected to actual recording functionality
  const startRecording = () => {
    onStartRecording();
    
    // Start a timer for demo purposes
    const timer = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    // Store the timer ID in a data attribute for cleanup
    document.getElementById('recording-timer')?.setAttribute('data-timer-id', String(timer));
  };
  
  const stopRecording = () => {
    // Clear the timer
    const timerId = document.getElementById('recording-timer')?.getAttribute('data-timer-id');
    if (timerId) {
      clearInterval(Number(timerId));
    }
    
    onStopRecording();
    setRecordingTime(0);
  };
  
  const togglePause = () => {
    setIsPaused(!isPaused);
    
    const timerId = document.getElementById('recording-timer')?.getAttribute('data-timer-id');
    
    if (isPaused) {
      // Resume
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      document.getElementById('recording-timer')?.setAttribute('data-timer-id', String(timer));
    } else {
      // Pause
      if (timerId) {
        clearInterval(Number(timerId));
      }
    }
  };
  
  const cancelRecording = () => {
    // Clear the timer
    const timerId = document.getElementById('recording-timer')?.getAttribute('data-timer-id');
    if (timerId) {
      clearInterval(Number(timerId));
    }
    
    setRecordingTime(0);
    setIsPaused(false);
    onStopRecording();
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would process the uploaded audio file
      console.log('File uploaded:', file.name);
      setTimeout(onStopRecording, 1000); // Simulate processing delay
    }
  };

  return (
    <div className="card p-6">
      <h2 className="font-semibold text-lg text-secondary-900 mb-4">Recording Controls</h2>
      
      <div className="space-y-6">
        {!isRecording ? (
          <>
            <div>
              <button
                onClick={startRecording}
                className="w-full py-3 px-4 btn-primary flex items-center justify-center"
              >
                <MicrophoneIcon className="h-5 w-5 mr-2" />
                Start New Recording
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-sm text-secondary-500">Or</span>
              </div>
            </div>
            
            <div>
              <label
                htmlFor="file-upload"
                className="w-full py-3 px-4 btn-outline flex items-center justify-center cursor-pointer"
              >
                <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                Upload Audio File
              </label>
              <input 
                id="file-upload" 
                type="file" 
                accept="audio/*" 
                className="hidden" 
                onChange={handleFileUpload}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <div id="recording-timer" className="text-4xl font-semibold text-secondary-900">
                {formatTime(recordingTime)}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={togglePause}
                className={`flex-1 py-3 px-4 flex items-center justify-center rounded-md font-medium ${
                  isPaused 
                    ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
              >
                {isPaused ? (
                  <>
                    <MicrophoneIcon className="h-5 w-5 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <PauseIcon className="h-5 w-5 mr-2" />
                    Pause
                  </>
                )}
              </button>
              
              <button
                onClick={cancelRecording}
                className="py-3 px-4 flex items-center justify-center rounded-md font-medium text-red-700 bg-red-100 hover:bg-red-200"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
            
            <button
              onClick={stopRecording}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium flex items-center justify-center"
            >
              <StopIcon className="h-5 w-5 mr-2" />
              Stop Recording
            </button>
          </>
        )}
      </div>
      
      <div className="mt-6 border-t border-secondary-200 pt-4">
        <h3 className="font-medium text-secondary-900 mb-2">Recording Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="speaker-detection" className="flex items-center">
              <input 
                id="speaker-detection" 
                type="checkbox" 
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                defaultChecked
              />
              <span className="ml-2 text-sm text-secondary-700">Enable speaker detection</span>
            </label>
          </div>
          
          <div>
            <label htmlFor="noise-reduction" className="flex items-center">
              <input 
                id="noise-reduction" 
                type="checkbox" 
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                defaultChecked
              />
              <span className="ml-2 text-sm text-secondary-700">Enable noise reduction</span>
            </label>
          </div>
          
          <div>
            <label htmlFor="auto-highlights" className="flex items-center">
              <input 
                id="auto-highlights" 
                type="checkbox" 
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                defaultChecked
              />
              <span className="ml-2 text-sm text-secondary-700">Auto-identify key points</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}