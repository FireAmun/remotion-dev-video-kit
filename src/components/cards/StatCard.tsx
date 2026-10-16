import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";
import { CardShell } from "../CardShell";

type StatCardProps = {
  readonly items: { readonly value: string; readonly label: string }[];
};

/** Big-number hook: one to three stats that pop in one after another. */
export const StatCard: React.FC<StatCardProps> = ({ items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <CardShell style={{ display: "flex", justifyContent: "space-around", alignItems: "center", gap: 24 }}>
      {items.map((item, i) => {
        const pop = spring({ frame: frame - 4 - i * 8, fps, config: { damping: 12, stiffness: 200 } });
        return (
          <div key={item.label} style={{ textAlign: "center", scale: `${pop}`, opacity: Math.min(1, pop * 2) }}>
            <div
              style={{
                fontFamily: theme.fonts.heading,
                fontWeight: 800,
                fontSize: 240,
                lineHeight: 1,
                color: theme.colors.gold,
                textShadow: `0 0 40px ${theme.colors.gold}55`,
              }}
            >
              {item.value}
            </div>
            <div style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: 54, color: theme.colors.text, marginTop: 8 }}>
              {item.label}
            </div>
          </div>
        );
      })}
    </CardShell>
  );
};
