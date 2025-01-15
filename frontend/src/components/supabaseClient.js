import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://evbrffpvxgoyhaoqrmdn.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2YnJmZnB2eGdveWhhb3FybWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc2NTM3OTksImV4cCI6MjAzMzIyOTc5OX0.q-Ww1QoOBekFK0qS4rDUWDDVZ7KOvn1P-Pq205tTsjQ";
export const supabase = createClient(supabaseUrl, supabaseKey);
