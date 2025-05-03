import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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

    // Call OpenAI's GPT-4o to analyze the transcript
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes medical sales representative conversations with doctors.
          Extract the following information from the transcript:
          1. Generate a concise, professional title for this meeting (max 10 words)
          2. Generate 5-10 relevant tags that would be useful for searching this conversation later
          
          Format your response as JSON with the following structure:
          {
            "title": "Meeting title here",
            "tags": ["tag1", "tag2", "tag3", ...]
          }
          
          Only return the JSON, nothing else.`
        },
        {
          role: "user",
          content: transcript
        }
      ],
      response_format: { type: "json_object" }
    });

    // Extract the JSON from the response
    const analysisText = completion.choices[0].message.content;
    let analysis;
    
    try {
      analysis = JSON.parse(analysisText || '{}');
    } catch (e) {
      console.error('Error parsing GPT-4o response:', e);
      return NextResponse.json(
        { error: 'Failed to parse analysis results' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      title: analysis.title || 'Untitled Meeting',
      tags: Array.isArray(analysis.tags) ? analysis.tags : [],
    });
  } catch (error) {
    console.error('Analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to analyze transcript: ${errorMessage}` },
      { status: 500 }
    );
  }
}
