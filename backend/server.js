import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
//import path from "path";

//creating the supabase client
const supabaseUrl = "https://uyafgwajiccbvwzjsjep.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YWZnd2FqaWNjYnZ3empzamVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3ODU3MjYsImV4cCI6MjA1MjM2MTcyNn0.Jhelk2ZS3YkQde5F_56FyXWKrp70BunJY3S14rGuagA";
const supabase = createClient(supabaseUrl, supabaseKey);

const mailerSend = new MailerSend({
  apiKey: "mlsn.8f3948f1c0ad86138d242a749a946369bf484a6c665e493095a33b221e72f16c",
});

const app = express();
const PORT = 5000; //react by default uses port 3000. DONT put 3000 here!

//frontend url
//allowing access to receive request from the frontend react side
//in this case, only allowing "POST" and "GET" HTTP requests from frontend
app.use(cors({
  origin: ["https://hack4good-web.vercel.app/"],
  methods: ["POST", "GET"],
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Testing, Hello World!');
  res.json('Testing, Hello World!');
});

//for forgot password
//receive 'email' data from the frontend side
//email to be used to 
app.post('/send-reset-email', async (req, res) => {
  const { email } = req.body;
  console.log('POST Request received');
  console.log('Received data:', req.body);

  // Checking if the value in 'email' exists in the database
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  console.log('Fetched user data:', data);

  if (error) {
    console.error('Error requesting password reset:', error);
    return res.status(500).json({ message: "Failed to send reset email", details: error.message });
  }

  if (!data) {
    return res.status(404).json({ message: "Email not found" });
  }


  const sentFrom = new Sender("ontrack@trial-yzkq340req04d796.mlsender.net", "ontrack");

  const recipients = [new Recipient(email, "user")];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject("Reset password link")
    .setHtml("<p>Press the link to reset your password: <link>https://ontrack-orcin.vercel.app/newpassword</link>!</p>")
    .setText("this is the text content");


  try {
    await mailerSend.email.send(emailParams);
    res.status(200).json({ message: "Reset email sent successfully" });
  } catch (sendError) {
    console.error('Error sending email:', sendError);
    res.status(500).json({ message: "Failed to send reset email", details: sendError.message });
  }
});

//for sending feedback to developer team - us
//receive the 'feedback' data from the frontend side
//send the feedback to our emails
app.post('/send-feedback', async (req, res) => {
  const { feedback } = req.body;

  const sentFrom = new Sender("ontrack@trial-yzkq340req04d796.mlsender.net", "ontrack");



  const recipients = [new Recipient("ontrack.orbital24@gmail.com", "developer")];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject("Feedback from user")
    .setHtml(feedback)
    .setText("this is the text content");

  try {
    await mailerSend.email.send(emailParams);
    res.status(200).json({ message: "Feedback sent successfully" });
  } catch (sendError) {
    console.error('Error sending feedback:', sendError);
    res.status(500).json({ message: "Failed to send feedback", details: sendError.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server is running on http://localhost:${PORT}`);
});
