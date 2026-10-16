"""Text splitting shared by the TTS scripts (no heavy imports, so any venv can use it)."""

import re

MAX_CHUNK_CHARS = 250  # ~15 s of speech per generation call


def split_paragraphs(text: str) -> list[str]:
    """Paragraphs are separated by a blank line; each one is a scene in the narration."""
    return [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]


def split_chunks(text: str, max_chars: int = MAX_CHUNK_CHARS) -> list[str]:
    """Group whole sentences into chunks of at most max_chars."""
    sentences = re.split(r"(?<=[.!?])\s+", " ".join(text.split()))
    chunks: list[str] = []
    current = ""
    for sentence in sentences:
        if current and len(current) + 1 + len(sentence) > max_chars:
            chunks.append(current)
            current = sentence
        else:
            current = f"{current} {sentence}".strip()
    if current:
        chunks.append(current)
    return chunks
