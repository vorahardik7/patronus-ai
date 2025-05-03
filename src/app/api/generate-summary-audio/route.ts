import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();
    
    if (!transcript) {
      return NextResponse.json(
        { error: 'No transcript provided' },
        { status: 400 }
      );
    }

    // 1. Generate a summary text using GPT-4o
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that creates concise summaries of pharmaceutical sales representative meetings with doctors. 
          Create a 1-2 minute summary of the key points from today's meetings, focusing on:
          1. The drugs/treatments discussed
          2. Key benefits mentioned
          3. Important clinical data points
          4. Any action items or follow-ups
          
          Make the summary professional, clear, and conversational as it will be converted to speech.`
        },
        {
          role: "user",
          content: transcript
        }
      ]
    });

    const summaryText = summaryResponse.choices[0].message.content;
    
    if (!summaryText) {
      throw new Error('Failed to generate summary text');
    }

    // 2. Convert the summary text to speech using OpenAI TTS
    const speechResponse = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy", // You can choose from 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'
      input: summaryText,
    });
    
    // Convert the audio to an ArrayBuffer
    const audioBuffer = await speechResponse.arrayBuffer();
    
    // 3. Upload the audio file to Supabase Storage
    const fileName = `summary-${new Date().toISOString().split('T')[0]}.mp3`;
    
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('audio-transcripts')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Error uploading summary audio:', uploadError);
      throw new Error(`Failed to upload summary audio: ${uploadError.message}`);
    }
    
    // 4. Get the public URL for the uploaded file
    const { data } = supabaseAdmin
      .storage
      .from('audio-transcripts')
      .getPublicUrl(fileName);
    
    const audioUrl = data?.publicUrl || '';
    
    // 5. Return the audio URL and summary text
    return NextResponse.json({
      audioUrl,
      summaryText,
    });
  } catch (error) {
    console.error('Error generating summary audio:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to generate summary audio: ${errorMessage}` },
      { status: 500 }
    );
  }
}
