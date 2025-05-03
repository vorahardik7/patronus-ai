import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Helper function to extract key points from transcript
function extractKeyPointsFromTranscript(transcript: string): string[] {
  // This is a simplified implementation
  // In a real app, you might use AI to extract key points
  
  // Split by sentences and take the first few that seem important
  const sentences = transcript.split(/[.!?]\s+/);
  
  return sentences
    .filter(sentence => 
      sentence.length > 20 && 
      !sentence.toLowerCase().includes('um') && 
      !sentence.toLowerCase().includes('uh')
    )
    .slice(0, 5) // Limit to 5 key points
    .map(sentence => sentence.trim() + '.');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transcript, metadata, audioUrl } = body;

    // --- Input Validation ---
    if (!transcript || !metadata || !metadata.doctorName || !metadata.repName) {
      return NextResponse.json({ error: 'Missing required fields: transcript, doctorName, and repName are required.' }, { status: 400 });
    }

    // Generate a unique ID for this meeting
    const meetingId = uuidv4();
    const now = new Date().toISOString();
    
    try {
      // Extract 5 key points from transcript if not already provided
      let keyPoints: string[] = [];
      if (metadata.keyPoints && Array.isArray(metadata.keyPoints) && metadata.keyPoints.length > 0) {
        // Use key points from metadata if provided
        keyPoints = metadata.keyPoints.slice(0, 5); // Limit to 5 key points
      } else {
        // Extract key points from transcript
        keyPoints = extractKeyPointsFromTranscript(transcript);
      }
      
      // 1. Store the meeting metadata, transcript, and key points in the meetings table
      const { error: meetingError } = await supabaseAdmin
        .from('meetings')
        .insert({
          id: meetingId,
          doctor_name: metadata.doctorName,
          rep_name: metadata.repName,
          drugs_discussed: metadata.drugsDiscussed,
          title: metadata.generatedTitle || 'Untitled Meeting',
          transcript: transcript,
          key_points: keyPoints,
          created_at: now,
          updated_at: now,
        });
        
      if (meetingError) {
        console.error('Error storing meeting data:', meetingError);
        throw new Error(`Failed to store meeting data: ${meetingError.message}`);
      }
      
      // 2. Store the tags in the meeting_tags table
      if (metadata.generatedTags && metadata.generatedTags.length > 0) {
        const tagData = metadata.generatedTags.map((tag: string) => ({
          meeting_id: meetingId,
          tag_name: tag,
          created_at: now,
        }));
        
        const { error: tagsError } = await supabaseAdmin
          .from('meeting_tags')
          .insert(tagData);
          
        if (tagsError) {
          console.error('Error storing meeting tags:', tagsError);
          // Continue even if tag storage fails
        }
      }
      
      // 3. Store audio file in Supabase Storage if provided
      let storedAudioUrl = null;
      if (audioUrl) {
        try {
          
          // Handle the audio data - could be a URL or base64 data
          let audioBuffer: ArrayBuffer;
          let contentType = 'audio/webm'; // Default content type
          
          // Check if it's a base64 data URL
          if (audioUrl && typeof audioUrl === 'string' && audioUrl.startsWith('data:')) {
            try {
              // Log the first 100 characters of the URL for debugging
              console.log('Processing base64 data URL, prefix:', audioUrl.substring(0, Math.min(100, audioUrl.length)) + '...');
              
              // Extract content type and base64 data
              let base64Data: string;
              
              // Try different regex patterns to handle various base64 formats
              const standardMatches = audioUrl.match(/^data:([^;]+);base64,(.+)$/);
              if (standardMatches && standardMatches.length === 3) {
                contentType = standardMatches[1];
                base64Data = standardMatches[2];
              } else {
                // Fallback: just try to find the base64 part after the comma
                const commaIndex = audioUrl.indexOf(',');
                if (commaIndex > 0) {
                  // Try to extract content type if possible
                  const contentTypeMatch = audioUrl.substring(0, commaIndex).match(/data:([^;]+)/);
                  if (contentTypeMatch && contentTypeMatch.length > 1) {
                    contentType = contentTypeMatch[1];
                  }
                  base64Data = audioUrl.substring(commaIndex + 1);
                } else {
                  console.error('Could not find comma in data URL');
                  throw new Error('Invalid base64 data URL format - no comma found');
                }
              }
              
              console.log(`Extracted content type: ${contentType}`);
              console.log(`Base64 data length: ${base64Data.length} characters`);
              
              // Convert base64 to array buffer
              const binaryString = atob(base64Data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              audioBuffer = bytes.buffer;
              console.log(`Converted to ArrayBuffer of ${audioBuffer.byteLength} bytes`);
            } catch (error) {
              const parseError = error as Error;
              console.error('Error parsing base64 data:', parseError);
              // If we can't parse the base64 data, we'll skip audio storage
              // but still save the meeting metadata and transcript
              console.log('Skipping audio storage due to parsing error');
              return; // Skip audio storage but continue with the rest of the function
            }
          } else {
            // It's a URL, fetch it
            const audioResponse = await fetch(audioUrl);
            if (!audioResponse.ok) {
              throw new Error(`Failed to fetch audio file: ${audioResponse.statusText}`);
            }
            audioBuffer = await audioResponse.arrayBuffer();
            contentType = audioResponse.headers.get('content-type') || contentType;
          }
          const fileName = `${meetingId}.webm`;
          
          // Upload the audio file to Supabase Storage
          // Using the recommended approach from Supabase docs
          let publicUrl = '';
          try {
            const { error: uploadError } = await supabaseAdmin
              .storage
              .from('audio-transcripts')
              .upload(fileName, audioBuffer, {
                contentType,
                upsert: true
              });
            
            if (uploadError) {
              console.error('Error uploading audio file:', uploadError);
              console.warn('Continuing without audio file due to storage policy issue');
            } else {
              // Get the public URL for the uploaded file
              const { data } = supabaseAdmin
                .storage
                .from('audio-transcripts')
                .getPublicUrl(fileName);
              
              const url = data?.publicUrl || '';
              
              publicUrl = url;
            }
          } catch (error) {
            console.error('Error in audio upload process:', error);
            console.warn('Continuing without audio file');
          }
            
          storedAudioUrl = publicUrl;
          
          // 3. Store the audio reference if available
          if (storedAudioUrl) {
            console.log('Storing audio reference in meeting_audio table:', { meeting_id: meetingId, audio_url: storedAudioUrl });
            const { data: audioData, error: audioError } = await supabaseAdmin
              .from('meeting_audio')
              .insert({
                meeting_id: meetingId,
                audio_url: storedAudioUrl,
                created_at: now,
              })
              .select();
                
            if (audioError) {
              console.error('Error storing audio reference:', audioError);
              // Log more details about the error
              console.error('Error details:', JSON.stringify(audioError));
            } else {
              console.log('Successfully stored audio reference:', audioData);
            }
          } else {
            console.log('No audio URL available to store');
          }
        } catch (audioUploadError) {
          console.error('Error processing audio:', audioUploadError);
          // Continue even if audio upload fails
        }
      }
      
      console.log(`Meeting saved successfully with ID: ${meetingId}`);
      
      // Return a success response
      return NextResponse.json({ 
        message: 'Meeting saved successfully', 
        meetingId: meetingId 
      }, { status: 200 });
      
    } catch (innerError) {
      console.error('Error in Supabase operations:', innerError);
      throw innerError; // Re-throw to be caught by the outer catch
    }
  } catch (error) {
    console.error('Error saving meeting:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to save meeting: ${errorMessage}` },
      { status: 500 }
    );
  }
}
