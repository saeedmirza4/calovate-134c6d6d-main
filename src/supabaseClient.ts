import { createClient } from "@supabase/supabase-js";

// Replace these with your actual Supabase URL and key
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "https://isdgggmsrgklqfxjqyia.supabase.co";
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZGdnZ21zcmdrbHFmeGpxeWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MjMwOTMsImV4cCI6MjA2MDA5OTA5M30.mmhAabSibEEVY9u5Qj1Dt5c9DslmItXc-hWOtEvIl2E";

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);