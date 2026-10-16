import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type CalculateMetadataFunction,
} from "remotion";
import { ChapterBar } from "./components/ChapterBar";
import { Sfx } from "./components/Sfx";
import { WordCaptions } from "./components/WordCaptions";
import { VIDEO } from "./layout";
import { Actor } from "./rig/Actor";
import { ItemView } from "./scene/Items";
import { episodeSchema, type Episode as EpisodeData, type Scene } from "./schema";
import { GoldDust } from "./scene/Styles";
import { FLOOR_Y, SetBack, SetFront } from "./sets/Sets";
import { theme } from "./theme";

export type EpisodeProps = {
  /** episode.json inside public/, e.g. "episodes/2026-10-15/episode.json". */
  readonly episodeFile: string;
  /** Filled in by calculateMetadata from episodeFile. */
  readonly episode: EpisodeData | null;
};

/** Loads and validates episode.json, and sizes the video to the narration plus the tail. */
export const calculateEpisodeMetadata: CalculateMetadataFunction<EpisodeProps> = async ({ props }) => {
  const res = await fetch(staticFile(props.episodeFile));
  const episode = episodeSchema.parse(await res.json());
  const lastEnd = Math.max(...episode.scenes.map((s) => s.endMs));
  return {
    durationInFrames: Math.ceil(((lastEnd + episode.tailMs) / 1000) * VIDEO.fps),
    props: { ...props, episode },
  };
};

type SceneViewProps = {
  readonly scene: Scene;
  readonly audio: string;
  /** Absolute frame where this scene's Sequence starts. */
  readonly from: number;
  readonly durationInFrames: number;
};

/** One sentence: a set, the character acting it out, and items landing on words. Slow push-in. */
const SceneView: React.FC<SceneViewProps> = ({ scene, audio, from, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Scene-relative ms -> frame inside this Sequence.
  const local = (ms: number) => Math.max(0, Math.round(((scene.startMs + ms) / 1000) * fps) - from);
  const zoom = interpolate(frame, [0, durationInFrames], [1, scene.zoom], { extrapolateRight: "clamp" });
  const spotX = scene.actor?.x ?? 540;

  return (
    <AbsoluteFill style={{ scale: `${zoom}`, transformOrigin: "540px 900px" }}>
      <SetBack name={scene.set} variant={scene.setVariant} spotX={spotX} />
      {scene.particles ? <GoldDust /> : null}
      {scene.actor ? (
        <Actor
          audio={audio}
          audioStartFrame={from}
          beats={scene.actor.beats.map((b) => ({ ...b, at: local(b.atMs) }))}
          x={scene.actor.x}
          bottom={VIDEO.height - FLOOR_Y}
          scale={scene.actor.scale}
          enterFrom={scene.actor.enterFrom}
          facing={scene.actor.facing}
        />
      ) : null}
      <SetFront name={scene.set} />
      {scene.items.map((item, i) => {
        const at = local(item.atMs);
        const until = item.untilMs === undefined ? durationInFrames : local(item.untilMs);
        return (
          <Sequence key={i} name={item.kind} from={at} durationInFrames={Math.max(1, until - at)} premountFor={fps}>
            <ItemView item={item} durationInFrames={Math.max(1, until - at)} audio={audio} startFrame={from + at} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const Episode: React.FC<EpisodeProps> = ({ episode }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  if (!episode) {
    return null;
  }

  const toFrame = (ms: number) => Math.round((ms / 1000) * fps);
  const timeMs = (frame / fps) * 1000;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
      <Audio src={staticFile(episode.audio)} premountFor={fps} />
      {episode.scenes.map((scene, i) => {
        const from = i === 0 ? 0 : toFrame(scene.startMs);
        const next = episode.scenes[i + 1];
        const to = next ? toFrame(next.startMs) : durationInFrames;
        return (
          <Sequence key={i} name={`${i + 1}. ${scene.chapter} · ${scene.set}`} from={from} durationInFrames={to - from} premountFor={fps}>
            {i > 0 ? <Sfx name="whoosh" /> : null}
            <SceneView scene={scene} audio={episode.audio} from={from} durationInFrames={to - from} />
          </Sequence>
        );
      })}
      <ChapterBar episode={episode.episode} scenes={episode.scenes} timeMs={timeMs} />
      <WordCaptions captions={episode.captions} keywords={episode.keywords} timeMs={timeMs} />
    </AbsoluteFill>
  );
};
