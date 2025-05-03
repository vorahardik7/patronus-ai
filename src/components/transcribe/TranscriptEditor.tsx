// src/components/transcribe/TranscriptEditor.tsx (continued)
import { useState } from 'react';
import { TranscriptSegment } from '@/types';
import { UserIcon, UserCircleIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface TranscriptEditorProps {
  transcript: TranscriptSegment[];
  onTranscriptEdit: (updatedTranscript: TranscriptSegment[]) => void;
}

export default function TranscriptEditor({ transcript, onTranscriptEdit }: TranscriptEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const startEditing = (segment: TranscriptSegment) => {
    setEditingId(segment.id);
    setEditText(segment.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = (id: string) => {
    const updatedTranscript = transcript.map(segment => 
      segment.id === id ? { ...segment, text: editText } : segment
    );
    
    onTranscriptEdit(updatedTranscript);
    setEditingId(null);
    setEditText('');
  };

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card">
      <div className="p-4 border-b border-secondary-200">
        <h2 className="font-semibold text-lg text-secondary-900">Transcript</h2>
        <p className="text-sm text-secondary-600">
          Review and edit the conversation transcript
        </p>
      </div>
      
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {transcript.length === 0 ? (
          <p className="text-center text-secondary-500 py-4">
            No transcript available yet
          </p>
        ) : (
          <div className="space-y-4">
            {transcript.map((segment) => (
              <div 
                key={segment.id}
                className={`flex p-3 rounded-lg ${
                  segment.speaker === 'rep' 
                    ? 'bg-secondary-50 border border-secondary-200' 
                    : 'bg-primary-50 border border-primary-200'
                }`}
              >
                <div className="flex-shrink-0 mr-3">
                  {segment.speaker === 'rep' ? (
                    <UserCircleIcon className="h-8 w-8 text-secondary-600" />
                  ) : (
                    <UserIcon className="h-8 w-8 text-primary-600" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">
                      {segment.speaker === 'rep' ? 'Sales Rep' : 'Doctor'}
                    </span>
                    <span className="text-xs text-secondary-500">
                      {formatTimestamp(segment.timestamp)}
                    </span>
                  </div>
                  
                  {editingId === segment.id ? (
                    <div className="mt-1">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="input-field min-h-[80px]"
                      />
                      <div className="flex justify-end mt-2 space-x-2">
                        <button
                          onClick={cancelEditing}
                          className="p-1 rounded text-secondary-700 hover:bg-secondary-200"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => saveEdit(segment.id)}
                          className="p-1 rounded text-primary-700 hover:bg-primary-200"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="group relative">
                      <p className="text-secondary-800">{segment.text}</p>
                      <button
                        onClick={() => startEditing(segment)}
                        className="absolute right-0 top-0 p-1 rounded opacity-0 group-hover:opacity-100 text-secondary-700 hover:bg-secondary-200"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}