"""Assemble episode.json from the day's plan, the TTS timings and the word timestamps.

Usage:
    .venv\\Scripts\\python scripts\\build_episode.py public/episodes/2026-10-15

Reads from the episode folder:
    plan.json                    one scene per sentence: chapter, display text, set, actor beats, items
    narration.segments.json      paragraph start/end times (from tts.py)
    narration.json               Whisper word timings (from timestamps.py)
Writes:
    episode.json                 validated by src/schema.ts when Remotion loads it

Captions show the plan's display text (written forms like "npx create-video" or
"amarhassan.com"), timed by matching it word by word against what Whisper heard.

Timing inside a scene: anything with "atWord" (or "crossAtWord", "untilWord")
is placed on that spoken word of its scene. Use "occurrence": 2 for the second
time the word appears, and "offsetMs" to nudge it.
"""

import argparse
import difflib
import json
import re
from pathlib import Path


def norm(word: str) -> str:
    return re.sub(r"[^a-z0-9]", "", word.lower())


def align(display_words: list[str], heard: list[dict]) -> list[dict]:
    """Give every display word a start/end time from the Whisper words it matches."""
    a = [norm(w) for w in display_words]
    b = [norm(h["text"]) for h in heard]
    times: list[tuple[int, int] | None] = [None] * len(display_words)
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                times[i1 + k] = (heard[j1 + k]["startMs"], heard[j1 + k]["endMs"])
        elif op == "replace":
            # Spread the heard span evenly over the display words (e.g. "amarhassan .com" -> "amarhassan.com").
            start, end = heard[j1]["startMs"], heard[j2 - 1]["endMs"]
            step = (end - start) / (i2 - i1)
            for k in range(i2 - i1):
                times[i1 + k] = (round(start + k * step), round(start + (k + 1) * step))
    # Words Whisper missed entirely: squeeze them between their neighbours.
    for i, t in enumerate(times):
        if t is None:
            prev_end = next((times[j][1] for j in range(i - 1, -1, -1) if times[j]), 0)
            next_start = next((times[j][0] for j in range(i + 1, len(times)) if times[j]), prev_end + 300)
            times[i] = (prev_end, max(prev_end + 1, next_start))
    return [
        {"text": f" {w}", "startMs": s, "endMs": e, "timestampMs": round((s + e) / 2), "confidence": None}
        for w, (s, e) in zip(display_words, times)
    ]


def paragraph_starts(scene_words: list[list[str]], segments: list[dict]) -> dict[int, int]:
    """Map scene index -> exact start time, for scenes that open a TTS paragraph.

    Paragraphs and scenes are both in narration order, so match each paragraph to
    the next scene that starts with the same two words ("Step three" vs "Step two").
    """
    def head(words: list[str]) -> str:
        return "".join(norm(w) for w in words[:2])

    starts, j = {}, 0
    for seg in segments:
        first = head(seg["text"].split())
        k = next((k for k in range(j, len(scene_words)) if head(scene_words[k]) == first), None)
        if k is None:  # written form differs from the spoken one: time this scene from Whisper instead
            print(f'note: no scene starts with "{" ".join(seg["text"].split()[:2])}" - timed from Whisper')
            continue
        starts[k] = seg["startMs"]
        j = k + 1
    return starts


def snap_to_paragraphs(per_scene: list[list[dict]], para_starts: dict[int, int]) -> None:
    """Whisper often misplaces the first word after a pause; the TTS paragraph times are exact."""
    for i, start in para_starts.items():
        caps = per_scene[i]
        if i > 0:
            for c in per_scene[i - 1]:  # nothing from the previous scene may run into this one
                c["startMs"] = min(c["startMs"], start - 1)
                c["endMs"] = min(c["endMs"], start)
        if caps[0]["startMs"] < start:
            caps[0]["startMs"] = start
        # A word squeezed in for a gap must not end after the next word starts.
        nxt = caps[1]["startMs"] if len(caps) > 1 else caps[0]["endMs"]
        caps[0]["endMs"] = max(caps[0]["startMs"] + 80, min(caps[0]["endMs"], max(nxt, caps[0]["startMs"] + 80)))
    prev = 0
    for c in (c for caps in per_scene for c in caps):
        c["startMs"] = max(c["startMs"], prev)
        c["endMs"] = max(c["endMs"], c["startMs"] + 80)
        c["timestampMs"] = round((c["startMs"] + c["endMs"]) / 2)
        prev = c["startMs"]


