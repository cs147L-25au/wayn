// services/nudgeService.ts

import { db } from '../utils/supabase';

export interface NudgeData {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_display_name: string;  // Changed from sender_first_name/sender_last_name
  sender_icon: string | null;
  created_at: string;
  status: 'sent' | 'seen' | 'undone';
}

export class NudgeService {
  /**
   * Send a nudge to a friend
   */
  static async sendNudge(senderId: string, receiverId: string): Promise<{ success: boolean; nudge?: any; error?: string }> {
    try {
      const { data: nudge, error } = await db
        .from('nudges')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          status: 'sent',
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, nudge };
    } catch (error) {
      console.error('Error sending nudge:', error);
      return { success: false, error: 'Failed to send nudge' };
    }
  }

  /**
   * Undo a nudge
   */
  static async undoNudge(nudgeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await db
        .from('nudges')
        .update({ 
          status: 'undone',
          undone_at: new Date().toISOString()
        })
        .eq('id', nudgeId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error undoing nudge:', error);
      return { success: false, error: 'Failed to undo nudge' };
    }
  }

  /**
   * Mark a nudge as seen
   */
  static async markNudgeAsSeen(nudgeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await db
        .from('nudges')
        .update({ 
          status: 'seen',
          seen_at: new Date().toISOString()
        })
        .eq('id', nudgeId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error marking nudge as seen:', error);
      return { success: false, error: 'Failed to mark nudge as seen' };
    }
  }

  /**
   * Subscribe to incoming nudges in real-time
   */
  static subscribeToNudges(
    userId: string,
    onNudgeReceived: (nudge: NudgeData) => void
  ) {
    const channel = db
      .channel('nudges')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'nudges',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          console.log('Nudge received:', payload);
          
          // Fetch sender details
          const { data: sender } = await db
            .from('users')
            .select('id, display_name, profile_icon_url')
            .eq('id', payload.new.sender_id)
            .single();

          if (sender) {
            const nudgeData: NudgeData = {
              id: payload.new.id,
              sender_id: payload.new.sender_id,
              receiver_id: payload.new.receiver_id,
              sender_display_name: sender.display_name,
              sender_icon: sender.profile_icon_url,
              created_at: payload.new.created_at,
              status: payload.new.status,
            };
            onNudgeReceived(nudgeData);
          }
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }
}