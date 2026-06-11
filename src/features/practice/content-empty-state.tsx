import Link from "next/link";
import { Badge, Button, EmptyState, GlassPanel } from "@/components/ui";

type PracticeContentEmptyStateProps = {
  description: string;
  title: string;
};

export function PracticeContentEmptyState({
  description,
  title
}: PracticeContentEmptyStateProps) {
  return (
    <main className="mx-auto flex min-h-[78vh] w-full max-w-5xl flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
      <GlassPanel>
        <Badge>Content library</Badge>
        <EmptyState
          className="mt-5"
          description={description}
          title={title}
          action={
            <Button asChild variant="secondary">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          }
        />
      </GlassPanel>
    </main>
  );
}
