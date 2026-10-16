# Project: <Brand Name> — daily short-video pipeline

Read this file fully at the start of every session. It is the source of truth for who this is for, what the page is, and how videos must look and behave.

## 1. Who and what

- Creator: <Your Name>, <what you do> based in <city>.
- Brand: "<Brand Name>". Instagram handle: `<handle>`. Website: <yoursite.com>.
- Platforms: Instagram, TikTok, LinkedIn (via Buffer).
- Topics: <your topics>.
- Audience: <who you make videos for>.

## 2. Goal

- Short, high-retention vertical videos, posted daily at <time and timezone>.
- Positioning: a real developer who explains useful things clearly and honestly. The content is the tip, not the tooling.
- Success signals: 3-second hold, completion rate, shares and saves, follows per video.

## 3. Video rules

- Length: 30 to 60 seconds, never more. About 2.5 spoken words per second, so roughly 75 to 140 words of narration.
- Format: vertical 1080x1920, 30 fps.
- Hook in the first 2 seconds: a concrete stake, number or claim that makes someone stay. No greetings, no "hey guys".
- One idea per scene. 5 to 7 scenes. A visual change every 2 to 3 seconds.
- Word-by-word captions: the spoken word is bright, upcoming words are dim, and one keyword per line is gold.
- Sound: soft click on card entrance, whoosh on scene change, tick on counters, thud on stamps. Use only royalty-free or CC0 sounds. Never use copyrighted music or trending audio. The voice is always the loudest thing: narration levelled to -16 LUFS (peak -1 dBFS), effects about 12 dB under it.
- Early follow prompt right after the hook, and a "follow for tomorrow's tip" end card that includes <yoursite.com>.
- The narration always ends with exactly: "Visit my website <yoursite.com> and hit the follow button for more." (In the TTS text, write it as "<your site, spelled as spoken>" so it is pronounced right; captions show <yoursite.com>.)
- Series feel: show an episode label ("EP 09", open-ended, no fixed total) and a chapter progress bar: HOOK, WHAT, WHY IT MATTERS, HOW, CATCH, TRY IT, NEXT.
- Never invent facts, benchmarks, prices or code. Research with web search, keep the source URLs in `sources` inside `episode.json`, and say "as of <date>" for anything that changes fast.

## 4. Visual brand

Values are estimated from screenshots. you will correct them. Put them in `src/theme.ts` only. Never hard-code colours in components.

- Background `#0B0B0C`
- Gold `#D4AF37` (light `#E8CC6E`, dark `#B8912A`, used for button-style gradients)
- Text `#F2EDE0` (warm off-white), muted `#9A9488`
- Fonts: Poppins for headings, Inter for body, a monospace for code and labels
- Style: black and gold, rounded cards, thin gold outlines, subtle glow, clean and premium. Not neon green, not purple.
- Reference style (learned from a reel you likes): structured chapter bar, big stat hook, terminal cards, animated bars with counters, stamps, early follow card, word-by-word captions. Copy the structure only, never another creator's colours, layout or text.

## 5. Character and voice

- Style (learned from a reel you likes): the whole video is animated scenes, not cards next to a mascot. One sentence = one scene with its own set; the character acts out what is being said (searching with a magnifier, typing on a laptop, celebrating...), and props/items land on the exact spoken word. A visual change every 1.5 to 3 seconds.
- Character: a rigged puppet (`src/rig/`). Head = your Canva face (`public/character/rig/head_closed.png` / `head_open.png`) with real blinks and loudness lip-sync; body = vector parts with joints (black hoodie with gold details, dark joggers, white sneakers). Poses are joint angles in `src/rig/poses.ts`; motions (talk, wave, shake, celebrate, search, type) add live movement; talk gestures follow the voice loudness. Props: laptop, magnifier, phone, trophy. `RigTest` composition shows every pose.
- Sets (`src/sets/Sets.tsx`): stage, coderoom, desk, sky (sunrise / timelapse), chalkboard, library, blueprint, plain. All dark, warm, gold-lit, with drifting gold dust.
- Items (`src/scene/Items.tsx`): icon (crossable), label, flying code, window (terminal / chalk), counter, stamp, steps, waveform, calendar, banner, confetti, book, follow, end (art-deco frame), kinetic type, split-flap. Cards are frosted glass. Fill them with real content (actual code, real outputs), not filler.
- Style kit (chosen 2026-10-16 from a list of 20 styles, the ones that fit black-and-gold premium): kinetic type, split-flap, particles (gold dust), glassmorphism, blueprint, art deco. Not used on purpose: comic, halftone, pixel art, VHS, clay, Bauhaus, neo-brutalism, neon (clash with the brand).
- Voice: a zero-shot clone of your voice with Qwen3-TTS 1.7B (Apache 2.0, local, free; you picked it in a blind comparison). Reference clip `assets/voice/reference_energy.wav` with its transcript `reference_energy.txt` (the most expressive 11 s, you picked it), cut from his 9-minute recording `reference_narrator_trimmed.wav`. The reference sets the delivery, so it must be energetic, clean speech. If the clone is not good enough, you records his own voice instead. Always free: never use ElevenLabs, Fish Audio or any paid voice service unless you says so.
- Word timestamps: faster-whisper small.en on CPU, saved as JSON next to the audio.
- Python: one venv, `.venv-qwen` (see `requirements.txt`). Only keep models that are in use; delete test models after comparisons (your C: drive is tight).

