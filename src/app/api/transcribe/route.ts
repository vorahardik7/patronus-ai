import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your .env.local
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('file'); // Get the potential file
    
    // Check if a file was provided and if it's actually a File object
    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json(
        { error: 'No valid audio file provided' },
        { status: 400 }
      );
    }

    // Call OpenAI's transcription API, passing the File object directly
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile, // Pass the File object directly
      model: 'whisper-1', // Use the correct Whisper model name
      response_format: 'json'
    });

    return NextResponse.json(transcription);
  } catch (error) {
    console.error('Transcription API error:', error);
    // Provide a slightly more informative error message in the response
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during transcription.';
    return NextResponse.json(
      { error: `Failed to transcribe audio: ${errorMessage}` },
      { status: 500 }
    );
  }
}