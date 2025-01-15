const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function sendSystemNotification(message) {
  // Fetch all user IDs
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id');

  if (userError) {
    console.error('Error fetching users:', userError);
    return false;
  }

  for (const user of users) {
    // Check if the same notification already exists for the user
    const { data: existingNotifications, error: checkError } = await supabase
      .from('notifications')
      .select('*')
      .eq('message', message)
      .eq('user_id', user.id);

    if (checkError) {
      console.error('Error checking existing notifications:', checkError);
      continue;
    }

    if (existingNotifications.length === 0) {
      // Insert new notification
      const { error } = await supabase
        .from('notifications')
        .insert([
          { 
            message: message,
            read: false,
            user_id: user.id,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Error sending notification to user:', user.id, error);
      }
    } else {
      console.log(`Notification already exists for user ${user.id}.`);
    }
  }
  
  console.log(`Notification sending process completed.`);
  return true;
}

const message = process.argv[2];

if (!message) {
  console.error('Please provide a message. Usage: node sendSystemNotification.js "Your message here"');
  process.exit(1);
}

sendSystemNotification(message)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('An error occurred:', error);
    process.exit(1);
  });
