---
name: daily-video
description: Make one branded short dev video end to end from a one-sentence idea - research, proposal, approval, voice, animated scenes, preview, render, and Buffer drafts for Instagram, TikTok and LinkedIn. Use whenever the creator gives a video idea or topic, asks for the next episode / "today's video", or says "make a video about ...".
---

# Daily video: idea → research → approve → build → preview → render → Buffer

Read `.claude/CLAUDE.md` first; it is the source of truth (brand, video rules, voice, safe zones).
This skill is the step-by-step run. **There are two hard stops for the creator's approval: the proposal (step 2) and the preview (step 5).** Never skip them.

Paths below use `<date>` = today, `YYYY-MM-DD` (Asia/Riyadh). Episode folder: `public/episodes/<date>/`.

## Look and style: identical every episode

Every episode must look like your first episode - the series is recognised by its look. So:

- **Same building blocks only.** Use the existing sets, the rigged character, poses, motions, props and items. Do not change `src/theme.ts`, fonts, colours, the character art, the chapter bar, the caption style or the sound effects in a daily run. New visuals (a new set, pose, prop or item) are a separate task the creator asks for; when he does, build it in the same black-and-gold style and add it to this skill's lists.
- **Same structure.** 1080×1920, 30 fps, ≤ 60 s. "EP NN" label + the 7-chapter bar on top, word-by-word captions at the bottom (bright spoken word, dim upcoming, one gold keyword per line). One sentence = one scene; the character acts out every sentence; props/items land on the spoken word; a visual change every 1.5-3 s; whoosh on every scene change.
- **Same beats.** Hook in the first 2 s → early "Follow" prompt (follow button scene) → content chapters → the end card with yoursite.com and the exact closing line → "Tomorrow: <next topic>" teaser.
- **Same voice.** Qwen3-TTS with `assets/voice/reference_energy.wav`, same seed, energetic punctuation.
- **Same publishing.** 7:00 PM Riyadh, Instagram Reel (share to feed) + TikTok + LinkedIn, AI-generated label ON for Instagram and TikTok (the voice is an AI clone; labelling is honest and protects the account).
- Episode numbers count up from `topics-log.json` (next = last + 1).

## 1. Research

