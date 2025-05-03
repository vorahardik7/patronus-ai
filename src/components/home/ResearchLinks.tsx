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
    .filter(([, paper]) => paper !== null)
    .map(([tagName, paper]) => ({
      tag: tagName,
      ...(paper as ResearchPaper), // Type assertion needed here
    }));

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
      <h3 className="text-lg font-medium text-secondary-900 mb-4">Related Research</h3>
      <ul className="space-y-5 mt-3">
        {availablePapers.slice(0, 3).map(({ tag, title, url }, index) => (
          <li key={index} className="bg-secondary-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
            <a 
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block cursor-pointer"
            >
              <h4 className="text-primary-700 font-medium text-base mb-2 hover:text-primary-800 transition-colors duration-200 flex items-center">
                {title}
                <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-2 flex-shrink-0" />
              </h4>
              <div className="flex items-center mt-2">
                <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full capitalize">
                  {tag}
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}