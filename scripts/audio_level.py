"""Make narration loud and even, like a phone-video voice-over.

Used by tts_qwen.py on every take. Can also fix an existing file in place:
    .venv-qwen\\Scripts\\python scripts\\audio_level.py public\\episodes\\<date>\\narration.wav

Chain: gentle compressor (3:1) -> loudness normalise to -16 LUFS -> peak limiter at -1 dBFS.
Timing is untouched, so word timestamps stay valid.
"""

import sys

import numpy as np
import pyloudnorm
import soundfile as sf
from scipy.ndimage import minimum_filter1d, uniform_filter1d

TARGET_LUFS = -16.0  # common loudness for short-form video
PEAK_DB = -1.0


def _compress(x: np.ndarray, sr: int, threshold_db: float = -26.0, ratio: float = 3.0) -> np.ndarray:
    env = np.sqrt(uniform_filter1d(x**2, size=max(1, int(0.01 * sr))) + 1e-12)
    level = 20 * np.log10(env)
    gain_db = np.where(level > threshold_db, (threshold_db - level) * (1 - 1 / ratio), 0.0)
    gain_db = uniform_filter1d(gain_db, size=max(1, int(0.02 * sr)))  # smooth attack/release
    return x * 10 ** (gain_db / 20)


def _limit(x: np.ndarray, sr: int, peak_db: float = PEAK_DB) -> np.ndarray:
    ceiling = 10 ** (peak_db / 20)
    needed = np.minimum(1.0, ceiling / (np.abs(x) + 1e-12))
    look = max(1, int(0.005 * sr))
    gain = uniform_filter1d(minimum_filter1d(needed, size=2 * look), size=look)
    return np.clip(x * gain, -ceiling, ceiling)


def level_voice(audio: np.ndarray, sr: int, target_lufs: float = TARGET_LUFS) -> np.ndarray:
    x = np.asarray(audio, dtype=np.float64)
    x = _compress(x / (np.abs(x).max() + 1e-12) * 0.5, sr)
    meter = pyloudnorm.Meter(sr)
    x = pyloudnorm.normalize.loudness(x, meter.integrated_loudness(x), target_lufs)
    return _limit(x, sr).astype(np.float32)


def main() -> None:
    for path in sys.argv[1:]:
        audio, sr = sf.read(path)
        if audio.ndim > 1:
            audio = audio.mean(axis=1)
        out = level_voice(audio, sr)
        sf.write(path, out, sr)
        meter = pyloudnorm.Meter(sr)
        print(f"{path}: {meter.integrated_loudness(out):.1f} LUFS, peak {20 * np.log10(np.abs(out).max()):.1f} dBFS")


if __name__ == "__main__":
    main()
