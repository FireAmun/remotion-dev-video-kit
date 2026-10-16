import { Img, staticFile } from "remotion";
import { theme } from "../theme";
import type { ArmPose, HandShape, Pose } from "./poses";
import { HandProp, type PropName } from "./props";

// Rig geometry, in puppet units (1 unit = 1 px at scale 1). Feet at y≈1000, centre x=0.
export const PUPPET = { width: 660, height: 1010, left: -330, top: 0 } as const;
const HIP_Y = 655;
const NECK = { x: 0, y: 352 };
const SHOULDER = { x: 132, y: 398 };
const UPPER_ARM = 150;
const FOREARM = 150;

// Head art (public/character/rig/head_*.png) and where its neck and eyes are.
const HEAD = {
  width: 252,
  height: 316,
  pivot: { x: 152, y: 308 },
  eyes: [
    { cx: 110, cy: 170, w: 48, h: 26 },
    { cx: 183, cy: 168, w: 48, h: 26 },
  ],
};

const c = theme.character;
const STROKE = { stroke: c.outline, strokeWidth: 4, strokeLinejoin: "round" as const };

/** Shared gradients so the vector body has the same soft shading as the head art. */
const Defs: React.FC = () => (
  <defs>
    <linearGradient id="pp-hoodie" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={c.hoodieLight} />
      <stop offset="0.45" stopColor={c.hoodie} />
      <stop offset="1" stopColor={c.hoodieShade} />
    </linearGradient>
    <linearGradient id="pp-sleeve" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor={c.hoodieShade} />
      <stop offset="0.45" stopColor={c.hoodieLight} />
      <stop offset="1" stopColor={c.hoodieShade} />
    </linearGradient>
    <linearGradient id="pp-pants" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor={c.pantsShade} />
      <stop offset="0.45" stopColor={c.pantsLight} />
      <stop offset="1" stopColor={c.pantsShade} />
    </linearGradient>
    <radialGradient id="pp-skin" cx="0.4" cy="0.35" r="0.75">
      <stop offset="0" stopColor={c.skinLight} />
      <stop offset="0.6" stopColor={c.skin} />
      <stop offset="1" stopColor={c.skinShade} />
    </radialGradient>
    <filter id="pp-soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="10" />
    </filter>
  </defs>
);

type PuppetProps = {
  readonly pose: Pose;
  readonly mouthOpen: boolean;
  /** 0 = eyes open, 1 = fully closed. */
  readonly blink: number;
  readonly leftProp?: PropName | null;
  readonly rightProp?: PropName | null;
  /** Prop held in front of the body with both hands (e.g. a laptop). */
  readonly bodyProp?: React.ReactNode;
  /** Extra head nod in degrees, added to the pose's head tilt. */
  readonly headNod?: number;
};

