import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/server/supabase/server";
import { createProfileIfMissing } from "@/server/profile/service";

const DEFAULT_AUTH_REDIRECT_PATH = "/dashboard";
const ALLOWED_AUTH_REDIRECT_PATHS = new Set([
  "/dashboard",
  "/progress",
  "/settings",
  "/workout/daily",
  "/practice",
  "/practice/session",
  "/practice/result"
]);

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = normalizeAuthRedirectPath(requestUrl.searchParams.get("next"));
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  if (error) {
    const redirectUrl = new URL("/sign-in", requestUrl.origin);
    redirectUrl.searchParams.set("auth_error", errorDescription ?? error);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    const redirectUrl = new URL("/sign-in", requestUrl.origin);
    redirectUrl.searchParams.set("auth_error", "missing_auth_code");
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createSupabaseServerClient();
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    const redirectUrl = new URL("/sign-in", requestUrl.origin);
    redirectUrl.searchParams.set("auth_error", "session_exchange_failed");
    return NextResponse.redirect(redirectUrl);
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const redirectUrl = new URL("/sign-in", requestUrl.origin);
    redirectUrl.searchParams.set("auth_error", "user_lookup_failed");
    return NextResponse.redirect(redirectUrl);
  }

  const profile = await createProfileIfMissing(user).catch(() => null);

  if (!profile) {
    const redirectUrl = new URL("/sign-in", requestUrl.origin);
    redirectUrl.searchParams.set("auth_error", "profile_setup_failed");
    return NextResponse.redirect(redirectUrl);
  }

  const destination = profile.onboarding_completed_at ? next : "/level";

  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}

function normalizeAuthRedirectPath(next: string | null) {
  if (!next) {
    return DEFAULT_AUTH_REDIRECT_PATH;
  }

  try {
    const parsed = new URL(next, "http://app.local");

    if (parsed.origin !== "http://app.local") {
      return DEFAULT_AUTH_REDIRECT_PATH;
    }

    const normalizedPath = parsed.pathname;

    if (!ALLOWED_AUTH_REDIRECT_PATHS.has(normalizedPath)) {
      return DEFAULT_AUTH_REDIRECT_PATH;
    }

    return normalizedPath;
  } catch {
    return DEFAULT_AUTH_REDIRECT_PATH;
  }
}
