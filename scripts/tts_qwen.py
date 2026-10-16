"""Generate narration in your cloned voice with Qwen3-TTS 1.7B (Apache 2.0), zero-shot.

Usage:
    .venv-qwen\\Scripts\\python scripts\\tts_qwen.py public\\episodes\\<date>\\narration.txt

Writes:
    <out>.wav            the narration
    <out>.segments.json  start/end of each paragraph (scene), so scenes can be timed exactly

The reference clip's transcript must sit next to it as a .txt file
(assets/voice/reference_energy.wav + reference_energy.txt).
"""

import argparse
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

from audio_level import level_voice
from text_chunks import split_chunks, split_paragraphs

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_REF = ROOT / "assets" / "voice" / "reference_energy.wav"
MODEL = "Qwen/Qwen3-TTS-12Hz-1.7B-Base"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("text_file", type=Path, help="UTF-8 narration; paragraphs (blank line) = scenes")
    parser.add_argument("--ref", type=Path, default=DEFAULT_REF, help="reference clip, transcript in a .txt next to it")
    parser.add_argument("--out", type=Path, help="output WAV (default: next to the text file)")
    parser.add_argument("--pause-ms", type=int, default=150, help="silence between sentence chunks")
    parser.add_argument("--scene-pause-ms", type=int, default=300, help="silence between paragraphs (scenes)")
    parser.add_argument("--seed", type=int, default=42, help="fixed seed for repeatable takes")
    args = parser.parse_args()

    text = args.text_file.read_text(encoding="utf-8").strip()
    if not text:
        sys.exit(f"{args.text_file} is empty")
    ref_txt = args.ref.with_suffix(".txt")
    if not args.ref.exists() or not ref_txt.exists():
        sys.exit(f"Need both {args.ref} and its transcript {ref_txt}")
    # NVIDIA GPU (Windows/Linux) -> Apple Silicon GPU (Mac) -> CPU (slow but works).
    if torch.cuda.is_available():
        device, dtype = "cuda:0", torch.bfloat16
    elif torch.backends.mps.is_available():
        device, dtype = "mps", torch.float16
    else:
        device, dtype = "cpu", torch.float32
        print("WARNING: no GPU found, running on CPU (slow).", file=sys.stderr)
    out = args.out or args.text_file.with_suffix(".wav")

    torch.manual_seed(args.seed)
    model = Qwen3TTSModel.from_pretrained(MODEL, device_map=device, dtype=dtype)
    # Build the voice prompt once and reuse it for every chunk, so the voice stays consistent.
    prompt = model.create_voice_clone_prompt(ref_audio=str(args.ref), ref_text=ref_txt.read_text(encoding="utf-8").strip())

    parts: list[np.ndarray] = []
    segments = []
    cursor = 0
    sr = None
    paragraphs = split_paragraphs(text)
    for n, paragraph in enumerate(paragraphs):
        chunks = split_chunks(paragraph)
        start = None
        for i, chunk in enumerate(chunks):
            print(f"[scene {n + 1}/{len(paragraphs)}] {chunk}")
            wavs, sr = model.generate_voice_clone(text=chunk, language="English", voice_clone_prompt=prompt)
            if parts:
                gap = args.scene_pause_ms if i == 0 else args.pause_ms
                parts.append(np.zeros(int(sr * gap / 1000), dtype=np.float32))
                cursor += len(parts[-1])
            if start is None:
                start = cursor
            parts.append(np.asarray(wavs[0], dtype=np.float32))
            cursor += len(parts[-1])
        segments.append(
            {
                "index": n,
                "text": " ".join(paragraph.split()),
                "startMs": round(start / sr * 1000),
                "endMs": round(cursor / sr * 1000),
            }
        )

    audio = level_voice(np.concatenate(parts), sr)  # loud, even voice-over level
    out.parent.mkdir(parents=True, exist_ok=True)
    sf.write(out, audio, sr)
    seg_path = out.with_suffix(".segments.json")
    seg_path.write_text(json.dumps({"audio": out.name, "segments": segments}, indent=2), encoding="utf-8")
    print(f"Wrote {out} ({len(audio) / sr:.1f} s, {sr} Hz) and {seg_path.name} ({len(segments)} scenes)")


if __name__ == "__main__":
    main()
