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

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/progress/:path*",
    "/settings/:path*",
    "/workout/:path*",
    "/practice/:path*"
  ]
};
