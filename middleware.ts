import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return redirectToSignIn(request, "missing_supabase_env");
  }

  let response = NextResponse.next({
    request
  });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectToSignIn(request);
  }

  const pathname = request.nextUrl.pathname;
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (profileError) {
    if (pathname === "/level") {
      return response;
    }

    return redirectToLevel(request, "profile_lookup_failed");
  }

  const onboardingCompleted = Boolean(profile?.onboarding_completed_at);

  if (pathname === "/level") {
    if (onboardingCompleted) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
  }

  if (!onboardingCompleted) {
    return redirectToLevel(request);
  }

  return response;
}

function redirectToSignIn(request: NextRequest, reason?: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/sign-in";
  redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);

  if (reason) {
    redirectUrl.searchParams.set("auth_error", reason);
  }

  return NextResponse.redirect(redirectUrl);
}

function redirectToLevel(request: NextRequest, reason?: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/level";

  if (reason) {
    redirectUrl.searchParams.set("setup_error", reason);
  }

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    "/level",
    "/dashboard/:path*",
    "/progress/:path*",
    "/settings/:path*",
    "/workout/:path*",
    "/practice/:path*"
  ]
};
