import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  GlassPanel,
  Input,
  LoadingState,
  ModalShell
} from "@/components/ui";

export default function DesignSystemPreviewPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <Badge tone="accent">Internal Preview</Badge>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">
          Design System Foundations
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Phase 3 preview for reusable UI primitives only.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <GlassPanel>
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Input
              helperText="Supports English and Arabic content."
              label="Example input"
              placeholder="Type here"
            />
            <Input
              dir="rtl"
              label="مثال عربي"
              placeholder="اكتب هنا"
              type="text"
            />
          </div>
        </GlassPanel>

        <Card>
          <div className="flex flex-wrap gap-2">
            <Badge>Neutral</Badge>
            <Badge tone="accent">Accent</Badge>
            <Badge tone="success">Success</Badge>
            <Badge tone="danger">Error</Badge>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-600">
            Card, badge, and input foundations are ready for future product
            pages.
          </p>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <LoadingState label="Loading preview..." />
        <ErrorState message="This is the shared error state style." />
        <EmptyState description="This is the shared empty state style." />
      </div>

      <ModalShell
        description="The modal shell is imported here for compile-time coverage."
        isOpen={false}
        title="Modal Preview"
      >
        <p className="text-sm text-slate-600">Hidden by default.</p>
      </ModalShell>
    </main>
  );
}
