import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import { useMemo } from "react";
import { spring, useVideoConfig } from "remotion";
import { CAPTIONS, SIDE } from "../layout";
import { theme } from "../theme";

type WordCaptionsProps = {
  readonly captions: Caption[];
  /** Words drawn in gold; at most one per caption line. */
  readonly keywords: string[];
  /** Current time in the narration, in ms. */
  readonly timeMs: number;
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Word-by-word captions: spoken words bright, upcoming words dim, one gold keyword per line. */
export const WordCaptions: React.FC<WordCaptionsProps> = ({ captions, keywords, timeMs }) => {
  const { fps } = useVideoConfig();
  const pages = useMemo(
    () => createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 800 }).pages,
    [captions],
  );
  const keys = useMemo(() => new Set(keywords.map(norm)), [keywords]);

  const page = pages.find((p) => timeMs >= p.startMs && timeMs < p.startMs + p.durationMs);
  if (!page) {
    return null;
  }
  const goldIndex = page.tokens.findIndex((t) => keys.has(norm(t.text)));
  const pop = spring({ frame: ((timeMs - page.startMs) / 1000) * fps, fps, config: { damping: 15, stiffness: 220 } });

  return (
    <div
      style={{
        position: "absolute",
        top: CAPTIONS.top,
        left: SIDE,
        right: SIDE,
        textAlign: "center",
        fontFamily: theme.fonts.heading,
        fontWeight: 800,
        fontSize: 72,
        lineHeight: 1.15,
        scale: `${0.92 + pop * 0.08}`,
      }}
    >
      {page.tokens.map((token, i) => {
        const spoken = timeMs >= token.fromMs;
        const current = spoken && timeMs < token.toMs;
        const gold = i === goldIndex;
        return (
          <span
            key={`${token.fromMs}-${i}`}
            style={{
              whiteSpace: "pre-wrap",
              color: gold ? theme.colors.gold : spoken ? theme.colors.text : theme.colors.muted,
              opacity: spoken ? 1 : 0.45,
              textShadow: spoken
                ? `0 4px 18px ${theme.colors.background}, 0 0 ${current ? 24 : 0}px ${gold ? theme.colors.gold : theme.colors.text}55`
                : `0 4px 18px ${theme.colors.background}`,
            }}
          >
            {token.text}
          </span>
        );
      })}
    </div>
  );
};
