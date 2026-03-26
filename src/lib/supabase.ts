import { createClient } from '@supabase/supabase-js';

// Using the credentials provided in the setup request
const supabaseUrl = "https://mfqitktrdvjdllctmzem.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mcWl0a3RyZHZqZGxsY3RtemVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0OTY1MDUsImV4cCI6MjA5MDA3MjUwNX0.y3JpRUIhrVDznZLHjptZ0alR37iKAbrLMAGm9AHKtCs";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
