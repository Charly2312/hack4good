import { supabase } from '../components/supabaseClient';

export async function addNotification(message, userId = null) {
    // Check if the same notification already exists for the user
    const { data: existingNotifications, error: checkError } = await supabase
      .from('notifications')
      .select('*')
      .eq('message', message)
      .eq('user_id', userId);
  
    if (checkError) {
      console.error('Error checking existing notifications:', checkError);
      return false;
    }
  
    if (existingNotifications.length > 0) {
      console.log('Notification already exists for the user.');
      return false;
    }
  
    // Insert new notification
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        { 
          message: message,
          read: false,
          user_id: userId,
          created_at: new Date().toISOString()
        }
      ]);
  
    if (error) {
      console.error('Error adding notification:', error);
      return false;
    }
    
    return true;
  }
  

export async function fetchNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data;
}

export async function markAsRead(id) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);

  if (error) {
    console.error('Error marking as read:', error);
    return false;
  }

  return true;
}

export async function deleteNotification(id) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting notification:', error);
    return false;
  }

  return true;
}