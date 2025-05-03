# Patronus AI

Patronus AI is a comprehensive web application designed as an extension of ***Commure's Scribe*** to record, transcribe, analyze, and organize conversations between pharmaceutical sales representatives and physicians. The platform enables healthcare providers to share key information about pharmaceutical presentations across their entire hospital network, transforming isolated meetings into valuable institutional knowledge. This solution applies to both in-person and virtual meetings. The main problem our solution aims to solve is the challenge of 'information silos' while ensuring that physicians and doctors don't need to spend their valuable time writing or noting down information.

## Key Features

- **Conversation Recording & Transcription**: Record meetings with pharmaceutical representatives and get instant, accurate transcripts using OpenAI's Whisper API.
- **AI-Powered Analysis**: Automatically extract key points, relevant tags, and generate meeting titles using GPT-4o.
- **Advanced Search**: Find information by drug name, doctor, keywords, or tags with a powerful search engine backed by Supabase.
- **Daily Audio Summaries**: Get AI-generated audio summaries of your daily meetings using OpenAI's TTS API.
- **AI Agent for Summaries**: Ask the AI Agent any questions or doubts about todays summaries.
- **Clinical Research Integration**: Automatically link discussions to relevant clinical trials through the ClinicalTrials.gov API.
- **Tag-Based Organization**: Categorize meetings with auto-generated tags for easy discovery and retrieval.

## Technology Stack

### Frontend
- **Next.js 15.3**: App router and server components for optimized rendering
- **React 19**: Latest React features and hooks
- **TailwindCSS 4**: For responsive, utility-first styling
- **Heroicons**: High-quality SVG icons
- **date-fns**: Date formatting and manipulation


### Backend & Data
- **Supabase**: Backend as a service with PostgreSQL database
- **Next.js API Routes**: Serverless functions for API endpoints
- **OpenAI API Integration**: 
  - GPT-4o: For advanced transcript analysis
  - Whisper: For audio transcription
  - TTS-1: For generating audio summaries

### APIs & Integrations
- **OpenAI**: For AI capabilities (transcription, analysis, speech synthesis)
- **ClinicalTrials.gov API**: For fetching relevant research papers based on meeting tags
- **Supabase Storage**: For storing and serving audio recordings

## Preview
Check out our preview web-app here: https://patronusai.vercel.app/

## App Screenshots
### Dashboard (Homepage)
<img width="1153" alt="Screenshot 2025-05-03 at 2 47 20 PM" src="https://github.com/user-attachments/assets/51f7e18b-7d72-49fc-8c96-d046dcaecc91" />

### Detailed Summary Card View
![Screenshot 2025-05-03 at 2 48 21 PM](https://github.com/user-attachments/assets/59370395-df06-42a6-b1b3-f21af8086fb2)

### Transcribe Landing Page
![Screenshot 2025-05-03 at 7 12 49 AM](https://github.com/user-attachments/assets/36996fc1-7b7f-4d57-a6d8-4f906257ec8a)

### Transcribe Submission Page
![Screenshot 2025-05-03 at 7 14 39 AM](https://github.com/user-attachments/assets/a417139a-746c-4ed6-8ad4-eeaaf0a38fc9)

## Architecture Diagram (Basic) 
![A_d](https://github.com/user-attachments/assets/8a928a19-0991-4f7e-8b39-b2826bdb5efd)

## Project Structure

```
patronus-ai/
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js app router pages
│   │   ├── api/        # API routes for backend functionality
│   │   ├── globals.css # Global styles
│   │   ├── layout.tsx  # Root layout component
│   │   └── page.tsx    # Home page component
│   ├── components/     # React components
│   │   ├── common/     # Shared UI components
│   │   ├── home/       # Home page specific components
│   │   └── layout/     # Layout components (header, sidebar)
│   ├── lib/            # Shared libraries/utilities
│   ├── services/       # Service layer for data access
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
└── package.json        # Dependencies and scripts
```

## Key Components

### Recording Interface
Record, transcribe, and analyze conversations with pharmaceutical representatives:
- Real-time audio recording
- Automatic transcription via Whisper API
- Key points extraction and tag generation via GPT-4o

### Dashboard & Search
Browse and search through meeting summaries:
- Filtering by tags
- Full-text search across titles, content, and tags
- Sort by date or relevance

### Daily Summaries
Get daily audio summaries of all meetings:
- AI-generated summaries of key points
- Text-to-speech conversion via OpenAI's TTS API

## API Endpoints

The application provides the following API endpoints:

- `POST /api/transcribe`: Transcribes audio recordings using OpenAI's Whisper API
- `POST /api/analyze-transcript`: Analyzes transcripts to extract key points and tags using GPT-4o
- `POST /api/save-meeting`: Saves meeting data to Supabase
- `POST /api/generate-summary-audio`: Generates audio summaries using OpenAI's TTS API

## If You Want to Build the Web-App Locally: 

### Prerequisites
- Node.js 20+
- npm or yarn
- Supabase account
- OpenAI API key

### Environment Setup
Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/vorahardik7/patronus-ai
cd patronus-ai
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up Supabase
   - Create a new Supabase project
   - Run the SQL schema in `supabase-tables.sql` to set up the required tables
   - Create a storage bucket named `audio-transcripts` with public read access

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## Future Development

- **Analytics Dashboard**: Insights into drug discussions and trends over time
- **User Authentication**: Role-based access for different hospital staff
- **Mobile Application**: Dedicated mobile app for on-the-go recording
- **Commure Database Integration**: AI will use Commure's database of patients and tell how many current patients can be affected with the new drug.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [OpenAI](https://openai.com) for providing the AI models that power our analysis
- [Supabase](https://supabase.com) for the database and storage infrastructure
- [Next.js](https://nextjs.org) and the Vercel team for the amazing framework
- [ClinicalTrials.gov](https://clinicaltrials.gov) for providing research data
