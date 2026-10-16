import { Easing, Sequence, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CountersCard } from "../components/cards/CountersCard";
import { EndCard } from "../components/cards/EndCard";
import { FollowButton } from "../components/cards/FollowCard";
import { StampCard } from "../components/cards/StampCard";
import { StepsCard } from "../components/cards/StepsCard";
import { TerminalCard } from "../components/cards/TerminalCard";
import { WaveformCard } from "../components/cards/WaveformCard";
import { Sfx } from "../components/Sfx";
import type { Item } from "../schema";
import { CameraIcon, FlyingCode, Pop, TimelineIcon } from "../sets/Popups";
import { theme } from "../theme";
import { KineticText, SplitFlap } from "./Styles";

const EXIT = 6;

/** Gold sticker label, like a sign-post for the sentence. */
const Label: React.FC<{ readonly text: string; readonly tone: "gold" | "light" }> = ({ text, tone }) => (
  <div
    style={{
      padding: "16px 34px",
      borderRadius: 16,
      fontFamily: theme.fonts.heading,
      fontWeight: 800,
      fontSize: 54,
      whiteSpace: "nowrap",
      color: tone === "gold" ? theme.colors.background : theme.colors.gold,
      background: tone === "gold" ? `linear-gradient(180deg, ${theme.colors.goldLight}, ${theme.colors.gold})` : `${theme.colors.surface}F2`,
      border: `3px solid ${tone === "gold" ? theme.colors.goldDark : theme.colors.gold}`,
      boxShadow: `6px 8px 0 ${theme.colors.background}, 0 0 40px ${theme.colors.gold}44`,
    }}
  >
    {text}
  </div>
);

/** Desk calendar that flips from one number to another over the item's life. */
const Calendar: React.FC<{ readonly from: number; readonly to: number; readonly durationInFrames: number }> = ({ from, to, durationInFrames }) => {
  const frame = useCurrentFrame();
  const steps = Math.max(1, to - from);
  const every = Math.max(6, Math.floor((durationInFrames - 10) / (steps + 1)));
  const n = Math.min(to, from + Math.floor(frame / every));
  const local = frame % every;
  const flip = n < to ? interpolate(local, [every - 5, every], [1, 0.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return (
    <div style={{ width: 230, borderRadius: 22, overflow: "hidden", border: `4px solid ${theme.colors.gold}`, boxShadow: `0 0 40px ${theme.colors.gold}44` }}>
      {Array.from({ length: steps }, (_, i) => (
        <Sequence key={i} from={(i + 1) * every} durationInFrames={20} layout="none">
          <Sfx name="tick" />
        </Sequence>
      ))}
      <div style={{ height: 56, background: `linear-gradient(180deg, ${theme.colors.goldLight}, ${theme.colors.gold})`, textAlign: "center", fontFamily: theme.fonts.mono, fontWeight: 600, fontSize: 30, lineHeight: "56px", color: theme.colors.background }}>
        DAY
      </div>
      <div
        style={{
          height: 190,
          backgroundColor: theme.colors.text,
          textAlign: "center",
          fontFamily: theme.fonts.heading,
          fontWeight: 800,
          fontSize: 150,
          lineHeight: "190px",
          color: theme.colors.background,
          scale: `1 ${flip}`,
        }}
      >
        {n}
      </div>
    </div>
  );
};

/** "Achievement unlocked" style banner with a light sweep. */
const Banner: React.FC<{ readonly title: string; readonly text: string }> = ({ title, text }) => {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame, [8, 30], [-40, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "22px 40px",
        borderRadius: 18,
        backgroundColor: theme.colors.background,
        border: `4px solid ${theme.colors.gold}`,
        boxShadow: `0 0 50px ${theme.colors.gold}55`,
        textAlign: "center",
      }}
    >
      <div style={{ fontFamily: theme.fonts.mono, fontWeight: 600, fontSize: 26, letterSpacing: 6, color: theme.colors.gold }}>🏆 {title}</div>
      <div style={{ fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: 64, color: theme.colors.text, whiteSpace: "nowrap" }}>{text}</div>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${sweep}%`,
          width: "30%",
          background: `linear-gradient(90deg, transparent, ${theme.colors.goldLight}55, transparent)`,
          rotate: "15deg",
        }}
      />
    </div>
  );
};

/** Confetti burst from a point, with gravity. */
const Confetti: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const colors = [theme.colors.gold, theme.colors.goldLight, theme.colors.text, theme.colors.goldDark];
  return (
    <div style={{ position: "relative", width: 0, height: 0 }}>
      {Array.from({ length: 70 }, (_, i) => {
        const a = random(`ca${i}`) * Math.PI * 2;
        const v = 500 + random(`cv${i}`) * 900;
        const x = Math.cos(a) * v * t;
        const y = Math.sin(a) * v * t * 0.8 - 700 * t + 1400 * t * t;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 16,
              height: 26,
              borderRadius: 3,
              backgroundColor: colors[i % colors.length],
              rotate: `${random(`cr${i}`) * 360 + frame * (8 + i % 7)}deg`,
              opacity: interpolate(t, [0, 1.6, 2.2], [1, 1, 0], { extrapolateRight: "clamp" }),
            }}
          />
        );
      })}
    </div>
  );
};

/** A labelled book that slides up out of the shelf and tilts. */
const Book: React.FC<{ readonly text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 12, stiffness: 160 } });
  return (
    <div
      style={{
        width: 110,
        height: 380,
        borderRadius: "12px 12px 4px 4px",
        background: `linear-gradient(90deg, ${theme.colors.goldDark}, ${theme.colors.gold} 45%, ${theme.colors.goldDark})`,
        border: `4px solid ${theme.colors.background}`,
        boxShadow: `0 0 40px ${theme.colors.gold}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        translate: `0px ${(1 - p) * 140}px`,
        rotate: `${p * 8}deg`,
      }}
    >
      <div style={{ rotate: "-90deg", whiteSpace: "nowrap", fontFamily: theme.fonts.heading, fontWeight: 800, fontSize: 46, color: theme.colors.background }}>{text}</div>
    </div>
  );
};

