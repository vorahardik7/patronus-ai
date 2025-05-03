// src/utils/researchApi.ts

type ResearchPaper = {
    title: string;
    url: string;
  };
  
  /**
   * Fetches a research paper from the Clinical Trials API for a given tag
   * @param tag The tag to search for
   * @returns A research paper object or null if none found
   */
  export async function fetchResearchPaper(tag: string): Promise<ResearchPaper | null> {
    try {
      // Clinical Trials API doesn't like spaces
      const sanitizedTag = encodeURIComponent(tag);
      
      const response = await fetch(
        `https://clinicaltrials.gov/api/v2/studies?query.cond=${sanitizedTag}&sort=LastUpdatePostDate%3Adesc&countTotal=true&pageSize=1`
      );
      
      if (!response.ok) {
        console.error(`API Error for tag ${tag}: ${response.status} ${response.statusText}`);
        return null;
      }
      
      const data = await response.json();
      
      // Check if studies array exists and has at least one study
      if (!data.studies || data.studies.length === 0) {
        return null;
      }
      
      const study = data.studies[0];
      
      // Make sure the study has all required data
      if (!study?.protocolSection?.identificationModule) {
        return null;
      }
      
      const { identificationModule } = study.protocolSection;
      
      // Extract the title and URL (nctId can be used to construct the URL)
      const title = identificationModule.briefTitle || 'Clinical Trial';
      const nctId = identificationModule.nctId;
      
      if (!nctId) {
        return null;
      }
      
      const url = `https://clinicaltrials.gov/study/${nctId}`;
      
      return { title, url };
    } catch (error) {
      console.error(`Error fetching research for tag ${tag}:`, error);
      return null;
    }
  }
  
  /**
   * Fetches research papers for multiple tags in parallel
   * @param tags Array of tags to search for
   * @returns Object with tags as keys and research papers as values
   */
  export async function fetchResearchPapers(tags: string[]): Promise<Record<string, ResearchPaper | null>> {
    const results: Record<string, ResearchPaper | null> = {};
    
    // If there are no tags, return an empty object
    if (!tags || tags.length === 0) {
      return results;
    }
    
    // Process unique tags only to avoid duplicate requests
    const uniqueTags = [...new Set(tags)];
    
    // Process in parallel for better performance
    await Promise.all(
      uniqueTags.map(async (tag) => {
        results[tag] = await fetchResearchPaper(tag);
      })
    );
    
    return results;
  }