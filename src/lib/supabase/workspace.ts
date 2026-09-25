"use client";

import { createClient } from "@/lib/supabase/client";
import type { AppStore } from "@/lib/types";
import { SEED } from "@/lib/seed";

export async function loadWorkspaceSnapshot(): Promise<AppStore | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("workspace_snapshots")
    .select("data")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("loadWorkspaceSnapshot", error.message);
    return null;
  }

  if (!data?.data) {
    const seed = structuredClone(SEED);
    await saveWorkspaceSnapshot(seed);
    return seed;
  }

  return data.data as AppStore;
}

export async function saveWorkspaceSnapshot(store: AppStore): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("workspace_snapshots").upsert({
    user_id: user.id,
    data: store,
    updated_at: new Date().toISOString(),
  });

  if (error) console.error("saveWorkspaceSnapshot", error.message);
}