/** Lines written onto a chalkboard, one after another. */
const Chalk: React.FC<{ readonly lines: { readonly text: string }[] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  let t = 4;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
      {lines.map((line, i) => {
        const start = t;
        t += Math.ceil(line.text.length / 3) + 4;
        const shown = line.text.slice(0, Math.max(0, Math.floor((frame - start) * 3)));
        return (
          <div key={i} style={{ fontFamily: theme.fonts.mono, fontSize: 58, color: theme.colors.text, opacity: 0.92, textShadow: `0 0 6px ${theme.colors.text}66`, whiteSpace: "nowrap" }}>
            {shown}
          </div>
        );
      })}
    </div>
  );
};

type ItemViewProps = {
  readonly item: Item;
  readonly durationInFrames: number;
  /** Narration track and the absolute frame this item starts at (for the waveform). */
  readonly audio: string;
  readonly startFrame: number;
};

const renderItem = (item: Item, p: ItemViewProps, fps: number) => {
  switch (item.kind) {
    case "icon":
      return (
        <Pop at={0} x={0} y={0} rotate={item.rotate} crossAt={item.crossAtMs === undefined ? undefined : Math.round((item.crossAtMs / 1000) * fps)}>
          {item.name === "camera" ? <CameraIcon /> : <TimelineIcon />}
        </Pop>
      );
    case "label":
      return (
        <Pop at={0} x={0} y={0} rotate={item.rotate}>
          <Label text={item.text} tone={item.tone} />
        </Pop>
      );
    case "follow":
      return (
        <Pop at={0} x={0} y={0}>
          <FollowButton pressAt={24} />
        </Pop>
      );
    case "calendar":
      return (
        <Pop at={0} x={0} y={0} rotate={item.rotate}>
          <Calendar from={item.from} to={item.to} durationInFrames={p.durationInFrames} />
        </Pop>
      );
    case "banner":
      return (
        <Pop at={0} x={0} y={0}>
          <Banner title={item.title} text={item.text} />
        </Pop>
      );
    case "confetti":
      return <Confetti />;
    case "book":
      return <Book text={item.text} />;
    case "code":
      return item.fromX !== undefined && item.fromY !== undefined ? (
        <FlyingCode at={0} fromX={item.fromX - item.x} fromY={item.fromY - item.y} toX={0} toY={0} text={item.text} />
      ) : (
        <FlyingCode at={0} fromX={0} fromY={40} toX={0} toY={0} text={item.text} />
      );
    case "window":
      return item.style === "chalk" ? <Chalk lines={item.lines} /> : <TerminalCard title={item.title} lines={item.lines} />;
    case "counter":
      return <CountersCard items={[{ value: item.value, prefix: item.prefix, suffix: item.suffix, label: item.label }]} />;
    case "stamp":
      return <StampCard text={item.text} sub={item.sub} />;
    case "steps":
      return <StepsCard items={item.items} />;
    case "waveform":
      return <WaveformCard audio={p.audio} startFrame={p.startFrame} label={item.label} />;
    case "end":
      return <EndCard url={item.url} cta={item.cta} />;
    case "kinetic":
      return <KineticText text={item.text} highlight={item.highlight} stagger={item.stagger} size={item.size} />;
    case "splitflap":
      return <SplitFlap text={item.text} label={item.label} size={item.size} />;
  }
};

// Item kinds whose own component already plays an entrance sound.
const SILENT = new Set<Item["kind"]>(["window", "counter", "stamp", "steps", "waveform", "end", "confetti", "calendar", "kinetic", "splitflap"]);

/** Places a scene item, plays its entrance sound, and fades it out at the end of its life. */
export const ItemView: React.FC<ItemViewProps> = (props) => {
  const { item, durationInFrames } = props;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = interpolate(frame, [durationInFrames - EXIT, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  const anchored = item.kind === "confetti" || item.kind === "code" || item.kind === "icon" || item.kind === "label" || item.kind === "follow" || item.kind === "calendar" || item.kind === "banner";

  return (
    <div
      style={{
        position: "absolute",
        left: item.x,
        top: item.y,
        width: anchored ? 0 : item.width,
        height: anchored ? 0 : undefined,
        translate: anchored ? undefined : "-50% -50%",
        opacity: 1 - exit,
        rotate: anchored || item.kind === "book" ? undefined : `${item.rotate}deg`,
      }}
    >
      {SILENT.has(item.kind) ? null : <Sfx name={item.kind === "code" || item.kind === "book" ? "click" : "pop"} />}
      {renderItem(item, props, fps)}
    </div>
  );
};
