"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/server/supabase/server";

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
}

export async function signInWithGoogle() {
  const headerStore = await headers();
  const origin = getSiteUrl() ?? headerStore.get("origin");

  if (!origin) {
    redirect("/sign-in?auth_error=missing_origin");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`
    }
  });

  if (error || !data.url) {
    redirect("/sign-in?auth_error=google_oauth_start_failed");
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
