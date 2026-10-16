import { theme } from "../theme";

// Props drawn upright in world space, with the hand's grip at (0, 0).

const o = { stroke: theme.character.outline, strokeWidth: 5, strokeLinejoin: "round" as const };

export type PropName = "magnifier" | "phone" | "trophy";

export const HandProp: React.FC<{ readonly name: PropName }> = ({ name }) => {
  switch (name) {
    case "magnifier":
      return (
        <g transform="rotate(-35)">
          <rect x={-10} y={-20} width={20} height={70} rx={8} fill={theme.colors.goldDark} {...o} />
          <circle cx={0} cy={-80} r={62} fill={`${theme.colors.goldLight}33`} stroke={theme.colors.gold} strokeWidth={14} />
          <circle cx={0} cy={-80} r={62} fill="none" {...o} strokeWidth={4} />
          <path d="M -30 -110 Q -10 -128 14 -124" stroke={theme.set.shine} strokeOpacity={0.7} strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>
      );
    case "phone":
      return (
        <g transform="translate(-36 -110)">
          <rect x={0} y={0} width={72} height={130} rx={14} fill={theme.colors.surface} {...o} />
          <rect x={8} y={14} width={56} height={98} rx={6} fill={theme.colors.gold} opacity={0.85} />
        </g>
      );
    case "trophy":
      return (
        <g transform="translate(0 -40)">
          <path d="M -50 -110 L 50 -110 Q 46 -40 0 -30 Q -46 -40 -50 -110 Z" fill={theme.colors.gold} {...o} />
          <path d="M -50 -96 Q -82 -92 -70 -66 Q -62 -52 -44 -56" fill="none" {...o} strokeWidth={8} stroke={theme.colors.gold} />
          <path d="M 50 -96 Q 82 -92 70 -66 Q 62 -52 44 -56" fill="none" {...o} strokeWidth={8} stroke={theme.colors.gold} />
          <rect x={-10} y={-32} width={20} height={26} fill={theme.colors.goldDark} {...o} />
          <rect x={-36} y={-8} width={72} height={20} rx={4} fill={theme.colors.goldDark} {...o} />
        </g>
      );
  }
};

/** Laptop held in front of the chest, lid towards the viewer, gold </> logo. */
export const LaptopProp: React.FC<{ readonly glow?: number }> = ({ glow = 0 }) => (
  <g transform="translate(0 520)">
    {glow > 0 ? <ellipse cx={0} cy={-70} rx={170} ry={120} fill={theme.colors.gold} opacity={0.12 * glow} /> : null}
    <rect x={-150} y={-120} width={300} height={190} rx={16} fill={theme.set.device} {...o} />
    <rect x={-140} y={-110} width={280} height={170} rx={10} fill={theme.set.deviceLight} />
    <text
      x={0}
      y={-2}
      textAnchor="middle"
      fontFamily={theme.fonts.mono}
      fontWeight={700}
      fontSize={64}
      fill={theme.colors.gold}
    >
      {"</>"}
    </text>
    <rect x={-170} y={66} width={340} height={22} rx={8} fill={theme.set.deviceEdge} {...o} />
  </g>
);
