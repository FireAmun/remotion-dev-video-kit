import { Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";
import { CardShell } from "../CardShell";
import { Sfx } from "../Sfx";

type StepsCardProps = {
  readonly items: string[];
};

const STAGGER = 9;

/** A short pipeline: steps light up gold one after another, with a tick each. */
export const StepsCard: React.FC<StepsCardProps> = ({ items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <CardShell style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {items.map((item, i) => {
        const at = 8 + i * STAGGER;
        const on = interpolate(frame, [at, at + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Sequence from={at} durationInFrames={fps} layout="none">
              <Sfx name="tick" />
            </Sequence>
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: theme.fonts.mono,
                fontWeight: 600,
                fontSize: 40,
                color: on > 0.5 ? theme.colors.background : theme.colors.muted,
                backgroundColor: on > 0.5 ? theme.colors.gold : "transparent",
                border: `2px solid ${on > 0.5 ? theme.colors.gold : theme.colors.muted}`,
                scale: `${interpolate(on, [0, 0.6, 1], [1, 1.15, 1])}`,
              }}
            >
              {i + 1}
            </div>
            <div
              style={{
                fontFamily: theme.fonts.heading,
                fontWeight: 600,
                fontSize: 64,
                color: on > 0.5 ? theme.colors.text : theme.colors.muted,
                opacity: 0.45 + on * 0.55,
              }}
            >
              {item}
            </div>
          </div>
        );
      })}
    </CardShell>
  );
};
