"use client";

import * as React from "react";

/**
 * Watchlist persisted in localStorage. This is genuinely a client concern —
 * per-browser, no auth, no server state — so it lives entirely in the frontend.
 * A vanilla external store keeps every FavoriteButton and the Saved page in
 * sync (same tab via listeners, other tabs via the storage event).
 */
export type FavType = "deck" | "card" | "player";

export interface Favorite {
  type: FavType;
  id: string;
  label: string;
  href: string;
}

const KEY = "arena:favorites";
const EMPTY: Favorite[] = [];

let cache: Favorite[] = EMPTY;
const listeners = new Set<() => void>();

function read(): Favorite[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Favorite[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

// Initialise the cache once on the client.
if (typeof window !== "undefined") {
  cache = read();
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      cache = read();
      listeners.forEach((l) => l());
    }
  });
}

function write(next: Favorite[]) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage full / unavailable — keep the in-memory cache only.
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const keyOf = (type: FavType, id: string) => `${type}:${id}`;

export function toggleFavorite(fav: Favorite) {
  const k = keyOf(fav.type, fav.id);
  const exists = cache.some((f) => keyOf(f.type, f.id) === k);
  write(exists ? cache.filter((f) => keyOf(f.type, f.id) !== k) : [fav, ...cache]);
}

export function removeFavorite(type: FavType, id: string) {
  const k = keyOf(type, id);
  write(cache.filter((f) => keyOf(f.type, f.id) !== k));
}

/** Reactive list of all favorites. */
export function useFavorites(): Favorite[] {
  return React.useSyncExternalStore(
    subscribe,
    () => cache,
    () => EMPTY,
  );
}

/** Reactive boolean for a single item. */
export function useIsFavorite(type: FavType, id: string): boolean {
  const favorites = useFavorites();
  return favorites.some((f) => f.type === type && f.id === id);
}
