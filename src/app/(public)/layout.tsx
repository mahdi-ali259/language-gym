import Link from "next/link";

export default function PublicLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#eef6ff_0%,#f6f8fb_42%,#ffffff_100%)]">
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link className="text-base font-semibold text-slate-950" href="/">
          Daily Language Gym
        </Link>
        <nav
          aria-label="Public navigation"
          className="flex flex-wrap gap-3 text-sm text-slate-600"
        >
          <Link href="/guest/practice">Guest Practice</Link>
          <Link href="/sign-in">Sign In</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
