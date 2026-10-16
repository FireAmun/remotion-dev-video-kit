import { useCurrentFrame } from "remotion";
import { theme } from "../../theme";
import { CardShell } from "../CardShell";

type TerminalCardProps = {
  readonly title: string;
  readonly lines: { readonly text: string; readonly kind: "command" | "code" | "output" }[];
};

const CHARS_PER_FRAME = 2; // ~60 characters per second
const START = 8;
const GAP = 4; // frames between lines

/** Terminal window. Commands type out after a gold "$", code types out, output appears whole. */
export const TerminalCard: React.FC<TerminalCardProps> = ({ title, lines }) => {
  const frame = useCurrentFrame();

  let t = START;
  const rendered = lines.map((line) => {
    const start = t;
    const typed = line.kind !== "output";
    const duration = typed ? Math.ceil(line.text.length / CHARS_PER_FRAME) : 1;
    t += duration + GAP;
    const shown = typed
      ? line.text.slice(0, Math.max(0, Math.floor((frame - start) * CHARS_PER_FRAME)))
      : frame >= start
        ? line.text
        : "";
    const typing = frame >= start && frame < start + duration + GAP;
    return { line, shown, visible: frame >= start, typing };
  });
  const cursorOn = Math.floor(frame / 15) % 2 === 0;

  return (
    <CardShell style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "18px 28px",
          borderBottom: `1px solid ${theme.colors.gold}40`,
        }}
      >
        {[theme.colors.gold, theme.colors.goldDark, theme.colors.muted].map((c) => (
          <div key={c} style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: c }} />
        ))}
        <div style={{ marginLeft: 16, fontFamily: theme.fonts.mono, fontSize: 32, color: theme.colors.muted }}>{title}</div>
      </div>
      <div style={{ padding: "34px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
        {rendered.map(({ line, shown, visible, typing }, i) =>
          visible ? (
            <div
              key={i}
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: 46,
                lineHeight: 1.35,
                color: line.kind === "output" ? theme.colors.muted : theme.colors.text,
                wordBreak: "break-word",
              }}
            >
              {line.kind === "command" ? <span style={{ color: theme.colors.gold }}>$ </span> : null}
              {shown}
              {typing && cursorOn ? (
                <span style={{ backgroundColor: theme.colors.gold, color: theme.colors.gold }}>_</span>
              ) : null}
            </div>
          ) : null,
        )}
      </div>
    </CardShell>
  );
};
