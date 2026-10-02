import { Suspense } from "react";
import { FittingRoom } from "@/components/fitting-room";

export default function Page() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-16 text-sm text-dim">Loading…</div>}>
      <FittingRoom />
    </Suspense>
  );
}
