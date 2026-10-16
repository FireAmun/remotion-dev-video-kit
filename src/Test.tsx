import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "./theme";

type TestProps = {
  readonly title: string;
};

export const Test: React.FC<TestProps> = ({ title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.colors.background,
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <Interactive.Div
        name="Title"
        premountFor={fps}
        style={{
          color: theme.colors.gold,
          fontFamily: theme.fonts.heading,
          fontSize: 120,
          fontWeight: 700,
          lineHeight: 1.1,
          textAlign: "center",
          opacity: interpolate(frame, [0, 1 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [0, 1 * fps], ["0px 40px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {title}
      </Interactive.Div>
    </AbsoluteFill>
  );
};
