import { AbsoluteFill, interpolate, interpolateColors, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { theme } from "../theme";

const s = theme.set;
export const FLOOR_Y = 1440;

export const SET_NAMES = ["stage", "coderoom", "desk", "sky", "chalkboard", "library", "blueprint", "plain"] as const;
export type SetName = (typeof SET_NAMES)[number];

const Floor: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: FLOOR_Y,
      bottom: 0,
      background: `linear-gradient(180deg, ${s.floor}, ${theme.colors.background})`,
      borderTop: `3px solid ${theme.colors.gold}66`,
    }}
  />
);

const Curtain: React.FC<{ readonly side: "left" | "right" }> = ({ side }) => (
  <svg
    viewBox="0 0 220 1500"
    width={220}
    height={1500}
    style={{ position: "absolute", top: 0, [side]: 0, scale: side === "right" ? "-1 1" : undefined }}
  >
    <path d="M 0 0 L 220 0 Q 150 500 190 1500 L 0 1500 Z" fill={s.curtain} />
    {[40, 95, 150].map((x) => (
      <path key={x} d={`M ${x} 0 Q ${x - 25} 700 ${x + 10} 1500`} stroke={s.curtainShade} strokeWidth={22} fill="none" />
    ))}
    <path d="M 220 0 Q 150 500 190 1500" stroke={theme.colors.gold} strokeOpacity={0.7} strokeWidth={6} fill="none" />
  </svg>
);

/** Theatre stage: curtains, spotlight on the character, gold-edged floor. */
const StageSet: React.FC<{ readonly spotX: number }> = ({ spotX }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, ${s.wallLight}, ${s.wall} 70%)` }}>
    <AbsoluteFill
      style={{
        clipPath: `polygon(${spotX - 90}px 0, ${spotX + 90}px 0, ${spotX + 330}px ${FLOOR_Y + 40}px, ${spotX - 330}px ${FLOOR_Y + 40}px)`,
        backgroundImage: `linear-gradient(180deg, ${theme.colors.gold}38, ${theme.colors.gold}0A)`,
      }}
    />
    <Floor />
    <div
      style={{
        position: "absolute",
        left: spotX - 330,
        width: 660,
        top: FLOOR_Y - 40,
        height: 110,
        borderRadius: "50%",
        background: `radial-gradient(ellipse, ${theme.colors.gold}40, transparent 70%)`,
      }}
    />
    <Curtain side="left" />
    <Curtain side="right" />
  </AbsoluteFill>
);

// Real lines from this project's source, scrolled on the code-room wall.
const CODE = [
  "const mouth = useMouthTrack(audio, fps);",
  "<Composition id=\"Episode\" fps={30} />",
  "model.transcribe(audio, word_timestamps=True)",
  "const blend = spring({ frame, fps });",
  "python scripts/tts.py narration.txt",
  "episodeSchema.parse(await res.json())",
  "<Sequence from={from} premountFor={fps}>",
  "createTikTokStyleCaptions({ captions })",
];

/** Dim room whose wall is a slow scroll of real code. */
const CodeRoomSet: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: s.wall, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 40, right: 40, top: -200 + ((frame * 0.8) % 120) }}>
        {Array.from({ length: 24 }, (_, i) => (
          <div
            key={i}
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 34,
              lineHeight: "60px",
              whiteSpace: "nowrap",
              color: theme.colors.gold,
              opacity: 0.09 + (i % 3) * 0.02,
              paddingLeft: (i * 37) % 160,
            }}
          >
            {CODE[i % CODE.length]}
          </div>
        ))}
      </div>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 55%, transparent 20%, ${s.wall} 75%)` }} />
      <Floor />
    </AbsoluteFill>
  );
};

/** Night office: window with a gold-lit skyline, wall, and a desk with a glowing monitor in front. */
const DeskBack: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: s.wall }}>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 300,
          width: 520,
          height: 560,
          borderRadius: 12,
          border: `10px solid ${s.floorLine}`,
          background: `linear-gradient(180deg, ${s.nightSky}, ${s.wall})`,
          overflow: "hidden",
        }}
      >
        {Array.from({ length: 9 }, (_, i) => {
          const h = 160 + random(`b${i}`) * 260;
          return (
            <div
              key={i}
              style={{ position: "absolute", bottom: 0, left: i * 60 - 10, width: 56, height: h, backgroundColor: s.building }}
            >
              {Array.from({ length: Math.floor(h / 40) }, (_, j) =>
                random(`w${i}-${j}`) > 0.55 ? (
                  <div
                    key={j}
                    style={{
                      position: "absolute",
                      left: 10 + (j % 2) * 22,
                      top: 14 + j * 34,
                      width: 12,
                      height: 16,
                      backgroundColor: theme.colors.gold,
                      opacity: 0.35 + 0.3 * Math.abs(Math.sin((frame + i * 13 + j * 7) / 40)),
                    }}
                  />
                ) : null,
              )}
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 255, top: 0, bottom: 0, width: 10, backgroundColor: s.floorLine }} />
      </div>
      <Floor />
    </AbsoluteFill>
  );
};

