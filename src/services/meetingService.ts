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
 */
export async function searchMeetings(query: string): Promise<MeetingWithTags[]> {
  try {
    // Search in meetings table
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('*')
      .or(`title.ilike.%${query}%,doctor_name.ilike.%${query}%,rep_name.ilike.%${query}%,transcript.ilike.%${query}%,drugs_discussed.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (meetingsError) {
      console.error('Error searching meetings:', meetingsError);
      return [];
    }

    if (!meetings || meetings.length === 0) {
      return [];
    }

    // Also search in tags
    const { data: tagMatches, error: tagsError } = await supabase
      .from('meeting_tags')
      .select('meeting_id')
      .ilike('tag_name', `%${query}%`);

    if (tagsError) {
      console.error('Error searching meeting tags:', tagsError);
    }

    // Get meeting IDs from tag matches
    const tagMatchIds = tagMatches ? tagMatches.map(match => match.meeting_id) : [];

    // Fetch any meetings that matched by tag but weren't in the original results
    let additionalMeetings: MeetingData[] = [];
    if (tagMatchIds.length > 0) {
      const meetingIds = meetings.map(m => m.id);
      const missingIds = tagMatchIds.filter(id => !meetingIds.includes(id));
      
      if (missingIds.length > 0) {
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

    // Combine all matching meetings
    const allMeetings = [...meetings, ...additionalMeetings];
    const meetingIds = allMeetings.map(meeting => meeting.id);

    // Fetch tags for all meetings
    const { data: tags, error: allTagsError } = await supabase
      .from('meeting_tags')
      .select('*')
      .in('meeting_id', meetingIds);

    if (allTagsError) {
      console.error('Error fetching all meeting tags:', allTagsError);
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
    const meetingsWithTags: MeetingWithTags[] = allMeetings.map(meeting => {
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
    console.error('Error in searchMeetings:', error);
    return [];
  }
}
