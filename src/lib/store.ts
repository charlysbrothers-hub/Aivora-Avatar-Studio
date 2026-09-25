"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { SEED } from "./seed";
import type {
  AppStore,
  CalendarItem,
  Campaign,
  GeneratedAsset,
  Idea,
  IdentityLock,
  LibraryAsset,
  Product,
  Production,
  ProductionStatus,
  PromptRecord,
  PromptTool,
  Publication,
  PublicationMetrics,
  PublicationStatus,
  ReferenceAsset,
  Review,
  ReviewChecklist,
  Scene,
  SocialPlatform,
  StudioSettings,
  TeamMember,
} from "./types";
import { EMPTY_CHECKLIST } from "./types";

const STORAGE_KEY = "aivora-studio-store-v2";

let memoryStore: AppStore = structuredClone(SEED);
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function migrate(raw: Partial<AppStore> | null): AppStore {
  const base = structuredClone(SEED);
  if (!raw) return base;
  return {
    ...base,
    ...raw,
    identity: raw.identity ?? base.identity,
    voiceProfiles: raw.voiceProfiles ?? base.voiceProfiles,
    references: raw.references ?? base.references,
    products: raw.products ?? base.products,
    productAssets: raw.productAssets ?? base.productAssets,
    ideas: raw.ideas ?? base.ideas,
    productions: raw.productions ?? base.productions,
    scenes: raw.scenes ?? base.scenes,
    prompts: raw.prompts ?? base.prompts,
    generatedAssets: raw.generatedAssets ?? base.generatedAssets,
    reviews: raw.reviews ?? base.reviews,
    library: raw.library ?? base.library,
    calendarItems: raw.calendarItems ?? base.calendarItems,
    publications: raw.publications ?? base.publications,
    metrics: raw.metrics ?? base.metrics,
    campaigns: raw.campaigns ?? base.campaigns,
    team: raw.team ?? base.team,
    settings: { ...base.settings, ...(raw.settings || {}) },
  };
}

function loadFromStorage(): AppStore {
  if (typeof window === "undefined") return structuredClone(SEED);
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem("aivora-studio-store-v1");
    if (!raw) return structuredClone(SEED);
    return migrate(JSON.parse(raw) as Partial<AppStore>);
  } catch {
    return structuredClone(SEED);
  }
}

function persist(store: AppStore) {
  memoryStore = store;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }
  emit();
}

function update(mutator: (draft: AppStore) => void) {
  const draft = structuredClone(memoryStore);
  mutator(draft);
  persist(draft);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return memoryStore;
}

export function getStoreSnapshot(): AppStore {
  return memoryStore;
}

export function replaceStore(store: AppStore) {
  persist(store);
}

function getServerSnapshot() {
  return SEED;
}

export function hydrateStore() {
  memoryStore = loadFromStorage();
  emit();
}

export function resetStore() {
  persist(structuredClone(SEED));
}

