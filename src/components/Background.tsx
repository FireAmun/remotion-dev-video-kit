import { AbsoluteFill } from "remotion";
import { theme } from "../theme";

/** Brand background: near-black with a faint gold dot grid and a soft vignette. */
export const Background: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${theme.colors.gold}1A 2px, transparent 2.5px)`,
          backgroundSize: "48px 48px",
          backgroundPosition: "24px 24px",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 40%, transparent 35%, ${theme.colors.background} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
