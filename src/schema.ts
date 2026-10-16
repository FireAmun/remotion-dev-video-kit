import { z } from "zod";
import { POSES } from "./rig/poses";
import { SET_NAMES } from "./sets/Sets";

// Shape of public/episodes/<date>/episode.json (built by scripts/build_episode.py
// from plan.json). Daily runs only write data; every set, pose, prop and item
// it can ask for already exists in code.

export const CHAPTERS = ["HOOK", "WHAT", "WHY IT MATTERS", "HOW", "CATCH", "TRY IT", "NEXT"] as const;

const poseNames = Object.keys(POSES) as [keyof typeof POSES, ...(keyof typeof POSES)[]];

const beatSchema = z.object({
  /** When the beat starts, in ms from the start of its scene. */
  atMs: z.number().min(0).default(0),
  pose: z.enum(poseNames),
  motion: z.enum(["talk", "wave", "shake", "celebrate", "search", "type", "still"]).default("talk"),
  rightProp: z.enum(["magnifier", "phone", "trophy"]).optional(),
  leftProp: z.enum(["magnifier", "phone", "trophy"]).optional(),
  laptop: z.boolean().default(false),
});

const actorSchema = z.object({
  /** Horizontal centre of the feet, px. */
  x: z.number().default(540),
  /** 1 = 1010 px tall. */
  scale: z.number().default(0.9),
  enterFrom: z.enum(["left", "right"]).optional(),
  /** "left" mirrors the character, so pointing poses point left. */
  facing: z.enum(["left", "right"]).default("right"),
  beats: z.array(beatSchema).min(1),
});

const itemBase = {
  /** When the item appears / disappears, in ms from the start of its scene. */
  atMs: z.number().min(0).default(0),
  untilMs: z.number().optional(),
  /** Centre of the item in the 1080x1920 frame. */
  x: z.number().default(540),
  y: z.number().default(600),
  width: z.number().optional(),
  rotate: z.number().default(0),
};

const lineSchema = z.object({ text: z.string(), kind: z.enum(["command", "code", "output"]).default("command") });

export const itemSchema = z.discriminatedUnion("kind", [
  z.object({ ...itemBase, kind: z.literal("icon"), name: z.enum(["camera", "timeline"]), crossAtMs: z.number().optional() }),
  z.object({ ...itemBase, kind: z.literal("label"), text: z.string(), tone: z.enum(["gold", "light"]).default("gold") }),
  z.object({ ...itemBase, kind: z.literal("code"), text: z.string(), fromX: z.number().optional(), fromY: z.number().optional() }),
  z.object({ ...itemBase, kind: z.literal("window"), title: z.string().default("terminal"), style: z.enum(["terminal", "chalk"]).default("terminal"), lines: z.array(lineSchema).min(1) }),
  z.object({ ...itemBase, kind: z.literal("counter"), value: z.number(), prefix: z.string().default(""), suffix: z.string().default(""), label: z.string() }),
  z.object({ ...itemBase, kind: z.literal("stamp"), text: z.string(), sub: z.string().optional() }),
  z.object({ ...itemBase, kind: z.literal("steps"), items: z.array(z.string()).min(2).max(5) }),
  z.object({ ...itemBase, kind: z.literal("waveform"), label: z.string().default("mouth = loudness > threshold") }),
  z.object({ ...itemBase, kind: z.literal("calendar"), from: z.number().int(), to: z.number().int() }),
  z.object({ ...itemBase, kind: z.literal("banner"), title: z.string().default("ACHIEVEMENT UNLOCKED"), text: z.string() }),
  z.object({ ...itemBase, kind: z.literal("confetti") }),
  z.object({ ...itemBase, kind: z.literal("book"), text: z.string() }),
  z.object({ ...itemBase, kind: z.literal("follow") }),
  z.object({ ...itemBase, kind: z.literal("end"), url: z.string(), cta: z.string() }),
  /** Kinetic type: words slam in one by one; `highlight` words are gold. */
  z.object({ ...itemBase, kind: z.literal("kinetic"), text: z.string(), highlight: z.array(z.string()).default([]), stagger: z.number().int().min(1).default(5), size: z.number().default(120) }),
  /** Split-flap (airport board) display, e.g. a big stat. */
  z.object({ ...itemBase, kind: z.literal("splitflap"), text: z.string().max(10), label: z.string().optional(), size: z.number().default(170) }),
]);

export const sceneSchema = z.object({
  chapter: z.enum(CHAPTERS),
  /** Scene start/end in the narration audio. */
  startMs: z.number().min(0),
  endMs: z.number().positive(),
  set: z.enum(SET_NAMES),
  /** e.g. "sunrise" or "timelapse" for the sky set. */
  setVariant: z.string().default(""),
  actor: actorSchema.nullable().default(null),
  items: z.array(itemSchema).default([]),
  /** Slow push-in over the scene (1 = none). */
  zoom: z.number().default(1.05),
  /** Ambient gold dust drifting through the scene. */
  particles: z.boolean().default(true),
});

export const captionSchema = z.object({
  text: z.string(),
  startMs: z.number(),
  endMs: z.number(),
  timestampMs: z.number().nullable(),
  confidence: z.number().nullable(),
});

export const episodeSchema = z.object({
  episode: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string(),
  /** Narration WAV inside public/. */
  audio: z.string(),
  /** Word captions (Remotion Caption shape), already corrected for display. */
  captions: z.array(captionSchema).min(1),
  /** Words drawn in gold in the captions (at most one per caption line). */
  keywords: z.array(z.string()).default([]),
  scenes: z.array(sceneSchema).min(1),
  /** Extra time after the narration ends, so the last scene can be read. */
  tailMs: z.number().min(0).default(1500),
  sources: z.array(z.object({ title: z.string(), url: z.string().url() })).default([]),
});

export type Item = z.infer<typeof itemSchema>;
export type Scene = z.infer<typeof sceneSchema>;
export type Episode = z.infer<typeof episodeSchema>;
