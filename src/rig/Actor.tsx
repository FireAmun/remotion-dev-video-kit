import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useMouthTrack } from "../components/mouth";
import { blendPose, POSES, type Pose, type PoseName } from "./poses";
import { LaptopProp, type PropName } from "./props";
import { PUPPET, Puppet } from "./Puppet";

export type Motion = "talk" | "wave" | "shake" | "celebrate" | "search" | "type" | "still";

export type Beat = {
  /** Frame (in this component's timeline) at which the beat starts. */
  readonly at: number;
  readonly pose: PoseName;
  readonly motion?: Motion;
  readonly rightProp?: PropName;
  readonly leftProp?: PropName;
  readonly laptop?: boolean;
};

type ActorProps = {
  /** Voice track inside public/, for lip-sync and talk gestures. */
  readonly audio: string;
  /** Narration frame that lines up with this component's frame 0. */
  readonly audioStartFrame?: number;
  readonly beats: Beat[];
  /** Feet position in the frame, and size (1 = puppet's natural 1010 px height). */
  readonly x: number;
  readonly bottom: number;
  readonly scale: number;
  /** Walk in from off-screen on this side during the first ~0.6 s. */
  readonly enterFrom?: "left" | "right";
  /** "left" mirrors the character, so pointing poses point left. */
  readonly facing?: "left" | "right";
};

/** Blink amount (0-1) every 3-5 s at seeded random times. */
const blinkAt = (frame: number, fps: number): number => {
  const len = Math.round(0.18 * fps);
  let t = Math.round(1.2 * fps);
  for (let i = 0; t <= frame; i++) {
    if (frame < t + len) {
      return interpolate(frame, [t, t + len / 2, t + len], [0, 1, 0]);
    }
    t += Math.round((3 + random(`blink-${i}`) * 2) * fps);
  }
  return 0;
};

const withMotion = (pose: Pose, motion: Motion, f: number, level: number): { pose: Pose; nod: number; lift: number } => {
  const s = (period: number, phase = 0) => Math.sin(((f + phase) / period) * Math.PI * 2);
  let p = pose;
  let nod = level * 3 * s(9);
  let lift = 0;
  const arm = (side: "left" | "right", d: Partial<Record<"shoulder" | "elbow" | "wrist", number>>) => {
    const a = p[side];
    p = {
      ...p,
      [side]: { ...a, shoulder: a.shoulder + (d.shoulder ?? 0), elbow: a.elbow + (d.elbow ?? 0), wrist: a.wrist + (d.wrist ?? 0) },
    };
  };
  switch (motion) {
    case "talk":
      // Beat gestures that follow the voice: the louder the syllable, the bigger the move.
      arm("right", { elbow: -level * 22, wrist: level * 12 * s(11) });
      arm("left", { elbow: -level * 8 });
      break;
    case "wave":
      arm("right", { elbow: 22 * s(12), wrist: 10 * s(12, 3) });
      break;
    case "shake":
      nod += 7 * s(10);
      arm("left", { elbow: 10 * s(14) });
      arm("right", { elbow: -10 * s(14) });
      break;
    case "celebrate":
      lift = Math.abs(s(16)) * 46;
      arm("left", { shoulder: 8 * s(8), elbow: 10 * s(8, 2) });
      arm("right", { shoulder: 8 * s(8, 4), elbow: 10 * s(8, 6) });
      break;
    case "search":
      arm("right", { shoulder: 10 * s(36), elbow: 8 * s(36, 9) });
      nod += 3 * s(36);
      break;
    case "type":
      arm("left", { elbow: 5 * s(6) });
      arm("right", { elbow: 5 * s(6, 3) });
      nod += 2 * s(18);
      break;
    case "still":
      break;
  }
  return { pose: p, nod, lift };
};

/** The rigged character performing a list of beats, lip-synced to the narration. */
export const Actor: React.FC<ActorProps> = ({ audio, audioStartFrame = 0, beats, x, bottom, scale, enterFrom, facing = "right" }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const mouth = useMouthTrack(audio, fps);
  const t = frame + audioStartFrame;
  const level = mouth?.level[t] ?? 0;

  let i = 0;
  beats.forEach((b, k) => {
    if (b.at <= frame) i = k;
  });
  const beat = beats[i];
  const prev = beats[Math.max(0, i - 1)];
  const blend = i === 0 ? 1 : spring({ frame: frame - beat.at, fps, config: { damping: 16, stiffness: 170 } });
  const base = blendPose(POSES[prev.pose], POSES[beat.pose], blend);
  const { pose, nod, lift } = withMotion(base, beat.motion ?? "talk", frame, level);

  // Walk-in: slide from off-screen with swinging legs.
  const walk = enterFrom ? interpolate(frame, [0, Math.round(0.6 * fps)], [1, 0], { extrapolateRight: "clamp" }) : 0;
  const offscreen = enterFrom === "left" ? -width * 0.8 : width * 0.8;
  const stride = walk > 0 ? Math.sin((frame / 5) * Math.PI) * 14 : 0;
  const walkPose: Pose = walk > 0 ? { ...pose, hipL: pose.hipL + stride, hipR: pose.hipR - stride } : pose;

  const breathe = Math.sin((t / (2.6 * fps)) * Math.PI * 2) * 4;
  const laptopHeld = (beat.laptop && blend > 0.5) || (prev.laptop && blend <= 0.5);

  return (
    <div
      style={{
        position: "absolute",
        left: x + offscreen * walk - (PUPPET.width / 2) * scale,
        bottom: bottom + (lift + breathe) * scale,
        width: PUPPET.width * scale,
        height: PUPPET.height * scale,
      }}
    >
      <div style={{ scale: `${scale}`, transformOrigin: "0 0" }}>
        <div style={{ scale: facing === "left" ? "-1 1" : undefined, transformOrigin: `${PUPPET.width / 2}px 0` }}>
        <Puppet
          pose={walkPose}
          mouthOpen={mouth?.open[t] ?? false}
          blink={blinkAt(t, fps)}
          headNod={nod}
          rightProp={blend > 0.5 ? beat.rightProp : prev.rightProp}
          leftProp={blend > 0.5 ? beat.leftProp : prev.leftProp}
          bodyProp={laptopHeld ? <LaptopProp glow={beat.motion === "type" ? 0.6 + 0.4 * Math.abs(Math.sin(frame / 7)) : 0} /> : null}
        />
        </div>
      </div>
    </div>
  );
};