## 6. Hardware and budget limits

- <your machine>. Tested on: Windows laptop, RTX 3060 Laptop GPU (6 GB VRAM), 16 GB RAM.
- Run GPU jobs one at a time (voice first, then render). Never run voice generation and rendering together.
- No Anthropic API key. Everything must work with free tools. Prefer local and open-source.
- Do not add paid services, subscriptions or API keys without asking first.

## 7. How a video is made (stages, with checkpoints)

The full step-by-step run is the `daily-video` skill (`.claude/skills/daily-video/SKILL.md`). Use it whenever you gives an idea.

1. you gives an idea in one sentence.
2. Research: web search, collect 2 to 4 reliable sources, check `topics-log.json` so topics are not repeated.
3. Proposal: scene table (one sentence per scene), narration, facts with sources, and captions per platform. STOP and show it to you. Do not continue until he approves.
4. Voice: `.venv-qwen/Scripts/python scripts/tts_qwen.py public/episodes/<date>/narration.txt` (one paragraph per TTS segment; write URLs and acronyms the way they are spoken), then `.venv-qwen/Scripts/python scripts/timestamps.py public/episodes/<date>/narration.wav --hint "<tech terms>"`.
5. Write `plan.json` (one scene per sentence: chapter, display text, set, actor beats, items with `atWord`), then build `episode.json` with `scripts/build_episode.py` (validated against `src/schema.ts` when Remotion loads it).
6. Preview BEFORE rendering: check one still per scene yourself, then show you Remotion Studio and wait for his approval.
7. Render to `out/<YYYY-MM-DD>/video.mp4` plus `caption.txt` (Instagram/TikTok) and `caption-linkedin.txt`.
8. Buffer: create drafts for Instagram, TikTok and LinkedIn, timed for 7:00 PM Asia/Riyadh. Buffer needs a public video URL, so you attaches the MP4 to each draft and presses Schedule himself. Never publish or schedule anything without his go.
9. Append the topic to `topics-log.json`.

## 8. Code rules

- Daily runs only produce JSON for existing components. Do NOT write new component code during a daily run. New visuals are a separate, deliberate task that you asks for.
- Components live in `src/components/`, `src/rig/`, `src/sets/` and `src/scene/`. Each takes typed props and uses `src/theme.ts`.
- Use Remotion best practices: `interpolate`, `spring`, `Sequence`. No CSS animations.
- Keep everything within safe zones: about 60 px side margins, and keep key content clear of the top and bottom areas covered by the Instagram and TikTok interface.
- When a layout is wrong, you will paste a screenshot. Fix exactly what he points out and nothing else.
- Keep answers short, show commands exactly as typed, and explain one step at a time.

## 9. Caption and hashtag rules

- Structure: punchy tension-driven hook line, then one line on the stakes, then the call to action, then a hashtag line.
- Hashtags: a fixed set plus 2 to 3 topic-specific tags. (TODO you: paste your fixed hashtag set here.)
- CTA for video: "Follow for tomorrow's tip", and mention <yoursite.com>. (The old "Swipe through the breakdown" CTA was for carousels only.)
- LinkedIn gets its own caption: more professional, a short story of what was built and why it matters, 3 hashtags.
- If a referral link is mentioned, say only "link in bio". Never paste it in the caption.
- Write natural, human English. No generic AI phrasing, no filler.
