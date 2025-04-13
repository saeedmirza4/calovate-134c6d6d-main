import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

console.log("Supabase URL:", supabaseUrl); // Remove later
console.log("Supabase Key:", supabaseAnonKey); // Remove later

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
