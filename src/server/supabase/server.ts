import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Server-only Supabase boundary for future server-side reads/writes.
// This currently uses the anon key and must respect Row Level Security.
// Do not import this module from client components.
//
// If a future admin-only operation truly requires SUPABASE_SERVICE_ROLE_KEY,
// create a separate, clearly named server-only admin helper and never expose it
// to browser/client code.
export function createSupabaseServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}
