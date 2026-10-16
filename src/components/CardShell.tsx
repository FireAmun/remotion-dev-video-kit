import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Sfx, type SfxName } from "./Sfx";

type CardShellProps = {
  readonly children: React.ReactNode;
  readonly sound?: SfxName | null;
  readonly style?: React.CSSProperties;
};

/**
 * Frosted-glass card (glassmorphism): blurred, see-through dark glass, thin gold rim,
 * a soft top highlight and a slow diagonal sheen. Springs in from below at its frame 0.
 */
export const CardShell: React.FC<CardShellProps> = ({ children, sound = "click", style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 160 } });
  const sheen = ((frame * 1.2) % 260) - 80; // % across the card

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(140deg, ${theme.colors.surface}B3, ${theme.colors.surface}73 55%, ${theme.colors.background}99)`,
        backdropFilter: "blur(16px) saturate(140%)",
        border: `2px solid ${theme.colors.gold}80`,
        borderRadius: 32,
        boxShadow: `0 0 40px ${theme.colors.gold}26, 0 24px 60px ${theme.colors.background}AA, inset 0 1px 0 ${theme.set.shine}2E`,
        padding: "44px 52px",
        opacity: Math.min(1, enter * 1.5),
        translate: `0px ${(1 - enter) * 60}px`,
        scale: `${0.94 + enter * 0.06}`,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${sheen}%`,
          width: "35%",
          background: `linear-gradient(100deg, transparent, ${theme.set.shine}0F, transparent)`,
          pointerEvents: "none",
        }}
      />
      {sound ? <Sfx name={sound} /> : null}
      {children}
    </div>
  );
};

/** Art-deco gold corner ornaments (stepped lines + fan), laid over a card. */
export const DecoCorners: React.FC<{ readonly size?: number }> = ({ size = 90 }) => {
  const corner = (rotate: number, pos: React.CSSProperties) => (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: "absolute", rotate: `${rotate}deg`, ...pos }}>
      <g fill="none" stroke={theme.colors.gold} strokeWidth={3} strokeLinecap="round">
        <path d="M 8 92 L 8 8 L 92 8" />
        <path d="M 18 92 L 18 18 L 92 18" opacity={0.7} />
        <path d="M 28 70 L 28 28 L 70 28" opacity={0.45} />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M 8 8 L ${40 - i * 2} ${8 + i * 10}`} opacity={0.6} />
        ))}
      </g>
      <circle cx={8} cy={8} r={5} fill={theme.colors.goldLight} />
    </svg>
  );
  return (
    <>
      {corner(0, { left: 10, top: 10 })}
      {corner(90, { right: 10, top: 10 })}
      {corner(180, { right: 10, bottom: 10 })}
      {corner(270, { left: 10, bottom: 10 })}
    </>
  );
};
