// src/components/speech/RealtimeSpeechAgent.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { MeetingWithTags } from '@/types';

interface RealtimeSpeechAgentProps {
  meetings: MeetingWithTags[];
  isActive?: boolean;
  className?: string;
}

export default function RealtimeSpeechAgent({ meetings, isActive = false, className = '' }: RealtimeSpeechAgentProps) {
  const [isListening, setIsListening] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listeningState, setListeningState] = useState<'idle' | 'listening' | 'processing'>('idle');
  
  // References for WebRTC
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  // Toggle listening state
  const toggleListening = async () => {
    if (sessionActive) {
      if (isListening) {
        // Stop listening but keep the session active
        setIsListening(false);
        setListeningState('idle');
        // Stop audio playback and mute microphone
        stopAudioPlayback();
        muteMicrophone(true);
      } else {
        // Resume listening in the existing session
        setIsListening(true);
        setListeningState('listening');
        // Unmute microphone
        muteMicrophone(false);
      }
    } else {
      // Start a new session
      try {
        setListeningState('processing'); // Show processing state while initializing
        await initializeSession();
        setIsListening(true);
        setListeningState('listening');
      } catch (err) {
        console.error('Failed to initialize speech session:', err);
        setError('Could not start speech session. Please try again.');
        setListeningState('idle');
      }
    }
  };
  
  // Mute or unmute the microphone
  const muteMicrophone = (mute: boolean) => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !mute;
      });
    }
  };
  
  // Stop audio playback
  const stopAudioPlayback = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.srcObject = null;
    }
  };

  // Initialize WebRTC session
  const initializeSession = async () => {
    try {
      // 1. Get an ephemeral key from your server
      const tokenResponse = await fetch('/api/realtime-token');
      if (!tokenResponse.ok) {
        throw new Error('Failed to get speech token');
      }
      
      const data = await tokenResponse.json();
      const ephemeralKey = data.client_secret.value;
      
      // 2. Create a peer connection
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;
      
      // 3. Set up to play remote audio from the model
      const audioEl = new Audio();
      audioEl.autoplay = true;
      audioElementRef.current = audioEl;
      
      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
      };
      
      // 4. Add local audio track for microphone input
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      localStreamRef.current = ms;
      pc.addTrack(ms.getTracks()[0]);
      
      // 5. Set up data channel for sending and receiving events
      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;
      
      dc.addEventListener('message', handleServerEvent);
      dc.addEventListener('open', () => {
        console.log('Data channel opened');
        // Configure the session once the data channel is open
        configureSession();
      });
      
      // 6. Start the session using SDP
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = 'gpt-4o-realtime-preview-2024-12-17';
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp'
        },
      });
      
      if (!sdpResponse.ok) {
        throw new Error(`Failed to connect to OpenAI: ${sdpResponse.statusText}`);
      }
      
      const answer: RTCSessionDescriptionInit = {
        type: 'answer' as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      
      await pc.setRemoteDescription(answer);
      setSessionActive(true);
      setError(null);
      
    } catch (err) {
      console.error('Error initializing WebRTC session:', err);
      cleanupSession();
      throw err;
    }
  };
  
  // Configure the session with meeting transcripts as context
