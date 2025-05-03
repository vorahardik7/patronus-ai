// src/types/index.ts

export interface Summary {
    id: string;
    title: string;
    drugName: string;
    createdAt: string;
    updatedAt: string;
    presenter: string;
    doctorName: string;
    department: string;
    hospital: string;
    keyPoints: string[];
    relevantPatients?: number;
    additionalDoctors?: string[];
    tags: string[];
  }
  
  export interface FilterOptions {
    hospital?: string;
    department?: string;
    drugName?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
    tags?: string[];
  }
  
  export interface TranscriptSegment {
    id: string;
    speaker: 'rep' | 'doctor';
    text: string;
    timestamp: number;
  }
  
  export interface Recording {
    id: string;
    title: string;
    createdAt: string;
    duration: number;
    fileUrl?: string;
    transcript: TranscriptSegment[];
    isProcessing: boolean;
    isComplete: boolean;
  }
  
  export type SortOrder = 'newest' | 'oldest' | 'relevance';