import { createClient } from "@supabase/supabase-js";

// Guaranteed fallback to Code Clash 2026 Supabase instance
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://eezidlqxekfcnvtpfdox.supabase.co";

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_5Z2_0jX5s9UnekCUBYhm0g_jN7aKuzh";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
