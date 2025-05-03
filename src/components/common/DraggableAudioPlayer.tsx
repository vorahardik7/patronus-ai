// src/components/common/DraggableAudioPlayer.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PlayIcon, PauseIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface DraggableAudioPlayerProps {
  audioUrl: string;
  title: string;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
}

export default function DraggableAudioPlayer({ audioUrl, title, onClose, initialPosition = { x: 20, y: 20 } }: DraggableAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  
  // Initialize audio element
  useEffect(() => {
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
  }, [audioUrl]);
  
  const updateProgress = () => {
    if (audioRef.current) {
      const value = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(value);
    }
  };
  
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
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
  
  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!playerRef.current) return;
    
    setIsDragging(true);
    
    // Calculate the offset between mouse position and player position
    const rect = playerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    // Calculate new position based on mouse position and offset
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add and remove event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  // Format time (seconds) to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div 
      ref={playerRef}
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-secondary-200 w-72 overflow-hidden"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      {/* Draggable header */}
      <div 
        className="bg-primary-600 text-white p-3 flex justify-between items-center cursor-grab"
        onMouseDown={handleMouseDown}
      >
        <div className="text-sm font-medium truncate">{title}</div>
        <button 
          onClick={onClose}
          className="text-white hover:text-primary-100"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      
      {/* Player controls */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={togglePlayPause}
            className="bg-primary-100 hover:bg-primary-200 text-primary-800 rounded-full p-2 transition-colors duration-200"
          >
            {isPlaying ? (
              <PauseIcon className="h-6 w-6" />
            ) : (
              <PlayIcon className="h-6 w-6" />
            )}
          </button>
          
          <div className="text-xs text-secondary-600">
            {audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'} / 
            {duration ? formatTime(duration) : '0:00'}
          </div>
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
  );
}