const DeskFront: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {/* Monitor on the desk, right side. */}
      <div
        style={{
          position: "absolute",
          left: 690,
          top: 1010,
          width: 330,
          height: 210,
          borderRadius: 14,
          backgroundColor: s.screen,
          border: `8px solid ${s.device}`,
          boxShadow: `0 0 60px ${theme.colors.gold}33`,
          padding: 16,
          overflow: "hidden",
        }}
      >
        {[0.8, 0.55, 0.7, 0.4, 0.62].map((w, i) => (
          <div
            key={i}
            style={{
              height: 14,
              width: `${w * 100}%`,
              marginBottom: 14,
              borderRadius: 7,
              backgroundColor: i === Math.floor(frame / 12) % 5 ? theme.colors.gold : `${theme.colors.muted}66`,
            }}
          />
        ))}
      </div>
      <div style={{ position: "absolute", left: 830, top: 1222, width: 50, height: 30, backgroundColor: s.device }} />
      {/* Desk top and front. */}
      <div
        style={{
          position: "absolute",
          left: -20,
          right: -20,
          top: 1250,
          height: 40,
          borderRadius: 10,
          backgroundColor: s.deskTop,
          borderBottom: `4px solid ${theme.colors.goldDark}`,
        }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1290, height: 200, background: `linear-gradient(180deg, ${s.woodDark}, ${s.floor})` }} />
    </AbsoluteFill>
  );
};

/** Sky time-lapse: day and night cycle, sun and moon arcs, dark hills. */
const SkySet: React.FC<{ readonly variant: string }> = ({ variant }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  // 0 = night, 1 = day.
  const day =
    variant === "sunrise"
      ? interpolate(frame, [0, durationInFrames * 0.8], [0, 1], { extrapolateRight: "clamp" })
      : 0.5 + 0.5 * Math.sin((frame / (1.4 * fps)) * Math.PI * 2);
  const sky = `linear-gradient(180deg, ${interpolateColors(day, [0, 1], [s.skyNight[0], s.skyDay[0]])}, ${interpolateColors(day, [0, 1], [s.skyNight[1], s.skyDay[1]])})`;
  const angle = variant === "sunrise" ? interpolate(day, [0, 1], [Math.PI, Math.PI * 0.6]) : (frame / (1.4 * fps)) * Math.PI * 2;
  return (
    <AbsoluteFill style={{ background: sky }}>
      {Array.from({ length: 40 }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: random(`sx${i}`) * 1080,
            top: random(`sy${i}`) * 900,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.colors.text,
            opacity: (1 - day) * (0.4 + 0.6 * random(`so${i}`)),
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: 540 + Math.cos(angle) * 380 - 60,
          top: 820 - Math.sin(angle) * 520 - 60,
          width: 120,
          height: 120,
          borderRadius: "50%",
          backgroundColor: day > 0.5 ? theme.colors.goldLight : theme.colors.text,
          boxShadow: `0 0 80px ${day > 0.5 ? theme.colors.gold : theme.colors.text}88`,
        }}
      />
      <svg viewBox="0 0 1080 700" width={1080} height={700} style={{ position: "absolute", top: 1000 }}>
        <path d="M 0 260 Q 260 120 520 240 T 1080 200 L 1080 700 L 0 700 Z" fill={s.hillFar} />
        <path d="M 0 360 Q 300 250 640 350 T 1080 330 L 1080 700 L 0 700 Z" fill={s.hillNear} />
      </svg>
      <Floor />
    </AbsoluteFill>
  );
};

