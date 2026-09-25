"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useHydratedStore, hydrateStore, resetStore, getStoreSnapshot, replaceStore } from "@/lib/store";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { createClient } from "@/lib/supabase/client";
import { loadWorkspaceSnapshot, saveWorkspaceSnapshot } from "@/lib/supabase/workspace";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready } = useHydratedStore();
  const isAuth = pathname.startsWith("/login") || pathname.startsWith("/signup");

  useEffect(() => {
    if (isAuth) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const remote = await loadWorkspaceSnapshot();
      if (remote && !cancelled) {
        replaceStore(remote);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuth]);

  useEffect(() => {
    if (isAuth) return;
    const id = window.setInterval(() => {
      void saveWorkspaceSnapshot(getStoreSnapshot());
    }, 15000);
    return () => window.clearInterval(id);
  }, [isAuth]);

  async function signOut() {
    await saveWorkspaceSnapshot(getStoreSnapshot());
    const supabase = createClient();
    await supabase.auth.signOut();
    resetStore();
    hydrateStore();
    router.replace("/login");
    router.refresh();
  }

  if (isAuth) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Sidebar onSignOut={signOut} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          {!ready ? (
            <div className="text-sm text-[var(--text-muted)]">Cargando Aivora Studio…</div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