1. Read `topics-log.json`: don't repeat a topic; if the last episode promised a "next" topic, prefer it.
2. Web search: 2 to 4 reliable sources (official docs, GitHub READMEs, papers, the vendor's own page). Verify every number, price, version or claim. Things that change fast get "as of <date>". Never invent facts, benchmarks or code.
3. Positioning: a real developer giving a useful tip, not hype and not "look what AI made". Frame tooling topics as a dev tip.

## 2. Proposal - STOP for approval

Show the creator, in chat, short:

- **Hook** (first 2 s): a concrete stake, number or claim. No greetings.
- **Scene table**, one row per sentence (5-8 chapters, ~12-16 scenes, 30-60 s total, ~2.5-3.5 spoken words/s):
  `# | chapter | sentence | set | what the character does | items landing on which word`
  Chapters: HOOK, WHAT, WHY IT MATTERS, HOW, CATCH, TRY IT, NEXT. Early follow prompt right after the hook.
  Last sentence is always exactly: "Visit my website yoursite.com and hit the follow button for more."
- **Facts + sources** (URLs), and anything the creator must confirm (opinions said in his voice, names of tools).
- **Captions** for Instagram/TikTok (hook line, stakes line, CTA, hashtags) and a separate, more professional LinkedIn caption (3 hashtags).

Wait for "go"/approval or edits. Apply edits and re-show if they are substantial.

## 3. Voice (GPU job; nothing else on the GPU meanwhile)

Write `public/episodes/<date>/narration.txt`: **one paragraph per TTS segment** (blank line between), usually 1-3 sentences per paragraph. Write it the way it is **spoken**:
`your site spelled as spoken (e.g. "my site dot com")`, `N P X create video`, `Qwen three T-T-S`, `pip install Qwen T-T-S`, numbers as words if ambiguous. Use `!` on hook lines (the model reads punctuation as energy).

```
.venv-qwen\Scripts\python scripts\tts_qwen.py public\episodes\<date>\narration.txt
.venv-qwen\Scripts\python scripts\timestamps.py public\episodes\<date>\narration.wav --hint "<5-10 tech terms>"
```

- Voice = Qwen3-TTS 1.7B zero-shot, reference `assets/voice/reference_energy.wav` (+ `.txt` transcript). Never use a paid voice service.
- Never pass the whole script to Whisper as a prompt (it loops); `--hint` with a few terms only.
- Check the narration length (must be ≤ 60 s with the 1.5 s tail) and skim `narration.json` text for mishearings.
- `tts_qwen.py` levels the voice automatically (`scripts/audio_level.py`: compressor → -16 LUFS → -1 dBFS peak). Sound effects in `src/components/Sfx.tsx` are tuned against that level (~12 dB under the voice); do not raise them. If a narration was made another way, run `scripts/audio_level.py` on it first.

## 4. Build the episode (data only - no new component code in a daily run)

Write `public/episodes/<date>/plan.json`, then:

```
.venv-qwen\Scripts\python scripts\build_episode.py public\episodes\<date>
npm run lint
```

`plan.json` shape (see `public/episodes/example/plan.json` for a full example):

```json
{
  "episode": 2, "date": "<date>", "title": "...", "keywords": ["word,", "..."], "tailMs": 1500,
  "sources": [{ "title": "...", "url": "https://..." }],
  "scenes": [{
    "chapter": "HOOK",
    "display": "Sentence exactly as captions should show it (written forms: yoursite.com, npx create-video).",
    "set": "stage", "setVariant": "", "zoom": 1.05,
    "actor": { "x": 540, "scale": 0.9, "facing": "right", "enterFrom": "right",
               "beats": [{ "atMs": 0, "pose": "talk" }, { "atWord": "build", "pose": "pointUp", "motion": "talk" }] },
    "items": [{ "kind": "label", "text": "...", "atWord": "camera!", "untilWord": "...", "x": 540, "y": 420 }]
  }]
}
```

- `display` of all scenes concatenated must equal the spoken narration word for word (written forms may differ, e.g. "Qwen3-TTS" for "Qwen three T-T-S"). A scene that starts a narration paragraph is timed from the TTS exactly; others start on their first spoken word.
- Timing keys: `atWord` / `crossAtWord` / `untilWord` (matched ignoring case and punctuation), `occurrence` for repeated words, `offsetMs` to nudge, or plain `atMs`.
- **Poses** (`src/rig/poses.ts`): idle, talk, explain, shrug, wave, point, pointUp, pointViewer, celebrate, think, search, laptop, holdUp, thumbsUp, headScratch. **Motions:** talk (gestures follow the voice), wave, shake, celebrate, search, type, still. **Hand props:** magnifier, phone, trophy; `"laptop": true` for the held laptop. `facing: "left"` mirrors him (point left at things).
- **Sets** (`src/sets/Sets.tsx`): stage, coderoom, desk (desk hides legs; monitor at right), sky (`setVariant` "sunrise" or "timelapse"), chalkboard (board on the left), library, blueprint (gold technical drawing on navy - use it for HOW / "how it works" scenes), plain. Every scene has drifting gold dust (`"particles": false` turns it off).
- **Items** (`src/scene/Items.tsx`): icon (camera/timeline, `crossAtWord`), label (gold/light), code (flying chip, `fromX/fromY`), window (terminal or `"style": "chalk"`, lines with kind command/code/output), counter, stamp, steps, waveform, calendar (from→to), banner, confetti, book, follow, end (url + cta, art-deco frame), **kinetic** (big words slam in one by one; `highlight` words gold; `size`, `stagger` frames - best for the hook line), **splitflap** (airport-board stat, max 10 chars, optional `label` - best for hook numbers).
- Cards are frosted glass (glassmorphism) automatically. Style kit preview: the `StyleTest` composition.
- Fill items with **real content** (actual code, real terminal output, real numbers), never filler.

Layout rules learned the hard way (1080×1920):
- Top bar (EP label + chapters) ends ~y 215: item tops must stay below ~230 (remember the scene zoom pushes items up).
- Floor y 1440; captions at y 1490; keep 60 px side margins.
- Actor scale 0.9 → head top ≈ y 570; 0.8 → ≈ 670; 0.7 → ≈ 760. Big items (window, waveform, end card) need actor 0.58-0.8 or the actor at the side (x≈790, facing left).
- Labels are ~38 px per character at the default size: keep them short or they run off screen.
- Never cover his face with an item; put labels beside or under windows.

## 5. Preview - STOP for approval

1. Studio: `npx remotion studio` → http://localhost:3000/Episode (it may already be running).
2. Render one still per scene (scale 0.4) and check them yourself first: overlaps, text off screen, face covered, item timing. Fix, rebuild, re-check.
3. Show the creator the Studio link (and mention anything you could not verify, e.g. pronunciation). Wait for approval or screenshot feedback - fix exactly what he points out.

## 6. Render

```
npx remotion render Episode out/<date>/video.mp4 --codec=h264 --crf=18
```

(Set the Episode composition's `episodeFile` default prop in `src/Root.tsx` to the new folder, or pass `--props='{"episodeFile":"episodes/<date>/episode.json","episode":null}'`.)
Verify: ≤ 60 s, 1080×1920, 30 fps, has audio, and the voice is clearly louder than every sound effect (voice ≈ -16 LUFS). Write `out/<date>/caption.txt` (IG/TikTok) and `out/<date>/caption-linkedin.txt`.

## 7. Buffer drafts (the creator attaches the video)

Buffer's API only accepts videos from a public URL, so create **drafts** already timed for 19:00 Asia/Riyadh; the creator opens each draft in Buffer, attaches `out/<date>/video.mp4`, and presses Schedule.

- Organization `<your Buffer organization id>` (get it with the Buffer MCP `get_account`; the free plan allows 10 scheduled posts).
- Channels: Instagram `<id>`, TikTok `<id>`, LinkedIn `<id>` (get them with `list_channels`).
- `create_post` with `mode: "customScheduled"`, `dueAt: "<date>T19:00:00+03:00"`, `saveToDraft: true`, `schedulingType: "automatic"`.
  - Instagram: `metadata.instagram = { type: "reel", shouldShareToFeed: true, isAiGenerated: true }`.
  - TikTok: `metadata.tiktok = { title: "<short hook>", isAiGenerated: true }` (the voice is an AI clone - always disclose).
  - LinkedIn: professional caption, no metadata needed.
- If 19:00 has already passed, ask the creator for the time instead of guessing. Never post or schedule anything without his go.

## 8. Wrap up

- Append the episode to `topics-log.json` (date, episode, title, topics, the "next" promise, sources).
- Tell the creator: video path, the three Buffer drafts and that he must attach the video, and the next episode's promised topic.