const Hand: React.FC<{ readonly shape: HandShape }> = ({ shape }) => {
  const skin = { fill: "url(#pp-skin)", ...STROKE };
  if (shape === "open") {
    return (
      <g>
        <ellipse cx={-28} cy={16} rx={13} ry={24} transform="rotate(30 -28 16)" {...skin} />
        <ellipse cx={0} cy={30} rx={34} ry={40} {...skin} />
        <path d="M -14 50 L -14 66 M 0 52 L 0 69 M 14 50 L 14 66" stroke={c.skinShade} strokeWidth={4} strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      {shape === "point" ? <rect x={-11} y={40} width={22} height={70} rx={11} {...skin} /> : null}
      {shape === "thumb" ? <rect x={-60} y={10} width={50} height={22} rx={11} {...skin} /> : null}
      <circle cx={0} cy={28} r={34} {...skin} />
      <path d="M -18 46 Q 0 55 18 46" stroke={c.skinShade} strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );
};

/** One arm in right-side coordinates (outward = +x). The left arm is drawn mirrored. */
const Arm: React.FC<{ readonly arm: ArmPose; readonly prop?: PropName | null; readonly mirrored: boolean }> = ({
  arm,
  prop,
  mirrored,
}) => {
  const sum = arm.shoulder + arm.elbow + arm.wrist;
  const sleeve = { fill: "url(#pp-sleeve)", ...STROKE };
  return (
    <g transform={`translate(${SHOULDER.x} ${SHOULDER.y}) rotate(${-arm.shoulder})`}>
      <rect x={-33} y={-26} width={66} height={UPPER_ARM + 40} rx={33} {...sleeve} />
      <g transform={`translate(0 ${UPPER_ARM}) rotate(${-arm.elbow})`}>
        <rect x={-30} y={-22} width={60} height={FOREARM + 22} rx={30} {...sleeve} />
        <rect x={-29} y={FOREARM - 26} width={58} height={22} rx={9} fill={c.hoodieShade} {...STROKE} strokeWidth={4} />
        <g transform={`translate(0 ${FOREARM - 6}) rotate(${-arm.wrist})`}>
          {prop ? (
            // Keep props upright in the world, whatever the arm is doing.
            <g transform={mirrored ? `translate(0 30) rotate(${sum}) scale(-1 1)` : `translate(0 30) rotate(${sum})`}>
              <HandProp name={prop} />
            </g>
          ) : null}
          <Hand shape={arm.hand} />
        </g>
      </g>
    </g>
  );
};

const Leg: React.FC<{ readonly angle: number; readonly side: 1 | -1 }> = ({ angle, side }) => (
  <g transform={`translate(${side * 52} ${HIP_Y}) rotate(${-side * angle})`}>
    <rect x={-40} y={-14} width={80} height={190} rx={34} fill="url(#pp-pants)" {...STROKE} />
    <rect x={-36} y={165} width={72} height={140} rx={28} fill="url(#pp-pants)" {...STROKE} />
    <rect x={-37} y={276} width={74} height={24} rx={10} fill={c.pantsShade} {...STROKE} strokeWidth={4} />
    <path
      d={`M ${-42 * side} 300 Q ${-44 * side} 336 ${-10 * side} 340 L ${52 * side} 340 Q ${66 * side} 336 ${58 * side} 314 Q ${40 * side} 296 ${10 * side} 296 Z`}
      fill={c.shoe}
      {...STROKE}
    />
    <path d={`M ${-40 * side} 326 L ${60 * side} 326`} stroke={c.shoeShade} strokeWidth={5} />
  </g>
);

const Torso: React.FC = () => (
  <g>
    {/* Hood bunched behind the neck, rising either side of the jaw. */}
    <path d="M -160 430 C -172 356 -130 298 -80 284 L 80 284 C 130 298 172 356 160 430 Z" fill={c.hoodieShade} {...STROKE} />
    <path
      d="M -100 350 C -150 356 -168 384 -170 424 L -160 640 Q -158 670 -128 672 L 128 672 Q 158 670 160 640 L 170 424 C 168 384 150 356 100 350 Z"
      fill="url(#pp-hoodie)"
      {...STROKE}
    />
    <ellipse cx={-60} cy={480} rx={60} ry={100} fill={c.hoodieLight} opacity={0.35} filter="url(#pp-soft)" />
    <rect x={-132} y={636} width={264} height={36} rx={14} fill={c.hoodieShade} {...STROKE} />
    <path d="M -86 562 L 86 562 L 100 640 M -86 562 L -100 640" stroke={c.hoodieShade} strokeWidth={6} fill="none" strokeLinecap="round" />
    {/* Front roll of the hood around the neck, with gold trim; the beard sits on top of it. */}
    <path d="M -118 336 Q -96 414 0 436 Q 96 414 118 336" stroke={c.outline} strokeWidth={46} fill="none" />
    <path d="M -118 336 Q -96 414 0 436 Q 96 414 118 336" stroke={c.hoodie} strokeWidth={38} fill="none" />
    <path d="M -100 326 Q -76 404 0 420 Q 76 404 100 326" stroke={theme.colors.gold} strokeWidth={5} fill="none" strokeLinecap="round" />
    {/* Soft shadow where the chin meets the hood. */}
    <ellipse cx={0} cy={372} rx={104} ry={40} fill={c.outline} opacity={0.55} filter="url(#pp-soft)" />
    {/* Drawstrings. */}
    <path d="M -26 436 Q -30 476 -32 510 M 26 436 Q 30 476 32 510" stroke={theme.colors.gold} strokeWidth={7} fill="none" strokeLinecap="round" />
    <rect x={-40} y={504} width={16} height={30} rx={6} fill={theme.colors.goldLight} stroke={c.outline} strokeWidth={3} />
    <rect x={24} y={504} width={16} height={30} rx={6} fill={theme.colors.goldLight} stroke={c.outline} strokeWidth={3} />
  </g>
);

/** Where the neck ends up after the upper body leans around the hips. */
const neckAfterLean = (lean: number) => {
  const r = (lean * Math.PI) / 180;
  const arm = HIP_Y - NECK.y;
  return { x: NECK.x + arm * Math.sin(r), y: HIP_Y - arm * Math.cos(r) };
};

/** The rigged character at one instant. Purely a function of its props. */
export const Puppet: React.FC<PuppetProps> = ({ pose, mouthOpen, blink, leftProp, rightProp, bodyProp, headNod = 0 }) => {
  const upper = `rotate(${pose.lean} 0 ${HIP_Y})`;
  const neck = neckAfterLean(pose.lean);
  const headRotate = pose.lean + pose.headTilt + headNod;
  const viewBox = `${PUPPET.left} ${PUPPET.top} ${PUPPET.width} ${PUPPET.height}`;
  const layer: React.CSSProperties = { position: "absolute", inset: 0, overflow: "visible" };

  return (
    <div style={{ position: "relative", width: PUPPET.width, height: PUPPET.height }}>
      <svg viewBox={viewBox} width={PUPPET.width} height={PUPPET.height} style={layer}>
        <Defs />
        <Leg angle={pose.hipL} side={-1} />
        <Leg angle={pose.hipR} side={1} />
        <g transform={upper}>
          <Torso />
        </g>
      </svg>

      {/* Head: Canva art, both mouth frames mounted, eyelids drawn on top for blinks. */}
      <div
        style={{
          position: "absolute",
          left: neck.x - PUPPET.left - HEAD.pivot.x,
          top: neck.y - PUPPET.top - HEAD.pivot.y,
          width: HEAD.width,
          height: HEAD.height,
          transformOrigin: `${HEAD.pivot.x}px ${HEAD.pivot.y}px`,
          rotate: `${headRotate}deg`,
          filter: `drop-shadow(1.5px 0 0 ${c.outline}) drop-shadow(-1.5px 0 0 ${c.outline}) drop-shadow(0 1.5px 0 ${c.outline}) drop-shadow(0 -1.5px 0 ${c.outline})`,
        }}
      >
        <Img src={staticFile("character/rig/head_closed.png")} style={{ position: "absolute", inset: 0, opacity: mouthOpen ? 0 : 1 }} />
        <Img src={staticFile("character/rig/head_open.png")} style={{ position: "absolute", inset: 0, opacity: mouthOpen ? 1 : 0 }} />
        {blink > 0.02
          ? HEAD.eyes.map((e) => (
              <div
                key={e.cx}
                style={{
                  position: "absolute",
                  left: e.cx - e.w / 2,
                  top: e.cy - e.h / 2,
                  width: e.w,
                  height: e.h * blink,
                  backgroundColor: c.skin,
                  borderBottom: `3px solid ${c.outline}`,
                  borderRadius: `${e.w / 2}px ${e.w / 2}px ${e.w / 3}px ${e.w / 3}px`,
                }}
              />
            ))
          : null}
      </div>

      <svg viewBox={viewBox} width={PUPPET.width} height={PUPPET.height} style={layer}>
        <Defs />
        <g transform={upper}>
          {bodyProp}
          <g transform="scale(-1 1)">
            <Arm arm={pose.left} prop={leftProp} mirrored />
          </g>
          <Arm arm={pose.right} prop={rightProp} mirrored={false} />
        </g>
      </svg>
    </div>
  );
};
