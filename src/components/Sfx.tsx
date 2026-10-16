import { Audio } from "@remotion/media";
import { staticFile } from "remotion";

export type SfxName = "click" | "whoosh" | "tick" | "thud" | "pop";

// CC0 sounds from Kenney via soundcn, see public/sfx/LICENSES.json.
// Measured against the voice (levelled to -16 LUFS, peak -1 dBFS by scripts/audio_level.py):
// each effect sits ~12 dB under the voice on average and peaks at -9 dBFS, so it never covers speech.
const VOLUME: Record<SfxName, number> = {
  click: 0.44,
  whoosh: 0.39,
  tick: 0.31,
  thud: 0.29,
  pop: 0.42,
};

/** Plays a sound effect at this component's frame 0 (wrap in a Sequence to delay it). */
export const Sfx: React.FC<{ readonly name: SfxName }> = ({ name }) => {
  return <Audio src={staticFile(`sfx/${name}.mp3`)} volume={VOLUME[name]} />;
};
