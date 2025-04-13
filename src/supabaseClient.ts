import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://isdgggmsrgklqfxjqyia.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZGdnZ21zcmdrbHFmeGpxeWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MjMwOTMsImV4cCI6MjA2MDA5OTA5M30.mmhAabSibEEVY9u5Qj1Dt5c9DslmItXc-hWOtEvIl2E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
