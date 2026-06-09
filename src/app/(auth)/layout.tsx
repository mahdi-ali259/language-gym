import Link from "next/link";

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <Link className="text-base font-semibold text-slate-950" href="/">
          Daily Language Gym
        </Link>
        <nav
          aria-label="Onboarding navigation"
          className="text-sm text-slate-600"
        >
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
