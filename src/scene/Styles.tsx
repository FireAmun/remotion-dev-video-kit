import { AbsoluteFill, Sequence, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../components/Sfx";
import { theme } from "../theme";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Ambient gold dust drifting up through a scene (particles style). Deterministic, so renders are identical. */
export const GoldDust: React.FC<{ readonly count?: number }> = ({ count = 36 }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const speed = 18 + random(`ds${i}`) * 40; // px per second upward
        const y = (random(`dy${i}`) * height - (frame / fps) * speed) % height;
        const x = random(`dx${i}`) * width + Math.sin(frame / (40 + i) + i) * 18;
        const size = 2 + random(`dz${i}`) * 5;
        const twinkle = 0.25 + 0.75 * Math.abs(Math.sin(frame / (12 + (i % 9)) + i));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y < 0 ? y + height : y,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: i % 4 === 0 ? theme.colors.goldLight : theme.colors.gold,
              boxShadow: `0 0 ${size * 3}px ${theme.colors.gold}`,
              opacity: 0.18 + 0.4 * twinkle * (size / 7),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Kinetic type: big words slam in one after another; highlighted words are gold. */
export const KineticText: React.FC<{ readonly text: string; readonly highlight: string[]; readonly stagger: number; readonly size: number }> = ({
  text,
  highlight,
  stagger,
  size,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const keys = new Set(highlight.map(norm));
  const words = text.split(/\s+/);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `${size * 0.12}px ${size * 0.28}px` }}>
      {words.map((w, i) => {
        const at = i * stagger;
        const p = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 240 } });
        const gold = keys.has(norm(w));
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily: theme.fonts.heading,
              fontWeight: 800,
              fontSize: size,
              lineHeight: 1.05,
              color: gold ? theme.colors.gold : theme.colors.text,
              textShadow: gold ? `0 0 40px ${theme.colors.gold}88` : `0 6px 24px ${theme.colors.background}`,
              opacity: frame < at ? 0 : Math.min(1, p * 1.6),
              scale: `${interpolate(p, [0, 1], [1.8, 1])}`,
              translate: `0px ${interpolate(p, [0, 1], [-40, 0])}px`,
              rotate: `${interpolate(p, [0, 1], [(random(`kr${i}`) - 0.5) * 16, 0])}deg`,
            }}
          >
            <Sequence from={at} durationInFrames={fps} layout="none">
              <Sfx name="tick" />
            </Sequence>
            {w}
          </span>
        );
      })}
    </div>
  );
};

const FLAP_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ%#+";

/** Split-flap (airport board) display: each tile rattles through characters, then lands, left to right. */
export const SplitFlap: React.FC<{ readonly text: string; readonly label?: string; readonly size: number }> = ({ text, label, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chars = text.toUpperCase().split("");
  const tileW = size * 0.72;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: size * 0.18 }}>
      <div style={{ display: "flex", gap: size * 0.08 }}>
        {chars.map((target, i) => {
          const land = 10 + i * 7; // frame this tile settles
          const spinning = frame < land;
          const step = Math.floor(frame / 2);
          const shown = target === " " ? " " : spinning ? FLAP_CHARS[(step * 7 + i * 13) % FLAP_CHARS.length] : target;
          const flip = spinning ? 0.35 + 0.65 * Math.abs(Math.cos((frame / 2) * Math.PI)) : interpolate(frame, [land, land + 4], [0.6, 1], { extrapolateRight: "clamp" });
          return (
            <div
              key={i}
              style={{
                position: "relative",
                width: tileW,
                height: size * 1.15,
                borderRadius: size * 0.08,
                background: `linear-gradient(180deg, ${theme.colors.surface} 49.5%, ${theme.colors.background} 50.5%)`,
                border: `2px solid ${theme.colors.gold}66`,
                boxShadow: `0 10px 30px ${theme.colors.background}, inset 0 1px 0 ${theme.set.shine}1F`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Sequence from={land} durationInFrames={fps} layout="none">
                <Sfx name="tick" />
              </Sequence>
              <span
                style={{
                  fontFamily: theme.fonts.mono,
                  fontWeight: 600,
                  fontSize: size,
                  color: spinning ? theme.colors.text : theme.colors.gold,
                  textShadow: spinning ? undefined : `0 0 24px ${theme.colors.gold}88`,
                  scale: `1 ${flip}`,
                }}
              >
                {shown}
              </span>
              <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 3, backgroundColor: theme.colors.background }} />
            </div>
          );
        })}
      </div>
      {label ? (
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 600,
            fontSize: size * 0.32,
            color: theme.colors.text,
            opacity: interpolate(frame, [10 + chars.length * 7, 16 + chars.length * 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};
