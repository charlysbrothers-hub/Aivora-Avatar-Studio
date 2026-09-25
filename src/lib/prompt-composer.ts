import type {
  AppStore,
  IdentityLock,
  PromptTool,
  Scene,
} from "./types";

const TOOL_HINTS: Record<PromptTool, string> = {
  gemini_image:
    "TOOL: Gemini Image. Photorealistic still. High detail skin texture, natural pores, credible lighting. No plastic skin, no CGI look.",
  gemini_video:
    "TOOL: Gemini Video. Short cinematic clip. Maintain identity continuity across frames. Natural motion, no morphing face.",
  higgsfield:
    "TOOL: Higgsfield. Motion-focused generation. Lock character, outfit, accessories and product across the shot.",
};

export function composePrompt(opts: {
  store: AppStore;
  lock: IdentityLock;
  scene: Scene;
  tool: PromptTool;
  cameraExtra?: string;
  lightingExtra?: string;
}): string {
  const { store, lock, scene, tool, cameraExtra, lightingExtra } = opts;
  const version =
    store.identity.versions.find((v) => v.id === lock.identityVersionId) ||
    store.identity.versions.find((v) => v.id === store.identity.activeVersionId);

  const face = store.references.find((r) => r.id === lock.faceRefId);
  const body = store.references.find((r) => r.id === lock.bodyRefId);
  const hair = store.references.find((r) => r.id === lock.hairRefId);
  const outfit = store.references.find((r) => r.id === lock.outfitRefId);
  const accessories = store.references.filter((r) =>
    lock.accessoryRefIds.includes(r.id),
  );
  const env = store.references.find((r) => r.id === lock.environmentRefId);
  const product = store.products.find((p) => p.id === lock.productId);
  const voice = store.voiceProfiles.find((v) => v.id === lock.voiceProfileId);

  const lines: string[] = [];

  lines.push("=== AIVORA IDENTITY CANON ===");
  lines.push(
    `${store.identity.name}, ${store.identity.age} años, ${store.identity.nationality} de ${store.identity.originCity}.`,
  );
  lines.push(store.identity.bio);
  lines.push(`TRANSPARENCIA: ${store.identity.transparencyNote}`);

  if (version) {
    lines.push("");
    lines.push(`=== APPEARANCE (${version.version}) ===`);
    lines.push(`Face: ${version.appearance.face}`);
    lines.push(`Eyes: ${version.appearance.eyes}`);
    lines.push(`Brows: ${version.appearance.eyebrows}`);
    lines.push(`Nose: ${version.appearance.nose}`);
    lines.push(`Lips: ${version.appearance.lips}`);
    lines.push(`Skin: ${version.appearance.skin}`);
    lines.push(`Hair: ${version.appearance.hair}`);
    lines.push(`Body: ${version.appearance.body}`);
    lines.push(`Realism: ${version.appearance.realism}`);
    lines.push("");
    lines.push("=== PERSONALITY ===");
    lines.push(`Traits: ${version.personality.traits.join(", ")}`);
    lines.push(`Tone: ${version.personality.tone}`);
    lines.push(`Speech: ${version.personality.speech}`);
    lines.push(`Limits: ${version.personality.limits.join("; ")}`);
  }

  lines.push("");
  lines.push("=== IDENTITY LOCK (MUST KEEP CONSISTENT) ===");
  lines.push(`Character: ${lock.characterName}`);
  if (face) lines.push(`Face ref: ${face.title}`);
  if (body) lines.push(`Body ref: ${body.title}`);
  if (hair) lines.push(`Hair ref: ${hair.title}`);
  if (outfit) lines.push(`Outfit: ${outfit.title}`);
  if (accessories.length)
    lines.push(`Accessories: ${accessories.map((a) => a.title).join(", ")}`);
  if (env) lines.push(`Environment: ${env.title}`);
  if (voice) lines.push(`Voice: ${voice.name} — ${voice.description}`);
  lines.push(`Personality lock: ${lock.personalityNote}`);
  if (lock.notes) lines.push(`Lock notes: ${lock.notes}`);

  if (product) {
    lines.push("");
    lines.push("=== PRODUCT (DO NOT INVENT DETAILS) ===");
    lines.push(`${product.name} (${product.sku})`);
    lines.push(product.description);
    lines.push(`Specs: ${product.specs.join("; ")}`);
    lines.push(`Colors: ${product.colors.join(", ")}`);
    lines.push(`Visual details: ${product.visualDetails.join("; ")}`);
    lines.push(`Allowed claims: ${product.claims.join("; ")}`);
  }

  lines.push("");
  lines.push("=== SCENE ===");
  lines.push(`Title: ${scene.title}`);
  lines.push(`Description: ${scene.description}`);
  if (scene.camera) lines.push(`Camera: ${scene.camera}`);
  if (scene.pose) lines.push(`Pose: ${scene.pose}`);
  if (scene.expression) lines.push(`Expression: ${scene.expression}`);
  if (scene.dialogue) lines.push(`Dialogue: "${scene.dialogue}"`);
  if (scene.durationSec) lines.push(`Duration: ${scene.durationSec}s`);
  if (cameraExtra) lines.push(`Camera extra: ${cameraExtra}`);
  if (lightingExtra) lines.push(`Lighting: ${lightingExtra}`);

  lines.push("");
  lines.push("=== TOOL INSTRUCTIONS ===");
  lines.push(TOOL_HINTS[tool]);
  lines.push(
    "CRITICAL: Same face, body, hair, outfit, accessories and product as Identity Lock. No silent changes between scenes.",
  );

  return lines.join("\n");
}