/** Classroom wall with a dark chalkboard on the left (items write on it). */
const ChalkboardSet: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: s.wallLight }}>
    <div
      style={{
        position: "absolute",
        left: 50,
        top: 290,
        width: 640,
        height: 760,
        borderRadius: 10,
        backgroundColor: s.board,
        border: `16px solid ${s.wood}`,
        boxShadow: `inset 0 0 80px ${theme.colors.background}AA`,
      }}
    />
    <div style={{ position: "absolute", left: 120, top: 1060, width: 120, height: 14, borderRadius: 4, backgroundColor: theme.colors.text, opacity: 0.8 }} />
    <Floor />
  </AbsoluteFill>
);

const BOOK_COLORS = s.books;

/** Dark library: two shelves of books. "book" items pop out of the top shelf. */
const LibrarySet: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: s.wall }}>
    {[330, 760].map((top, row) => (
      <div key={top} style={{ position: "absolute", left: 30, right: 30, top, height: 380 }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 26, backgroundColor: s.wood, borderTop: `3px solid ${theme.colors.goldDark}` }} />
        <div style={{ position: "absolute", left: 10, right: 10, bottom: 26, display: "flex", alignItems: "flex-end", gap: 6 }}>
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              style={{
                width: 50 + random(`bw${row}-${i}`) * 20,
                height: 250 + random(`bh${row}-${i}`) * 90,
                borderRadius: "6px 6px 2px 2px",
                backgroundColor: BOOK_COLORS[Math.floor(random(`bc${row}-${i}`) * BOOK_COLORS.length)],
                borderTop: `6px solid ${theme.colors.goldDark}66`,
              }}
            />
          ))}
        </div>
      </div>
    ))}
    <Floor />
  </AbsoluteFill>
);

/** Blueprint: a technical drawing in gold on deep navy - fine and major grid, dimension marks, title block. */
const BlueprintSet: React.FC = () => {
  const frame = useCurrentFrame();
  const line = (alphaHex: string) => `${theme.colors.gold}${alphaHex}`;
  const draw = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${s.blueprint}, ${s.blueprintDeep} 80%)` }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${line("14")} 1px, transparent 1px), linear-gradient(90deg, ${line("14")} 1px, transparent 1px), linear-gradient(${line("30")} 2px, transparent 2px), linear-gradient(90deg, ${line("30")} 2px, transparent 2px)`,
          backgroundSize: "40px 40px, 40px 40px, 200px 200px, 200px 200px",
          backgroundPosition: "20px 20px, 20px 20px, 20px 20px, 20px 20px",
        }}
      />
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g stroke={theme.colors.gold} strokeOpacity={0.55} strokeWidth={2} fill="none" strokeDasharray="1" pathLength={1} strokeDashoffset={1 - draw}>
          <circle cx={880} cy={1160} r={110} pathLength={1} />
          <path d="M 770 1160 L 990 1160 M 880 1050 L 880 1270" pathLength={1} />
          <path d="M 90 1330 L 520 1330" pathLength={1} />
        </g>
        <g fill={theme.colors.gold} fillOpacity={0.6} fontFamily={theme.fonts.mono} fontSize={22}>
          <text x={96} y={1318}>430 mm</text>
          <text x={836} y={1040}>R 110</text>
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 1350,
          padding: "10px 18px",
          border: `2px solid ${line("88")}`,
          fontFamily: theme.fonts.mono,
          fontSize: 22,
          lineHeight: 1.5,
          color: `${theme.colors.gold}CC`,
          letterSpacing: 2,
        }}
      >
        {theme.brand.name.toUpperCase()}
        <br />
        SHEET / HOW IT WORKS
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR_Y, height: 3, backgroundColor: `${theme.colors.gold}55` }} />
    </AbsoluteFill>
  );
};

type SetProps = { readonly name: SetName; readonly variant?: string; readonly spotX?: number };

/** Background layer of a set (drawn behind the character). */
export const SetBack: React.FC<SetProps> = ({ name, variant = "", spotX = 540 }) => {
  switch (name) {
    case "stage":
      return <StageSet spotX={spotX} />;
    case "coderoom":
      return <CodeRoomSet />;
    case "desk":
      return <DeskBack />;
    case "sky":
      return <SkySet variant={variant} />;
    case "chalkboard":
      return <ChalkboardSet />;
    case "library":
      return <LibrarySet />;
    case "blueprint":
      return <BlueprintSet />;
    case "plain":
      return <Background />;
  }
};

/** Foreground layer of a set (drawn in front of the character), if it has one. */
export const SetFront: React.FC<SetProps> = ({ name }) => (name === "desk" ? <DeskFront /> : null);
