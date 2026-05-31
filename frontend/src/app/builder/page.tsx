import { Suspense } from "react";
import { DeckBuilder } from "@/components/deck-builder";

export const dynamic = "force-dynamic";

export default function BuilderPage() {
  return (
    <Suspense fallback={null}>
      <DeckBuilder />
    </Suspense>
  );
}
