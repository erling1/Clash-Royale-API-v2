import { api } from "@/lib/api";
import { DecksTable } from "@/components/decks-table";
import { DECK_SORT_KEYS, DECK_DEFAULT_DIR, type DeckSortKey } from "@/lib/deck-sort";
import { PAGE_SIZE } from "@/lib/pagination";
import { fmtInt } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DecksPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string; page?: string }>;
}) {
  const sp = await searchParams;

  // URL query is the single source of truth for sort + page; the server resolves
  // it and fetches only the visible page (sorted server-side).
  const sortKey: DeckSortKey = (DECK_SORT_KEYS as readonly string[]).includes(sp.sort ?? "")
    ? (sp.sort as DeckSortKey)
    : "popularity_rank";
  const dir: "asc" | "desc" =
    sp.dir === "asc" ? "asc" : sp.dir === "desc" ? "desc" : DECK_DEFAULT_DIR[sortKey];
  const rawPage = Number.parseInt(sp.page ?? "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage - 1 : 0;

  const [decks, total, cards] = await Promise.all([
    api.listDecks({ limit: PAGE_SIZE, offset: page * PAGE_SIZE, sort: sortKey, dir }),
    api.countDecks(),
    api.listCards(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide text-fg text-glow-gold">Decks</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Deck archetypes ranked by popularity. {fmtInt(total)} decks tracked.
        </p>
      </div>

      <DecksTable
        decks={decks}
        cards={cards}
        sortKey={sortKey}
        dir={dir}
        page={page}
        total={total}
        hasNext={(page + 1) * PAGE_SIZE < total}
      />
    </div>
  );
}