def resolve(obj: dict, scene_caps: list[dict], scene_start: int, where: str) -> dict:
    """Turn atWord / crossAtWord / untilWord into scene-relative ms."""
    out = {k: v for k, v in obj.items() if k not in ("occurrence", "offsetMs")}
    for key in ("atWord", "crossAtWord", "untilWord"):
        if key not in obj:
            continue
        target = norm(obj[key])
        hits = [c for c in scene_caps if norm(c["text"]) == target]
        n = obj.get("occurrence", 1) if key == "atWord" else 1
        if len(hits) < n:
            raise SystemExit(f'{key} "{obj[key]}" (occurrence {n}) not found in scene: {where}')
        ms = max(0, hits[n - 1]["startMs"] - scene_start + (obj.get("offsetMs", 0) if key == "atWord" else 0))
        out.pop(key)
        out[key.replace("Word", "Ms")] = ms
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("folder", type=Path, help="episode folder inside public/, e.g. public/episodes/2026-10-15")
    args = parser.parse_args()
    folder: Path = args.folder

    plan = json.loads((folder / "plan.json").read_text(encoding="utf-8"))
    segments = json.loads((folder / "narration.segments.json").read_text(encoding="utf-8"))["segments"]
    heard = json.loads((folder / "narration.json").read_text(encoding="utf-8"))["captions"]

    scene_words = [s["display"].split() for s in plan["scenes"]]
    captions = align([w for words in scene_words for w in words], heard)

    # Split captions per scene. A scene that opens a TTS paragraph starts at the
    # paragraph's exact time; any other scene starts when its first word is spoken.
    per_scene, offset = [], 0
    for words in scene_words:
        per_scene.append(captions[offset : offset + len(words)])
        offset += len(words)
    para_starts = paragraph_starts(scene_words, segments)
    snap_to_paragraphs(per_scene, para_starts)
    starts = [0] + [para_starts.get(i, caps[0]["startMs"]) for i, caps in enumerate(per_scene) if i > 0]
    end_of_narration = max(segments[-1]["endMs"], captions[-1]["endMs"])

    scenes = []
    for i, (scene, caps) in enumerate(zip(plan["scenes"], per_scene)):
        start = starts[i]
        end = starts[i + 1] if i + 1 < len(starts) else end_of_narration
        where = scene["display"]
        actor = scene.get("actor")
        if actor:
            actor = {**actor, "beats": [resolve(b, caps, start, where) for b in actor["beats"]]}
        scenes.append(
            {
                "chapter": scene["chapter"],
                "startMs": start,
                "endMs": end,
                "set": scene["set"],
                "setVariant": scene.get("setVariant", ""),
                "zoom": scene.get("zoom", 1.05),
                "actor": actor,
                "items": [resolve(it, caps, start, where) for it in scene.get("items", [])],
            }
        )

    rel_audio = (folder / "narration.wav").as_posix().split("public/", 1)[1]
    episode = {
        "episode": plan["episode"],
        "date": plan["date"],
        "title": plan["title"],
        "audio": rel_audio,
        "captions": captions,
        "keywords": plan.get("keywords", []),
        "scenes": scenes,
        "tailMs": plan.get("tailMs", 1500),
        "sources": plan.get("sources", []),
    }
    out = folder / "episode.json"
    out.write_text(json.dumps(episode, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {out}: {len(scenes)} scenes, {len(captions)} caption words, {end_of_narration / 1000:.1f} s narration")


if __name__ == "__main__":
    main()
