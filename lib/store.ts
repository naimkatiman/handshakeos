"use client";
import { useSyncExternalStore } from "react";
import type { Opportunity } from "./types";
import { seedOpportunities } from "./seed";

// Browser-local store: zero setup, works on any host. Swap for Supabase when you need a shared ecosystem view.
const KEY = "handshakeos:v1";
const listeners = new Set<() => void>();
let cache: Opportunity[] | null = null;
const EMPTY: Opportunity[] = [];

function load(): Opportunity[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Opportunity[]) : seedOpportunities();
    if (!raw) persist();
  } catch {
    cache = seedOpportunities();
  }
  return cache;
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* storage full or blocked: keep in memory */
  }
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

export const store = {
  all: () => load(),
  get: (id: string) => load().find((o) => o.id === id),
  add(o: Opportunity) {
    cache = [o, ...load()];
    emit();
  },
  update(id: string, fn: (o: Opportunity) => Opportunity) {
    cache = load().map((o) => (o.id === id ? { ...fn(o), updatedAt: new Date().toISOString() } : o));
    emit();
  },
  remove(id: string) {
    cache = load().filter((o) => o.id !== id);
    emit();
  },
  reset(withSeed = true) {
    cache = withSeed ? seedOpportunities() : [];
    emit();
  },
  replace(all: Opportunity[]) {
    cache = all;
    emit();
  },
};

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function useOpportunities(): Opportunity[] {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}

export function useOpportunity(id: string): Opportunity | undefined {
  const all = useOpportunities();
  return all.find((o) => o.id === id);
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
