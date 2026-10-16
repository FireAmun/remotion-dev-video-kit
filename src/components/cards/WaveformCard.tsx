import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";
import { CardShell } from "../CardShell";
import { MOUTH_OPEN, useMouthTrack } from "../mouth";

type WaveformCardProps = {
  /** Narration track the character lip-syncs to. */
  readonly audio: string;
  /** Absolute narration frame at which this card starts. */
  readonly startFrame: number;
  readonly label: string;
};

const WINDOW = 60; // frames of history shown (2 s at 30 fps)
const BAR_HEIGHT = 340;

const Face: React.FC<{ readonly state: "closed" | "open"; readonly active: boolean }> = ({ state, active }) => (
  <div style={{ textAlign: "center" }}>
    <div
      style={{
        width: 190,
        height: 190,
        borderRadius: "50%",
        overflow: "hidden",
        position: "relative",
        border: `4px solid ${active ? theme.colors.gold : `${theme.colors.muted}55`}`,
        boxShadow: active ? `0 0 24px ${theme.colors.gold}88` : undefined,
        backgroundColor: theme.colors.background,
      }}
    >
      {/* The rig's head art, cropped to the face. */}
      <Img
        src={staticFile(`character/rig/head_${state}.png`)}
        style={{ position: "absolute", width: 260, left: -38, top: -78 }}
      />
    </div>
    <div
      style={{
        marginTop: 10,
        fontFamily: theme.fonts.mono,
        fontSize: 26,
        color: active ? theme.colors.gold : theme.colors.muted,
      }}
    >
      {state}
    </div>
  </div>
);

/** Live view of the lip-sync: loudness bars, the open threshold, and which mouth frame is showing. */
export const WaveformCard: React.FC<WaveformCardProps> = ({ audio, startFrame, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mouth = useMouthTrack(audio, fps);
  const now = startFrame + frame;
  const isOpen = mouth?.open[now] ?? false;

  return (
    <CardShell style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ fontFamily: theme.fonts.mono, fontSize: 36, color: theme.colors.muted }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <div style={{ position: "relative", flex: 1, height: BAR_HEIGHT, display: "flex", alignItems: "flex-end", gap: 3 }}>
          {Array.from({ length: WINDOW }, (_, i) => {
            const f = now - (WINDOW - 1 - i);
            const level = f >= 0 && mouth ? (mouth.level[f] ?? 0) : 0;
            const open = f >= 0 && mouth ? (mouth.open[f] ?? false) : false;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: Math.max(4, level * BAR_HEIGHT),
                  borderRadius: 3,
                  backgroundColor: open ? theme.colors.gold : `${theme.colors.muted}88`,
                }}
              />
            );
          })}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: MOUTH_OPEN * BAR_HEIGHT,
              borderTop: `3px dashed ${theme.colors.goldLight}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              bottom: MOUTH_OPEN * BAR_HEIGHT + 8,
              padding: "2px 10px",
              borderRadius: 6,
              backgroundColor: theme.colors.background,
              fontFamily: theme.fonts.mono,
              fontSize: 26,
              color: theme.colors.goldLight,
            }}
          >
            open threshold
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Face state="open" active={isOpen} />
          <Face state="closed" active={!isOpen} />
        </div>
      </div>
    </CardShell>
  );
};
