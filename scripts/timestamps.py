"""Word-level timestamps for a narration WAV, using faster-whisper on CPU.

Usage:
    .venv\\Scripts\\python scripts\\timestamps.py narration.wav
    .venv\\Scripts\\python scripts\\timestamps.py narration.wav --hint "Remotion, React, Chatterbox"

Writes <audio>.json next to the audio. `captions` uses Remotion's Caption shape
({text, startMs, endMs, timestampMs, confidence}, text with a leading space),
so it can go straight into @remotion/captions.

Don't pass the whole script as a prompt: Whisper tends to copy it in a loop.
A short list of unusual words (--hint) is enough to get spellings right.
"""

import argparse
import json
from pathlib import Path

from faster_whisper import WhisperModel


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("audio", type=Path)
    parser.add_argument("--out", type=Path, help="output JSON (default: next to the audio)")
    parser.add_argument("--model", default="small.en", help="faster-whisper model size")
    parser.add_argument("--hint", help="short comma-separated list of tech terms to help spelling")
    args = parser.parse_args()

    out = args.out or args.audio.with_suffix(".json")

    model = WhisperModel(args.model, device="cpu", compute_type="int8")
    segments, info = model.transcribe(
        str(args.audio),
        language="en",
        word_timestamps=True,
        initial_prompt=args.hint,
        condition_on_previous_text=False,  # stops repetition loops on long narration
        vad_filter=True,
    )

    captions = []
    for segment in segments:
        for w in segment.words or []:
            start_ms, end_ms = round(w.start * 1000), round(w.end * 1000)
            captions.append(
                {
                    "text": w.word if w.word.startswith(" ") else f" {w.word}",
                    "startMs": start_ms,
                    "endMs": end_ms,
                    "timestampMs": round((start_ms + end_ms) / 2),
                    "confidence": round(w.probability, 3),
                }
            )

    result = {
        "audio": args.audio.name,
        "durationMs": round(info.duration * 1000),
        "text": "".join(c["text"] for c in captions).strip(),
        "captions": captions,
    }
    out.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(f"Wrote {out} ({len(captions)} words, {info.duration:.2f} s)")


if __name__ == "__main__":
    main()
