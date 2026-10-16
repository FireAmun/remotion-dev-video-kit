import { AbsoluteFill } from "remotion";
import { Background } from "./components/Background";
import { POSES, type PoseName } from "./rig/poses";
import { LaptopProp } from "./rig/props";
import { Puppet } from "./rig/Puppet";
import { theme } from "./theme";

// Pose gallery for tuning the rig: every named pose side by side.
const SHOW: { name: PoseName; right?: "magnifier" | "phone" | "trophy"; laptop?: boolean }[] = [
  { name: "idle" },
  { name: "talk" },
  { name: "explain" },
  { name: "shrug" },
  { name: "wave" },
  { name: "point" },
  { name: "pointUp" },
  { name: "pointViewer" },
  { name: "celebrate" },
  { name: "think" },
  { name: "search", right: "magnifier" },
  { name: "laptop", laptop: true },
  { name: "holdUp" },
  { name: "thumbsUp" },
  { name: "headScratch" },
];

export const RigTest: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <div style={{ display: "flex", flexWrap: "wrap", padding: 20, gap: 0 }}>
        {SHOW.map((s) => (
          <div key={s.name} style={{ width: 260, height: 460, position: "relative" }}>
            <div style={{ scale: "0.4", transformOrigin: "0 0", position: "absolute", left: 0, top: 36 }}>
              <Puppet
                pose={POSES[s.name]}
                mouthOpen={false}
                blink={0}
                rightProp={s.right ?? null}
                bodyProp={s.laptop ? <LaptopProp glow={1} /> : null}
              />
            </div>
            <div style={{ position: "absolute", top: 0, left: 10, color: theme.colors.gold, fontFamily: theme.fonts.mono, fontSize: 28 }}>
              {s.name}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