export function useStore(): AppStore {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useHydratedStore() {
  const [ready, setReady] = useState(false);
  const store = useStore();

  useEffect(() => {
    hydrateStore();
    setReady(true);
  }, []);

  return { store, ready };
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useStoreActions() {
  const setProductionStatus = useCallback(
    (id: string, status: ProductionStatus) => {
      update((d) => {
        const p = d.productions.find((x) => x.id === id);
        if (!p) return;
        p.status = status;
        p.updatedAt = new Date().toISOString();
      });
    },
    [],
  );

  const saveIdentityLock = useCallback((productionId: string, lock: IdentityLock) => {
    update((d) => {
      const p = d.productions.find((x) => x.id === productionId);
      if (!p) return;
      p.identityLock = lock;
      p.status = "LOCKED";
      p.updatedAt = new Date().toISOString();
    });
  }, []);

  const addIdea = useCallback((partial: Omit<Idea, "id" | "createdAt" | "status">) => {
    const idea: Idea = {
      ...partial,
      id: uid("idea"),
      status: "draft",
      createdAt: new Date().toISOString(),
    };
    update((d) => {
      d.ideas.unshift(idea);
    });
    return idea.id;
  }, []);

  const convertIdeaToProduction = useCallback(
    (ideaId: string, type: Production["type"], title?: string) => {
      let productionId = "";
      update((d) => {
        const idea = d.ideas.find((i) => i.id === ideaId);
        if (!idea) return;
        productionId = uid("prod");
        const production: Production = {
          id: productionId,
          title: title || idea.title,
          type,
          status: "PLANNED",
          ideaId,
          sceneIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const scene: Scene = {
          id: uid("scene"),
          productionId,
          order: 1,
          title: "Escena 01",
          description: idea.concept,
        };
        production.sceneIds = [scene.id];
        d.productions.unshift(production);
        d.scenes.push(scene);
        idea.status = "converted";
        idea.productionId = productionId;
      });
      return productionId;
    },
    [],
  );

  const createProduction = useCallback(
    (title: string, type: Production["type"]) => {
      const productionId = uid("prod");
      const sceneId = uid("scene");
      update((d) => {
        d.productions.unshift({
          id: productionId,
          title,
          type,
          status: "PLANNED",
          sceneIds: [sceneId],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        d.scenes.push({
          id: sceneId,
          productionId,
          order: 1,
          title: "Escena 01",
          description: "",
        });
      });
      return productionId;
    },
    [],
  );

  const addScene = useCallback((productionId: string, title: string, description: string) => {
    update((d) => {
      const p = d.productions.find((x) => x.id === productionId);
      if (!p) return;
      const order = p.sceneIds.length + 1;
      const scene: Scene = {
        id: uid("scene"),
        productionId,
        order,
        title,
        description,
      };
      d.scenes.push(scene);
      p.sceneIds.push(scene.id);
      p.updatedAt = new Date().toISOString();
    });
  }, []);

  const updateScene = useCallback((sceneId: string, patch: Partial<Scene>) => {
    update((d) => {
      const s = d.scenes.find((x) => x.id === sceneId);
      if (!s) return;
      Object.assign(s, patch);
    });
  }, []);

  const savePrompt = useCallback(
    (productionId: string, sceneId: string, tool: PromptTool, content: string) => {
      const record: PromptRecord = {
        id: uid("prompt"),
        productionId,
        sceneId,
        tool,
        content,
        createdAt: new Date().toISOString(),
      };
      update((d) => {
        d.prompts.unshift(record);
        const p = d.productions.find((x) => x.id === productionId);
        if (p && (p.status === "LOCKED" || p.status === "PROMPT_READY" || p.status === "REJECTED")) {
          p.status = "PROMPT_READY";
          p.updatedAt = new Date().toISOString();
        }
      });
      return record.id;
    },
    [],
  );

  const importAsset = useCallback(
    (input: {
      productionId: string;
      sceneId: string;
      kind: GeneratedAsset["kind"];
      dataUrl: string;
      fileName: string;
    }) => {
      const assetId = uid("gen");
      const reviewId = uid("rev");
      update((d) => {
        const asset: GeneratedAsset = {
          id: assetId,
          ...input,
          createdAt: new Date().toISOString(),
          reviewId,
        };
        const review: Review = {
          id: reviewId,
          productionId: input.productionId,
          assetId,
          checklist: { ...EMPTY_CHECKLIST },
          decision: "PENDING",
          createdAt: new Date().toISOString(),
        };
        d.generatedAssets.unshift(asset);
        d.reviews.unshift(review);
        const p = d.productions.find((x) => x.id === input.productionId);
        if (p) {
          p.status = "REVIEW";
          p.updatedAt = new Date().toISOString();
        }
      });
      return assetId;
    },
    [],
  );

  const updateReviewChecklist = useCallback(
    (reviewId: string, checklist: ReviewChecklist, notes?: string) => {
      update((d) => {
        const r = d.reviews.find((x) => x.id === reviewId);
        if (!r) return;
        r.checklist = checklist;
        if (notes !== undefined) r.notes = notes;
      });
    },
    [],
  );

  const decideReview = useCallback(
    (reviewId: string, decision: "APPROVED" | "REJECTED", notes?: string) => {
      update((d) => {
        const r = d.reviews.find((x) => x.id === reviewId);
        if (!r) return;
        r.decision = decision;
        if (notes !== undefined) r.notes = notes;
        const p = d.productions.find((x) => x.id === r.productionId);
        const asset = d.generatedAssets.find((a) => a.id === r.assetId);
        if (!p || !asset) return;

        if (decision === "APPROVED") {
          p.status = "LIBRARY";
          const lib: LibraryAsset = {
            id: uid("lib"),
            productionId: p.id,
            sceneId: asset.sceneId,
            assetId: asset.id,
            kind: asset.kind,
            dataUrl: asset.dataUrl,
            fileName: asset.fileName,
            tags: [p.type, p.title],
            productId: p.identityLock?.productId,
            approvedAt: new Date().toISOString(),
          };
          d.library.unshift(lib);
        } else {
          p.status = "REJECTED";
        }
        p.updatedAt = new Date().toISOString();
      });
    },
    [],
  );

  const addReference = useCallback(
    (partial: Omit<ReferenceAsset, "id" | "createdAt">) => {
      update((d) => {
        d.references.unshift({
          ...partial,
          id: uid("ref"),
          createdAt: new Date().toISOString(),
        });
      });
    },
    [],
  );

  const updateReference = useCallback((id: string, patch: Partial<ReferenceAsset>) => {
    update((d) => {
      const r = d.references.find((x) => x.id === id);
      if (!r) return;
      Object.assign(r, patch);
    });
  }, []);

  const addProduct = useCallback(
    (partial: Omit<Product, "id" | "createdAt" | "assetIds">) => {
      update((d) => {
        d.products.unshift({
          ...partial,
          id: uid("proditem"),
          assetIds: [],
          createdAt: new Date().toISOString(),
        });
      });
    },
    [],
  );

  const bumpIdentityVersion = useCallback((changelog: string) => {
    update((d) => {
      const active = d.identity.versions.find((v) => v.id === d.identity.activeVersionId);
      if (!active) return;
      const parts = active.version.replace(/^v/, "").split(".");
      const major = Number(parts[0] || 1);
      const minor = Number(parts[1] || 0) + 1;
      const next: typeof active = {
        ...structuredClone(active),
        id: uid("id"),
        version: `v${major}.${minor}`,
        createdAt: new Date().toISOString(),
        changelog,
      };
      d.identity.versions.unshift(next);
      d.identity.activeVersionId = next.id;
    });
  }, []);

  const updateActiveIdentity = useCallback(
    (patch: {
      bio?: string;
      appearance?: Partial<(typeof SEED.identity.versions)[0]["appearance"]>;
      personality?: Partial<(typeof SEED.identity.versions)[0]["personality"]>;
    }) => {
      update((d) => {
        if (patch.bio !== undefined) d.identity.bio = patch.bio;
        const v = d.identity.versions.find((x) => x.id === d.identity.activeVersionId);
        if (!v) return;
        if (patch.appearance) Object.assign(v.appearance, patch.appearance);
        if (patch.personality) Object.assign(v.personality, patch.personality);
      });
    },
    [],
  );

  const scheduleFromLibrary = useCallback(
    (input: {
      libraryAssetId: string;
      title: string;
      platform: SocialPlatform;
      scheduledAt: string;
      format: Production["type"];
      caption?: string;
      campaignId?: string;
    }) => {
      const publicationId = uid("pub");
      const calendarId = uid("cal");
      update((d) => {
        if (d.settings.requireLibraryBeforePublish) {
          const lib = d.library.find((l) => l.id === input.libraryAssetId);
          if (!lib) return;
        }
        const lib = d.library.find((l) => l.id === input.libraryAssetId);
        const pub: Publication = {
          id: publicationId,
          title: input.title,
          platform: input.platform,
          status: "scheduled",
          scheduledAt: input.scheduledAt,
          libraryAssetId: input.libraryAssetId,
          productionId: lib?.productionId,
          campaignId: input.campaignId,
          caption: input.caption,
          createdAt: new Date().toISOString(),
        };
        const cal: CalendarItem = {
          id: calendarId,
          title: input.title,
          date: input.scheduledAt,
          platform: input.platform,
          format: input.format,
          libraryAssetId: input.libraryAssetId,
          publicationId,
          campaignId: input.campaignId,
          createdAt: new Date().toISOString(),
        };
        d.publications.unshift(pub);
        d.calendarItems.unshift(cal);
        d.metrics.unshift({
          id: uid("met"),
          publicationId,
          platform: input.platform,
          views: 0,
          reach: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
          followersGained: 0,
          engagementRate: 0,
          updatedAt: new Date().toISOString(),
        });
        if (input.campaignId) {
          const c = d.campaigns.find((x) => x.id === input.campaignId);
          if (c && !c.publicationIds.includes(publicationId)) {
            c.publicationIds.push(publicationId);
          }
        }
      });
      return publicationId;
    },
    [],
  );

  const setPublicationStatus = useCallback(
    (id: string, status: PublicationStatus, errorMessage?: string) => {
      update((d) => {
        const p = d.publications.find((x) => x.id === id);
        if (!p) return;
        p.status = status;
        if (status === "published") p.publishedAt = new Date().toISOString();
        if (status === "failed") p.errorMessage = errorMessage || "Error mock de publicación";
        if (status !== "failed") p.errorMessage = undefined;
      });
    },
    [],
  );

  const addCampaign = useCallback(
    (partial: Omit<Campaign, "id" | "createdAt" | "productionIds" | "publicationIds" | "status"> & {
      status?: Campaign["status"];
    }) => {
      const id = uid("camp");
      update((d) => {
        d.campaigns.unshift({
          id,
          title: partial.title,
          objective: partial.objective,
          status: partial.status || "draft",
          productionIds: [],
          publicationIds: [],
          productId: partial.productId,
          startDate: partial.startDate,
          endDate: partial.endDate,
          createdAt: new Date().toISOString(),
        });
      });
      return id;
    },
    [],
  );

  const updateCampaign = useCallback((id: string, patch: Partial<Campaign>) => {
    update((d) => {
      const c = d.campaigns.find((x) => x.id === id);
      if (!c) return;
      Object.assign(c, patch);
    });
  }, []);

  const linkProductionToCampaign = useCallback((campaignId: string, productionId: string) => {
    update((d) => {
      const c = d.campaigns.find((x) => x.id === campaignId);
      const p = d.productions.find((x) => x.id === productionId);
      if (!c || !p) return;
      if (!c.productionIds.includes(productionId)) c.productionIds.push(productionId);
      p.campaignId = campaignId;
    });
  }, []);

  const addTeamMember = useCallback(
    (partial: Omit<TeamMember, "id" | "createdAt" | "active"> & { active?: boolean }) => {
      update((d) => {
        d.team.push({
          id: uid("team"),
          name: partial.name,
          email: partial.email,
          role: partial.role,
          active: partial.active ?? true,
          createdAt: new Date().toISOString(),
        });
      });
    },
    [],
  );

  const updateTeamMember = useCallback((id: string, patch: Partial<TeamMember>) => {
    update((d) => {
      const m = d.team.find((x) => x.id === id);
      if (!m) return;
      Object.assign(m, patch);
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<StudioSettings>) => {
    update((d) => {
      d.settings = { ...d.settings, ...patch };
    });
  }, []);

  const simulatePublish = useCallback((publicationId: string) => {
    update((d) => {
      const p = d.publications.find((x) => x.id === publicationId);
      if (!p) return;
      const ok = Math.random() > 0.15;
      if (ok) {
        p.status = "published";
        p.publishedAt = new Date().toISOString();
        p.errorMessage = undefined;
        const met = d.metrics.find((m) => m.publicationId === publicationId);
        if (met) {
          met.views = 1200 + Math.floor(Math.random() * 8000);
          met.reach = Math.floor(met.views * 0.8);
          met.likes = Math.floor(met.views * 0.06);
          met.comments = Math.floor(met.likes * 0.08);
          met.shares = Math.floor(met.likes * 0.04);
          met.saves = Math.floor(met.likes * 0.12);
          met.followersGained = 5 + Math.floor(Math.random() * 40);
          met.engagementRate = Number(
            (((met.likes + met.comments + met.shares + met.saves) / Math.max(met.reach, 1)) * 100).toFixed(1),
          );
          met.updatedAt = new Date().toISOString();
        }
      } else {
        p.status = "failed";
        p.errorMessage = "API mock: token de red expirado (simulado)";
      }
    });
  }, []);

  const updateMetrics = useCallback((id: string, patch: Partial<PublicationMetrics>) => {
    update((d) => {
      const m = d.metrics.find((x) => x.id === id);
      if (!m) return;
      Object.assign(m, patch, { updatedAt: new Date().toISOString() });
    });
  }, []);

  return {
    setProductionStatus,
    saveIdentityLock,
    addIdea,
    convertIdeaToProduction,
    createProduction,
    addScene,
    updateScene,
    savePrompt,
    importAsset,
    updateReviewChecklist,
    decideReview,
    addReference,
    updateReference,
    addProduct,
    bumpIdentityVersion,
    updateActiveIdentity,
    scheduleFromLibrary,
    setPublicationStatus,
    simulatePublish,
    addCampaign,
    updateCampaign,
    linkProductionToCampaign,
    addTeamMember,
    updateTeamMember,
    updateSettings,
    updateMetrics,
    resetStore,
  };
}
