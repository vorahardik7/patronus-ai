// src/components/home/ResearchLinks.tsx
import { useState, useEffect } from 'react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
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
        const promises = tags.map(tag => fetchResearchPapers([tag]));
        const results: Record<string, ResearchPaper | null>[] = await Promise.all(promises);
        
        const newPapers: Record<string, ResearchPaper | null> = {};
        results.forEach((resultObj, index) => {
          const tag = tags[index]; // Get the corresponding tag
          newPapers[tag] = resultObj[tag]; // Extract the paper using the tag as key
        });
        setPapers(newPapers);
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
    .filter(([paper]) => paper !== null)
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
      <ul className="space-y-4 mt-3">
        {availablePapers.map(({ tag, title, url }, index) => (
          <li key={index} className="border-b border-secondary-200 pb-3 last:border-b-0">
            <div className="flex justify-between items-start mb-1">
              <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                {tag} 
              </span>
              <a 
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-800 font-medium text-sm flex items-center"
              >
                {title} {/* Display title as link text */}
                <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1 flex-shrink-0" />
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}