const configureSession = () => {
  if (!dataChannelRef.current) return;
  
  // Get today's date in ISO format (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  
  // Filter meetings for today if needed
  // For now, we'll use all meetings to ensure comprehensive context
  const relevantMeetings = meetings;
  
  console.log(`Configuring speech agent with ${relevantMeetings.length} meetings as context`);
  
  // Format each meeting as a string
  const formattedMeetings = relevantMeetings.map((meeting, index) => {
    const meetingNumber = index + 1;
    const meetingDate = new Date(meeting.created_at).toLocaleDateString();
    const tags = meeting.tags.join(', ');
    
    return [
      `MEETING #${meetingNumber}:`,
      `Title: ${meeting.title}`,
      `Date: ${meetingDate}`,
      `Doctor: ${meeting.doctor_name}`,
      `Sales Rep: ${meeting.rep_name}`,
      `Drugs Discussed: ${meeting.drugs_discussed}`,
      `Tags: ${tags}`,
      `TRANSCRIPT:`,
      meeting.transcript,
      ''  // Empty line at the end
    ].join('\n');
  });
  
  // Join all meetings with a separator
  const transcriptContext = formattedMeetings.join('---\n\n');
  console.log('Transcript context:', transcriptContext);
  
  // Create the instructions as separate lines and join them
  const instructionLines = [
    'You are a helpful assistant for physicians analyzing pharmaceutical sales meetings.',
    '',
    'IMPORTANT GUIDELINES:',
    '1. Answer questions ONLY based on the provided meeting transcripts.',
    '2. Keep answers concise and focused on what\'s in the transcripts.',
    '3. If information isn\'t in the transcripts, say you don\'t have that information.',
    '4. When referring to specific meetings, mention which meeting number it came from.',
    '5. Prioritize recent meetings in your responses when relevant.',
    '',
    'The following are the meeting transcripts to reference:',
    '',
    transcriptContext
  ];
  
  const instructions = instructionLines.join('\n');
  
  // Update session with instructions and context
  const sessionUpdateEvent = {
    type: 'session.update',
    session: {
      instructions,
      voice: 'alloy', // Options: alloy, echo, fable, onyx, nova, shimmer
      turn_detection: {
        type: 'semantic_vad',
        eagerness: 'medium',
      }
    },
  };
  
  dataChannelRef.current.send(JSON.stringify(sessionUpdateEvent));
  console.log('Session configured with meeting transcripts');
};  // Handle events from the server
  const handleServerEvent = (e: MessageEvent) => {
    try {
      const serverEvent = JSON.parse(e.data);
      console.log('Received server event:', serverEvent.type);
      
      // Handle different event types
      switch (serverEvent.type) {
        case 'session.created':
          console.log('Session created successfully');
          break;
          
        case 'session.updated':
          console.log('Session updated successfully');
          break;
          
        case 'input_audio_buffer.speech_started':
          console.log('Speech detected');
          setListeningState('listening');
          break;
          
        case 'input_audio_buffer.speech_stopped':
          console.log('Speech ended');
          setListeningState('processing'); // Switch to processing when user stops speaking
          break;
          
        case 'response.audio_transcript.delta':
          // You could show the transcript of what the user is saying
          console.log('Transcript delta:', serverEvent.delta?.text);
          break;
          
        case 'response.text.delta':
          // You could show the assistant's response text
          console.log('Response delta:', serverEvent.delta?.text);
          break;
          
        case 'response.done':
          console.log('Response completed');
          // If still listening, go back to listening state, otherwise idle
          setListeningState(isListening ? 'listening' : 'idle');
          break;
          
        case 'error':
          console.error('Server error:', serverEvent.message);
          setError(`Error: ${serverEvent.message}`);
          setListeningState('idle');
          break;
      }
    } catch (err) {
      console.error('Error parsing server event:', err);
    }
  };
  
  // Clean up the session
  const cleanupSession = () => {
    // Stop audio playback
    stopAudioPlayback();
    
    // Stop local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    // Close data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Clear any error
    setError(null);
    setSessionActive(false);
    setIsListening(false);
    setListeningState('idle');
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupSession();
    };
  }, []);
  
  // When isActive prop changes (component is shown/hidden)
  useEffect(() => {
    if (!isActive && sessionActive) {
      cleanupSession();
    }
  }, [isActive, sessionActive]);
  
  // Get button text and styles based on listening state
  const getButtonContent = () => {
    switch (listeningState) {
      case 'listening':
        return {
          text: 'Listening...',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 10-2 0v2a1 1 0 102 0V7zm0 5a1 1 0 10-2 0v.01a1 1 0 102 0V12zm4-5a1 1 0 10-2 0v2a1 1 0 102 0V7zm0 5a1 1 0 10-2 0v.01a1 1 0 102 0V12z" clipRule="evenodd" />
            </svg>
          ),
          className: 'bg-yellow-500 text-white hover:bg-yellow-600'
        };
      case 'processing':
        return {
          text: 'Processing...',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ),
          className: 'bg-blue-500 text-white hover:bg-blue-600'
        };
      case 'idle':
      default:
        return {
          text: isListening ? 'Stop' : 'Ask AI',
          icon: isListening ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          ),
          className: isListening 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-primary-100 hover:bg-primary-200 text-primary-800'
        };
    }
  };
  
  const buttonContent = getButtonContent();
  
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleListening}
        className={`px-4 py-2 rounded-full font-medium flex items-center justify-center transition-colors duration-200 cursor-pointer ${buttonContent.className}`}
        disabled={listeningState === 'processing'}
      >
        <span className="mr-2">
          {buttonContent.icon}
        </span>
        {buttonContent.text}
      </button>
      
      {error && (
        <div className="text-red-500 mt-2 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
