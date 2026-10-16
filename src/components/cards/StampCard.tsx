import { Sequence, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";
import { Sfx } from "../Sfx";

type StampCardProps = {
  readonly text: string;
  readonly sub?: string;
};

const LAND = 7; // frame the stamp hits

/** A rubber stamp that slams down with a thud and a short shake. */
export const StampCard: React.FC<StampCardProps> = ({ text, sub }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slam = spring({ frame, fps, config: { damping: 14, stiffness: 380 }, durationInFrames: LAND });
  const shake = frame >= LAND && frame < LAND + 8 ? (random(`shake-${frame}`) - 0.5) * 16 : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, translate: `${shake}px 0px` }}>
      <Sequence from={LAND - 1} durationInFrames={fps} layout="none">
        <Sfx name="thud" />
      </Sequence>
      <div
        style={{
          padding: "14px 40px",
          border: `8px solid ${theme.colors.gold}`,
          borderRadius: 20,
          fontFamily: theme.fonts.heading,
          fontWeight: 800,
          fontSize: 92,
          letterSpacing: 3,
          color: theme.colors.gold,
          rotate: "-7deg",
          opacity: Math.min(1, slam * 1.4),
          scale: `${interpolate(slam, [0, 1], [2.4, 1])}`,
          boxShadow: `0 0 50px ${theme.colors.gold}40, inset 0 0 30px ${theme.colors.gold}26`,
          textShadow: `0 0 30px ${theme.colors.gold}66`,
        }}
      >
        {text}
      </div>
      {sub ? (
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 600,
            fontSize: 44,
            color: theme.colors.text,
            textAlign: "center",
            opacity: interpolate(frame, [LAND + 4, LAND + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};
