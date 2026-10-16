import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

type PopProps = {
  /** Frame it pops in. */
  readonly at: number;
  readonly x: number;
  readonly y: number;
  readonly children: React.ReactNode;
  /** Frame a gold "X" strikes through it (optional). */
  readonly crossAt?: number;
  readonly rotate?: number;
};

/** Something that springs into the scene on a word, optionally crossed out on a later word. */
export const Pop: React.FC<PopProps> = ({ at, x, y, children, crossAt, rotate = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const pop = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 220 } });
  const cross = crossAt === undefined ? 0 : interpolate(frame, [crossAt, crossAt + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", scale: `${pop}`, rotate: `${rotate}deg` }}>
      <div style={{ opacity: 1 - cross * 0.45 }}>{children}</div>
      {cross > 0 ? (
        <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: -10, width: "calc(100% + 20px)", height: "calc(100% + 20px)" }}>
          <path d="M 10 10 L 90 90" stroke={theme.colors.gold} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, cross * 2)} />
          <path d="M 90 10 L 10 90" stroke={theme.colors.gold} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, cross * 2 - 1)} />
        </svg>
      ) : null}
    </div>
  );
};

const iconBox: React.CSSProperties = {
  padding: 26,
  borderRadius: 28,
  backgroundColor: `${theme.colors.surface}EE`,
  border: `3px solid ${theme.colors.gold}AA`,
  boxShadow: `0 0 40px ${theme.colors.gold}33`,
};

export const CameraIcon: React.FC = () => (
  <div style={iconBox}>
    <svg viewBox="0 0 120 90" width={180} height={135}>
      <rect x={6} y={20} width={84} height={60} rx={12} fill="none" stroke={theme.colors.text} strokeWidth={7} />
      <path d="M 90 40 L 114 26 L 114 74 L 90 60 Z" fill="none" stroke={theme.colors.text} strokeWidth={7} strokeLinejoin="round" />
      <circle cx={30} cy={12} r={9} fill="none" stroke={theme.colors.text} strokeWidth={6} />
      <circle cx={60} cy={12} r={9} fill="none" stroke={theme.colors.text} strokeWidth={6} />
    </svg>
  </div>
);

export const TimelineIcon: React.FC = () => (
  <div style={iconBox}>
    <svg viewBox="0 0 120 90" width={180} height={135}>
      <rect x={4} y={8} width={112} height={74} rx={10} fill="none" stroke={theme.colors.text} strokeWidth={6} />
      <rect x={14} y={22} width={46} height={14} rx={4} fill={theme.colors.muted} />
      <rect x={64} y={22} width={40} height={14} rx={4} fill={theme.colors.muted} />
      <rect x={14} y={44} width={30} height={14} rx={4} fill={theme.colors.muted} />
      <rect x={48} y={44} width={56} height={14} rx={4} fill={theme.colors.muted} />
      <path d="M 52 14 L 52 76" stroke={theme.colors.gold} strokeWidth={5} />
    </svg>
  </div>
);

/** A code chip that flies up out of a point (e.g. the laptop) and drifts away. */
export const FlyingCode: React.FC<{ readonly at: number; readonly fromX: number; readonly fromY: number; readonly toX: number; readonly toY: number; readonly text: string }> = ({
  at,
  fromX,
  fromY,
  toX,
  toY,
  text,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const p = spring({ frame: frame - at, fps, config: { damping: 18, stiffness: 120 } });
  return (
    <div
      style={{
        position: "absolute",
        left: interpolate(p, [0, 1], [fromX, toX]),
        top: interpolate(p, [0, 1], [fromY, toY]),
        translate: "-50% -50%",
        scale: `${interpolate(p, [0, 1], [0.3, 1])}`,
        opacity: Math.min(1, p * 2),
        padding: "14px 24px",
        borderRadius: 14,
        backgroundColor: `${theme.colors.surface}F2`,
        border: `2px solid ${theme.colors.gold}`,
        boxShadow: `0 0 30px ${theme.colors.gold}44`,
        fontFamily: theme.fonts.mono,
        fontSize: 38,
        color: theme.colors.text,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};
