import { CHAPTERS, type Scene } from "../schema";
import { SIDE, TOP_BAR } from "../layout";
import { theme } from "../theme";

type ChapterBarProps = {
  readonly episode: number;
  readonly scenes: Scene[];
  /** Current time in the narration, in ms. */
  readonly timeMs: number;
};

/** "EP 01" label plus a progress bar per chapter (HOOK → NEXT). */
export const ChapterBar: React.FC<ChapterBarProps> = ({ episode, scenes, timeMs }) => {
  const ranges = CHAPTERS.map((chapter) => {
    const own = scenes.filter((s) => s.chapter === chapter);
    return own.length
      ? { chapter, start: Math.min(...own.map((s) => s.startMs)), end: Math.max(...own.map((s) => s.endMs)) }
      : { chapter, start: Infinity, end: Infinity };
  });

  return (
    <div style={{ position: "absolute", top: TOP_BAR.top, left: SIDE, right: SIDE }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <div
          style={{
            fontFamily: theme.fonts.mono,
            fontWeight: 600,
            fontSize: 32,
            color: theme.colors.background,
            background: `linear-gradient(180deg, ${theme.colors.goldLight}, ${theme.colors.gold})`,
            padding: "8px 22px",
            borderRadius: 12,
            boxShadow: `0 0 24px ${theme.colors.gold}55`,
          }}
        >
          EP {String(episode).padStart(2, "0")}
        </div>
        <div style={{ fontFamily: theme.fonts.mono, fontSize: 24, letterSpacing: 3, color: theme.colors.muted }}>
          {theme.brand.name.toUpperCase()}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {ranges.map(({ chapter, start, end }) => {
          const progress = timeMs >= end ? 1 : timeMs <= start ? 0 : (timeMs - start) / (end - start);
          const current = timeMs >= start && timeMs < end;
          return (
            <div key={chapter} style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: theme.fonts.body,
                  fontWeight: 600,
                  fontSize: 15,
                  letterSpacing: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  color: current ? theme.colors.gold : progress === 1 ? theme.colors.text : theme.colors.muted,
                  opacity: current || progress === 1 ? 1 : 0.6,
                  marginBottom: 8,
                }}
              >
                {chapter}
              </div>
              <div style={{ height: 6, borderRadius: 3, backgroundColor: `${theme.colors.muted}40`, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${progress * 100}%`,
                    height: "100%",
                    backgroundColor: theme.colors.gold,
                    boxShadow: current ? `0 0 12px ${theme.colors.gold}` : undefined,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
