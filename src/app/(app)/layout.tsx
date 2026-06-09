import Link from "next/link";

export default function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]">
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link
          className="text-base font-semibold text-slate-950"
          href="/dashboard"
        >
          Daily Language Gym
        </Link>
        <nav
          aria-label="App navigation"
          className="flex flex-wrap gap-3 text-sm text-slate-600"
        >
          <Link href="/dashboard">Home</Link>
          <Link href="/workout/daily">Daily Workout</Link>
          <Link href="/practice">Practice</Link>
          <Link href="/progress">Progress</Link>
          <Link href="/settings">Settings</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
