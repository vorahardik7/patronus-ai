// src/components/home/ResearchLinks.tsx
import { useState, useEffect } from 'react';
import { DocumentTextIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { fetchResearchPapers } from '@/utils/researchApi';

interface ResearchLinksProps {
  tags: string[];
}

type ResearchPaper = {
  title: string;
  url: string;
};

export default function ResearchLinks({ tags }: ResearchLinksProps) {
  const [papers, setPapers] = useState<Record<string, ResearchPaper | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch papers when the component mounts or tags change
    const loadPapers = async () => {
      if (tags.length === 0) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const results = await fetchResearchPapers(tags);
        setPapers(results);
      } catch (error) {
        console.error('Error fetching research papers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPapers();
  }, [tags]);

  // Filter out null results and limit to showing papers that were found
  const availablePapers = Object.entries(papers)
    .filter(([_, paper]) => paper !== null)
    .map(([tag, paper]) => ({ tag, ...paper! }));

  if (loading) {
    return (
      <div className="mt-4 pb-6 border-b border-secondary-200">
        <h3 className="text-lg font-medium text-secondary-900 mb-3">Related Research</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
          <div className="h-4 bg-secondary-200 rounded w-2/3"></div>
          <div className="h-4 bg-secondary-200 rounded w-4/5"></div>
        </div>
      </div>
    );
  }

  if (availablePapers.length === 0) {
    return null; // Don't show the section if no papers were found
  }

  return (
    <div className="mt-4 pb-6 border-b border-secondary-200">
      <h3 className="text-lg font-medium text-secondary-900 mb-3">Related Research</h3>
      <ul className="space-y-3">
        {availablePapers.map((paper, index) => (
          <li key={index} className="flex items-start">
            <DocumentTextIcon className="h-5 w-5 mr-3 mt-0.5 text-primary-500 flex-shrink-0" />
            <div>
              <a 
                href={paper.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-800 font-medium flex items-center"
              >
                {paper.title} 
                <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1 flex-shrink-0" />
              </a>
              <p className="text-sm text-secondary-600 mt-1">
                Relevant to: <span className="font-medium">{paper.tag}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}