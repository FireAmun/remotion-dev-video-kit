import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";
import { CardShell } from "../CardShell";

type FollowCardProps = {
  readonly text: string;
};

/** Gold follow button, used for the early follow prompt and on the end card. */
export const FollowButton: React.FC<{ readonly pressAt?: number }> = ({ pressAt = 18 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const press = spring({ frame: frame - pressAt, fps, config: { damping: 10, stiffness: 300 } });
  const pressed = frame >= pressAt;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: "22px 56px",
        borderRadius: 999,
        fontFamily: theme.fonts.heading,
        fontWeight: 700,
        fontSize: 62,
        color: pressed ? theme.colors.gold : theme.colors.background,
        background: pressed
          ? "transparent"
          : `linear-gradient(180deg, ${theme.colors.goldLight}, ${theme.colors.gold} 55%, ${theme.colors.goldDark})`,
        border: `3px solid ${theme.colors.gold}`,
        boxShadow: `0 0 36px ${theme.colors.gold}55`,
        scale: `${interpolate(press, [0, 0.5, 1], [1, 0.9, 1])}`,
      }}
    >
      {pressed ? "✓ Following" : "+ Follow"}
    </div>
  );
};

export const FollowCard: React.FC<FollowCardProps> = ({ text }) => {
  return (
    <CardShell sound="pop" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
      <FollowButton />
      <div style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: 54, color: theme.colors.text, textAlign: "center" }}>
        {text}
      </div>
      <div style={{ fontFamily: theme.fonts.mono, fontSize: 40, color: theme.colors.muted }}>{theme.brand.handle}</div>
    </CardShell>
  );
};
