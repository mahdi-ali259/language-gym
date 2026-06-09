import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/server/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
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

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
