import { useAudioData } from "@remotion/media-utils";
import { useMemo } from "react";
import { staticFile } from "remotion";

// Mouth opens above OPEN and closes below CLOSE (hysteresis), on loudness
// normalised to the track's loud speech, so it works for quiet or loud takes.
// Tuned so the mouth flaps roughly once per syllable instead of staying open.
export const MOUTH_OPEN = 0.55;
export const MOUTH_CLOSE = 0.4;
const ATTACK = 0.9; // how fast the envelope follows rising loudness (0-1)
const RELEASE = 0.8; // how fast it falls back
const MIN_HOLD = 2; // frames a mouth state must last, prevents single-frame flicker

export type MouthTrack = {
  /** Smoothed loudness per frame, 0-1. */
  readonly level: number[];
  /** Is the mouth open, per frame. */
  readonly open: boolean[];
};

/** Per-frame loudness and mouth state for a voice track. Pure function of the audio, so rendering is deterministic. */
export const useMouthTrack = (audio: string, fps: number): MouthTrack | null => {
  const audioData = useAudioData(staticFile(audio));

  return useMemo(() => {
    if (!audioData) {
      return null;
    }
    const samples = audioData.channelWaveforms[0];
    const perFrame = audioData.sampleRate / fps;
    const frames = Math.ceil(samples.length / perFrame);

    const rms = new Array<number>(frames);
    for (let f = 0; f < frames; f++) {
      const start = Math.floor(f * perFrame);
      const end = Math.min(samples.length, Math.floor((f + 1) * perFrame));
      let sum = 0;
      for (let i = start; i < end; i++) {
        sum += samples[i] * samples[i];
      }
      rms[f] = Math.sqrt(sum / Math.max(1, end - start));
    }

    // Reference loudness = 90th percentile of the voiced frames (ignores silences).
    const peak = Math.max(...rms);
    const voiced = rms.filter((r) => r > peak * 0.02).sort((a, b) => a - b);
    const loud = voiced[Math.floor(voiced.length * 0.9)] || 1;

    const level = new Array<number>(frames);
    const open = new Array<boolean>(frames);
    let env = 0;
    let isOpen = false;
    let held = 0;
    for (let f = 0; f < frames; f++) {
      const l = Math.min(1, rms[f] / loud);
      env += (l - env) * (l > env ? ATTACK : RELEASE);
      held++;
      const next: boolean = isOpen ? env >= MOUTH_CLOSE : env > MOUTH_OPEN;
      if (next !== isOpen && held >= MIN_HOLD) {
        isOpen = next;
        held = 0;
      }
      level[f] = env;
      open[f] = isOpen;
    }
    return { level, open };
  }, [audioData, fps]);
};
