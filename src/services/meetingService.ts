// src/services/meetingService.ts
import { supabase } from '@/lib/supabase';
import { MeetingData, MeetingTag, MeetingAudio, MeetingWithTags } from '@/types';

/**
 * Fetches all meetings from Supabase with their associated tags
 */
export async function getAllMeetings(): Promise<MeetingWithTags[]> {
  try {
    // Fetch all meetings
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('*')
      .order('created_at', { ascending: false });

    if (meetingsError) {
      console.error('Error fetching meetings:', meetingsError);
      return [];
    }

    if (!meetings || meetings.length === 0) {
      return [];
    }

    // Get all meeting IDs
    const meetingIds = meetings.map(meeting => meeting.id);

    // Fetch tags for all meetings
    const { data: tags, error: tagsError } = await supabase
      .from('meeting_tags')
      .select('*')
      .in('meeting_id', meetingIds);

    if (tagsError) {
      console.error('Error fetching meeting tags:', tagsError);
    }

    // Fetch audio URLs for all meetings
    const { data: audioRecords, error: audioError } = await supabase
      .from('meeting_audio')
      .select('*')
      .in('meeting_id', meetingIds);

    if (audioError) {
      console.error('Error fetching meeting audio records:', audioError);
    }

    // Combine meetings with their tags and audio URLs
    const meetingsWithTags: MeetingWithTags[] = meetings.map(meeting => {
      const meetingTags = tags 
        ? tags
            .filter(tag => tag.meeting_id === meeting.id)
            .map(tag => tag.tag_name)
        : [];
      
      const audioRecord = audioRecords
        ? audioRecords.find(audio => audio.meeting_id === meeting.id)
        : undefined;

      return {
        ...meeting,
        tags: meetingTags,
        audio_url: audioRecord?.audio_url
      };
    });

    return meetingsWithTags;
  } catch (error) {
    console.error('Error in getAllMeetings:', error);
    return [];
  }
}

/**
 * Fetches a single meeting by ID with its tags and audio URL
 */
export async function getMeetingById(id: string): Promise<MeetingWithTags | null> {
  try {
    // Fetch the meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', id)
      .single();

    if (meetingError) {
      console.error('Error fetching meeting:', meetingError);
      return null;
    }

    if (!meeting) {
      return null;
    }

    // Fetch tags for this meeting
    const { data: tags, error: tagsError } = await supabase
      .from('meeting_tags')
      .select('*')
      .eq('meeting_id', id);

    if (tagsError) {
      console.error('Error fetching meeting tags:', tagsError);
    }

    // Fetch audio URL for this meeting
    const { data: audioRecord, error: audioError } = await supabase
      .from('meeting_audio')
      .select('*')
      .eq('meeting_id', id)
      .single();

    if (audioError && audioError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is OK
      console.error('Error fetching meeting audio record:', audioError);
    }

    // Combine meeting with its tags and audio URL
    const meetingWithTags: MeetingWithTags = {
      ...meeting,
      tags: tags ? tags.map(tag => tag.tag_name) : [],
      audio_url: audioRecord?.audio_url
    };

    return meetingWithTags;
  } catch (error) {
    console.error('Error in getMeetingById:', error);
    return null;
  }
}

/**
 * Search meetings by query string
 * This improved version searches both meeting data and tags
 */
export async function searchMeetings(query: string): Promise<MeetingWithTags[]> {
  try {
    console.log(`Performing search for query: "${query}"`);
    
    // Step 1: First search meetings table for direct matches
    const { data: directMatches, error: meetingsError } = await supabase
      .from('meetings')
      .select('*')
      .or(`title.ilike.%${query}%,doctor_name.ilike.%${query}%,rep_name.ilike.%${query}%,transcript.ilike.%${query}%,drugs_discussed.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (meetingsError) {
      console.error('Error searching meetings:', meetingsError);
      return [];
    }

    console.log(`Found ${directMatches?.length || 0} direct matches in meetings table`);
    
    // Step 2: Search in tags table for tag matches
    const { data: tagMatches, error: tagsError } = await supabase
      .from('meeting_tags')
      .select('meeting_id, tag_name')
      .ilike('tag_name', `%${query}%`);

    if (tagsError) {
      console.error('Error searching meeting tags:', tagsError);
    }

    console.log(`Found ${tagMatches?.length || 0} matches in tags table`);
    
    // Get unique meeting IDs from tag matches
    const tagMatchIds = tagMatches 
      ? [...new Set(tagMatches.map(match => match.meeting_id))] 
      : [];
    
    // Step 3: Fetch any meetings that matched by tag but weren't in the direct results
    let additionalMeetings: MeetingData[] = [];
    if (tagMatchIds.length > 0) {
      const directMatchIds = directMatches ? directMatches.map(m => m.id) : [];
      const missingIds = tagMatchIds.filter(id => !directMatchIds.includes(id));
      
      if (missingIds.length > 0) {
        console.log(`Fetching ${missingIds.length} additional meetings matched by tags`);
        
        const { data: taggedMeetings, error } = await supabase
          .from('meetings')
          .select('*')
          .in('id', missingIds);
          
        if (error) {
          console.error('Error fetching additional meetings by tag:', error);
        } else if (taggedMeetings) {
          additionalMeetings = taggedMeetings;
        }
      }
    }

    // Step 4: Combine all matching meetings (both direct and tag matches)
    const allMeetings = [...(directMatches || []), ...additionalMeetings];
    
    if (allMeetings.length === 0) {
      return [];
    }
    
    const meetingIds = allMeetings.map(meeting => meeting.id);

    // Step 5: Fetch all tags for all matching meetings
    const { data: allTags, error: allTagsError } = await supabase
      .from('meeting_tags')
      .select('*')
      .in('meeting_id', meetingIds);

    if (allTagsError) {
      console.error('Error fetching all meeting tags:', allTagsError);
    }

    // Step 6: Fetch audio URLs for all matching meetings
    const { data: audioRecords, error: audioError } = await supabase
      .from('meeting_audio')
      .select('*')
      .in('meeting_id', meetingIds);

    if (audioError) {
      console.error('Error fetching meeting audio records:', audioError);
    }

    // Step 7: Combine meetings with their tags and audio URLs
    const meetingsWithTags: MeetingWithTags[] = allMeetings.map(meeting => {
      const meetingTags = allTags 
        ? allTags
            .filter(tag => tag.meeting_id === meeting.id)
            .map(tag => tag.tag_name)
        : [];
      
      const audioRecord = audioRecords
        ? audioRecords.find(audio => audio.meeting_id === meeting.id)
        : undefined;

      return {
        ...meeting,
        tags: meetingTags,
        audio_url: audioRecord?.audio_url
      };
    });

    console.log(`Returning ${meetingsWithTags.length} total search results`);
    return meetingsWithTags;
  } catch (error) {
    console.error('Error in searchMeetings:', error);
    return [];
  }
}