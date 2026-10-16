// Joint angles for the rigged character, in degrees.
// Arms: 0 = hanging straight down, positive = swings outward/up away from the body.
// Elbow and wrist are relative to the parent bone, same sign convention.
// Legs: positive = outward. Head tilt: positive = towards the character's left (viewer's right).

export type HandShape = "open" | "fist" | "point" | "thumb" | "grip";

export type ArmPose = {
  readonly shoulder: number;
  readonly elbow: number;
  readonly wrist: number;
  readonly hand: HandShape;
};

export type Pose = {
  readonly left: ArmPose;
  readonly right: ArmPose;
  readonly headTilt: number;
  /** Upper-body lean around the hips. */
  readonly lean: number;
  readonly hipL: number;
  readonly hipR: number;
};

const arm = (shoulder: number, elbow: number, wrist: number, hand: HandShape): ArmPose => ({
  shoulder,
  elbow,
  wrist,
  hand,
});

const base = { headTilt: 0, lean: 0, hipL: 4, hipR: 4 };

export const POSES = {
  idle: { ...base, left: arm(8, -6, 0, "open"), right: arm(8, -6, 0, "open") },
  talk: { ...base, left: arm(10, -10, 0, "open"), right: arm(28, -72, 10, "open"), headTilt: -3 },
  explain: { ...base, left: arm(30, -80, 10, "open"), right: arm(30, -80, 10, "open") },
  shrug: { ...base, left: arm(28, 70, 20, "open"), right: arm(28, 70, 20, "open"), headTilt: 6 },
  wave: { ...base, left: arm(8, -6, 0, "open"), right: arm(135, 25, 0, "open"), headTilt: -4 },
  point: { ...base, left: arm(10, -8, 0, "open"), right: arm(95, 5, 0, "point"), lean: 2 },
  pointUp: { ...base, left: arm(10, -8, 0, "open"), right: arm(150, 10, 0, "point"), headTilt: -6 },
  pointViewer: { ...base, left: arm(8, -6, 0, "open"), right: arm(35, -110, -10, "point") },
  celebrate: { ...base, left: arm(150, 15, 0, "fist"), right: arm(150, 15, 0, "fist"), hipL: 8, hipR: 8 },
  think: { ...base, left: arm(22, -105, 0, "fist"), right: arm(-15, -150, 10, "fist"), headTilt: 7 },
  search: { ...base, left: arm(8, -6, 0, "open"), right: arm(60, 55, -30, "grip"), headTilt: -5, lean: 2 },
  laptop: { ...base, left: arm(45, -105, 0, "grip"), right: arm(45, -105, 0, "grip") },
  holdUp: { ...base, left: arm(165, 8, 0, "grip"), right: arm(165, 8, 0, "grip") },
  thumbsUp: { ...base, left: arm(8, -6, 0, "open"), right: arm(25, -125, 10, "thumb"), headTilt: -4 },
  headScratch: { ...base, left: arm(8, -6, 0, "open"), right: arm(90, -233, 0, "open"), headTilt: 9 },
} satisfies Record<string, Pose>;

export type PoseName = keyof typeof POSES;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpArm = (a: ArmPose, b: ArmPose, t: number): ArmPose => ({
  shoulder: lerp(a.shoulder, b.shoulder, t),
  elbow: lerp(a.elbow, b.elbow, t),
  wrist: lerp(a.wrist, b.wrist, t),
  hand: t < 0.5 ? a.hand : b.hand,
});

export const blendPose = (a: Pose, b: Pose, t: number): Pose => ({
  left: lerpArm(a.left, b.left, t),
  right: lerpArm(a.right, b.right, t),
  headTilt: lerp(a.headTilt, b.headTilt, t),
  lean: lerp(a.lean, b.lean, t),
  hipL: lerp(a.hipL, b.hipL, t),
  hipR: lerp(a.hipR, b.hipR, t),
});
