export type ProductionStatus =
  | "IDEA"
  | "PLANNED"
  | "LOCKED"
  | "PROMPT_READY"
  | "GENERATING"
  | "GENERATED"
  | "REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "LIBRARY";

export type ReferenceCategory =
  | "Face"
  | "Body"
  | "Hair"
  | "Outfit"
  | "Accessories"
  | "Pose"
  | "Environment"
  | "Product"
  | "Voice";

export type ReferenceStatus =
  | "Candidate"
  | "Reviewed"
  | "Canonical"
  | "Archived";

export type ProductionType =
  | "fotografia"
  | "carrusel"
  | "story"
  | "reel"
  | "anuncio"
  | "video"
  | "campana"
  | "promocional";

export type PromptTool = "gemini_image" | "gemini_video" | "higgsfield";

export type AssetKind = "image" | "video" | "audio";

export interface AppearanceCanon {
  face: string;
  eyes: string;
  eyebrows: string;
  nose: string;
  lips: string;
  skin: string;
  hair: string;
  body: string;
  realism: string;
}

export interface PersonalityCanon {
  traits: string[];
  tone: string;
  speech: string;
  expressions: string[];
  limits: string[];
}

export interface VoiceProfile {
  id: string;
  name: string;
  version: string;
  description: string;
  params: string;
}

export interface IdentityVersion {
  id: string;
  version: string;
  createdAt: string;
  changelog: string;
  appearance: AppearanceCanon;
  personality: PersonalityCanon;
  voiceProfileId: string;
}

export interface IdentityProfile {
  id: string;
  name: string;
  age: number;
  nationality: string;
  originCity: string;
  bio: string;
  transparencyNote: string;
  activeVersionId: string;
  versions: IdentityVersion[];
}

export interface ReferenceAsset {
  id: string;
  title: string;
  category: ReferenceCategory;
  status: ReferenceStatus;
  imageDataUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface ProductAsset {
  id: string;
  productId: string;
  imageDataUrl?: string;
  label: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  specs: string[];
  colors: string[];
  dimensions: string;
  claims: string[];
  visualDetails: string[];
  assetIds: string[];
  createdAt: string;
}

export interface Idea {
  id: string;
  title: string;
  concept: string;
  formatHint?: ProductionType;
  campaignHint?: string;
  status: "draft" | "ready" | "converted";
  createdAt: string;
  productionId?: string;
}

export interface IdentityLock {
  characterName: string;
  identityVersionId: string;
  faceRefId?: string;
  bodyRefId?: string;
  hairRefId?: string;
  outfitRefId?: string;
  accessoryRefIds: string[];
  productId?: string;
  environmentRefId?: string;
  voiceProfileId?: string;
  personalityNote: string;
  notes?: string;
}

export interface Scene {
  id: string;
  productionId: string;
  order: number;
  title: string;
  description: string;
  camera?: string;
  pose?: string;
  expression?: string;
  dialogue?: string;
  durationSec?: number;
  overrideLock?: boolean;
}

export interface PromptRecord {
  id: string;
  productionId: string;
  sceneId: string;
  tool: PromptTool;
  content: string;
  createdAt: string;
}

export interface GeneratedAsset {
  id: string;
  productionId: string;
  sceneId: string;
  kind: AssetKind;
  dataUrl: string;
  fileName: string;
  createdAt: string;
  reviewId?: string;
}

export interface ReviewChecklist {
  face: boolean;
  body: boolean;
  hair: boolean;
  outfit: boolean;
  accessories: boolean;
  product: boolean;
  environment: boolean;
  continuity: boolean;
  voice: boolean;
  quality: boolean;
}

export interface Review {
  id: string;
  productionId: string;
  assetId: string;
  checklist: ReviewChecklist;
  decision: "APPROVED" | "REJECTED" | "PENDING";
  notes?: string;
  createdAt: string;
}

export interface LibraryAsset {
  id: string;
  productionId: string;
  sceneId: string;
  assetId: string;
  kind: AssetKind;
  dataUrl: string;
  fileName: string;
  tags: string[];
  productId?: string;
  approvedAt: string;
}

export type SocialPlatform = "instagram" | "tiktok" | "youtube" | "facebook";

export type PublicationStatus = "draft" | "scheduled" | "published" | "failed";

export type TeamRole = "Owner" | "Admin" | "Creator" | "Reviewer";

export interface CalendarItem {
  id: string;
  title: string;
  date: string;
  platform: SocialPlatform;
  format: ProductionType;
  libraryAssetId?: string;
  publicationId?: string;
  campaignId?: string;
  notes?: string;
  createdAt: string;
}

export interface Publication {
  id: string;
  title: string;
  platform: SocialPlatform;
  status: PublicationStatus;
  scheduledAt: string;
  publishedAt?: string;
  libraryAssetId?: string;
  productionId?: string;
  campaignId?: string;
  caption?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface PublicationMetrics {
  id: string;
  publicationId: string;
  platform: SocialPlatform;
  views: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  followersGained: number;
  engagementRate: number;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  title: string;
  objective: string;
  status: "draft" | "active" | "paused" | "completed";
  productionIds: string[];
  publicationIds: string[];
  productId?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  active: boolean;
  createdAt: string;
}

export interface StudioSettings {
  studioName: string;
  defaultLanguage: string;
  defaultPlatform: SocialPlatform;
  transparencyRequired: boolean;
  requireReviewBeforeLibrary: boolean;
  requireLibraryBeforePublish: boolean;
  preferredTools: PromptTool[];
  socialHandles: Partial<Record<SocialPlatform, string>>;
  notes?: string;
}

export interface Production {
  id: string;
  title: string;
  type: ProductionType;
  status: ProductionStatus;
  ideaId?: string;
  campaignId?: string;
  identityLock?: IdentityLock;
  sceneIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AppStore {
  identity: IdentityProfile;
  voiceProfiles: VoiceProfile[];
  references: ReferenceAsset[];
  products: Product[];
  productAssets: ProductAsset[];
  ideas: Idea[];
  productions: Production[];
  scenes: Scene[];
  prompts: PromptRecord[];
  generatedAssets: GeneratedAsset[];
  reviews: Review[];
  library: LibraryAsset[];
  calendarItems: CalendarItem[];
  publications: Publication[];
  metrics: PublicationMetrics[];
  campaigns: Campaign[];
  team: TeamMember[];
  settings: StudioSettings;
}

export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  facebook: "Facebook",
};

export const PUBLICATION_STATUS_LABELS: Record<PublicationStatus, string> = {
  draft: "Borrador",
  scheduled: "Programada",
  published: "Publicada",
  failed: "Fallida",
};

export const EMPTY_CHECKLIST: ReviewChecklist = {
  face: false,
  body: false,
  hair: false,
  outfit: false,
  accessories: false,
  product: false,
  environment: false,
  continuity: false,
  voice: false,
  quality: false,
};

export const STATUS_LABELS: Record<ProductionStatus, string> = {
  IDEA: "Idea",
  PLANNED: "Planificada",
  LOCKED: "Identity Lock",
  PROMPT_READY: "Prompt listo",
  GENERATING: "Generando",
  GENERATED: "Generada",
  REVIEW: "En revisión",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  LIBRARY: "Biblioteca",
};
