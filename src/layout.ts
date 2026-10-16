// Safe-zone layout for 1080x1920. Keeps key content clear of the Instagram /
// TikTok UI (top bar and the bottom caption/buttons area).

export const VIDEO = { width: 1080, height: 1920, fps: 30 } as const;

export const SIDE = 60;

/** EP label and chapter bar. */
export const TOP_BAR = { top: 120 } as const;

/** Word-by-word captions, below the floor line of the sets and above the bottom UI. */
export const CAPTIONS = { top: 1490 } as const;
