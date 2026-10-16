import { theme } from "../../theme";
import { CardShell, DecoCorners } from "../CardShell";
import { FollowButton } from "./FollowCard";

type EndCardProps = {
  readonly url: string;
  readonly cta: string;
};

/** Closing card: website, call to action, follow button, framed with art-deco gold corners. */
export const EndCard: React.FC<EndCardProps> = ({ url, cta }) => {
  return (
    <CardShell sound="pop" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "64px 52px" }}>
      <DecoCorners />
      <div style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: 54, color: theme.colors.text }}>{cta}</div>
      <div
        style={{
          fontFamily: theme.fonts.heading,
          fontWeight: 800,
          fontSize: 96,
          color: theme.colors.gold,
          textShadow: `0 0 40px ${theme.colors.gold}55`,
        }}
      >
        {url}
      </div>
      <FollowButton pressAt={30} />
    </CardShell>
  );
};
