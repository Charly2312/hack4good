import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uyafgwajiccbvwzjsjep.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YWZnd2FqaWNjYnZ3empzamVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3ODU3MjYsImV4cCI6MjA1MjM2MTcyNn0.Jhelk2ZS3YkQde5F_56FyXWKrp70BunJY3S14rGuagA";
export const supabase = createClient(supabaseUrl, supabaseKey);
