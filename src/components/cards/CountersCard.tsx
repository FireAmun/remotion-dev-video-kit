import { Easing, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";
import { CardShell } from "../CardShell";
import { Sfx } from "../Sfx";

type CountersCardProps = {
  readonly items: { readonly value: number; readonly prefix: string; readonly suffix: string; readonly label: string }[];
};

const START = 6;
const TICKS = 4;

/** Numbers that count up from zero, with ticks while counting. */
export const CountersCard: React.FC<CountersCardProps> = ({ items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = Math.round(1.1 * fps);

  return (
    <CardShell style={{ display: "flex", justifyContent: "space-around", gap: 24 }}>
      {Array.from({ length: TICKS }, (_, i) => (
        <Sequence key={i} from={START + Math.round((i * duration) / TICKS)} durationInFrames={fps} layout="none">
          <Sfx name="tick" />
        </Sequence>
      ))}
      {items.map((item) => {
        const progress = interpolate(frame, [START, START + duration], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        const decimals = Number.isInteger(item.value) ? 0 : 1;
        return (
          <div key={item.label} style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: theme.fonts.heading,
                fontWeight: 800,
                fontSize: 190,
                lineHeight: 1,
                color: theme.colors.gold,
                textShadow: `0 0 36px ${theme.colors.gold}55`,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              {item.prefix}
              {(item.value * progress).toFixed(decimals)}
              {item.suffix}
            </div>
            <div style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: 52, color: theme.colors.text, marginTop: 10 }}>
              {item.label}
            </div>
          </div>
        );
      })}
    </CardShell>
  );
};
