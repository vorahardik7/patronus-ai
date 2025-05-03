// src/hooks/useRecording.ts
import { useState, useEffect } from 'react';

/**
 * Custom hook for handling audio recording functionality
 */
export function useRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused]);
  
  const startRecording = async () => {
    try {
      // Reset state
      setAudioChunks([]);
      setAudioUrl(null);
      setRecordingTime(0);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          setAudioChunks((chunks) => [...chunks, event.data]);
        }
      });
      
      recorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      });
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setIsPaused(false);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder && (isRecording || isPaused)) {
      mediaRecorder.stop();
      
      // Stop all audio tracks
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      
      setIsRecording(false);
      setIsPaused(false);
    }
  };
  
  const pauseRecording = () => {
    if (mediaRecorder && isRecording && !isPaused) {
      mediaRecorder.pause();
      setIsPaused(true);
    }
  };
  
  const resumeRecording = () => {
    if (mediaRecorder && isPaused) {
      mediaRecorder.resume();
      setIsPaused(false);
    }
  };
  
  return {
    isRecording,
    isPaused,
    recordingTime,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording
  };
}