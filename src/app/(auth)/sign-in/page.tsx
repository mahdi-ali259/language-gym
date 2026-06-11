import Link from "next/link";
import { signInWithGoogle } from "@/server/auth/actions";
import { Badge, Button, ErrorState, GlassPanel } from "@/components/ui";

type SignInPageProps = {
  searchParams?: Promise<{
    auth_error?: string;
    redirectedFrom?: string;
  }>;
};

const authErrorMessages: Record<string, string> = {
  google_oauth_start_failed:
    "Google sign-in could not be started. Please check the Supabase provider setup and try again.",
  missing_auth_code:
    "The sign-in callback did not include an authentication code.",
  session_exchange_failed:
    "The sign-in session could not be completed. Please try again.",
  missing_origin:
    "The app could not determine the redirect origin for sign-in.",
  missing_supabase_env:
    "Supabase environment variables are missing. Add them to your local environment before testing sign-in.",
  profile_setup_failed:
    "Sign-in worked, but the app could not create or load your profile. Make sure the profiles table and RLS policies are applied.",
  user_lookup_failed:
    "The app could not load your signed-in user after the auth callback."
};
const fallbackAuthErrorMessage =
  "Sign-in could not be completed. Please try again.";

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const authError = params?.auth_error;
  const redirectedFrom = normalizeDisplayedRedirectPath(params?.redirectedFrom);
  const errorMessage = authError
    ? (authErrorMessages[authError] ?? fallbackAuthErrorMessage)
    : null;

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center justify-center px-4 py-10 sm:px-6">
      <GlassPanel className="w-full max-w-xl text-center">
        <Badge tone="accent">Google sign-in</Badge>
        <h1 className="mt-5 text-3xl font-semibold text-slate-950 sm:text-4xl">
          Sign in to Daily Language Gym
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-600">
          Use Google sign-in to access protected app pages. Profile creation and
          level persistence come in the next phase.
        </p>

        {redirectedFrom ? (
          <p className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/80 p-3 text-sm text-blue-700">
            Please sign in to continue to {redirectedFrom}.
          </p>
        ) : null}

        {errorMessage ? (
          <ErrorState
            className="mt-5"
            message={errorMessage}
            title="Sign-in error"
          />
        ) : null}

        <form action={signInWithGoogle} className="mt-7">
          <Button className="w-full" size="lg" type="submit">
            Continue with Google
          </Button>
        </form>

        <Link
          className="mt-5 inline-flex text-sm font-medium text-slate-600 hover:text-slate-950"
          href="/"
        >
          Return to landing page
        </Link>
      </GlassPanel>
    </main>
  );
}

function normalizeDisplayedRedirectPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  try {
    const parsed = new URL(value, "http://app.local");

    if (parsed.origin !== "http://app.local") {
      return null;
    }

    return parsed.pathname;
  } catch {
    return null;
  }
}
