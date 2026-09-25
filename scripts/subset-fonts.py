"""
Subset the Galmuri pixel fonts into small self-hosted woff2 files.

Galmuri14 (design size 15px) is the body face and Galmuri11 (design size
12px) is used for small labels and Hangul headings. The full files are
about 500KB each because they cover all 11,172 modern Hangul syllables;
this keeps only:

  - KS X 1001 Hangul (2,350 syllables), which covers everyday Korean
  - printable ASCII
  - every other character that appears in src/ or index.html

Galmuri is licensed under the SIL OFL 1.1 with the Reserved Font Name
"Galmuri". A subset is a Modified Version under the OFL, so the output
fonts are renamed to "PignuPixel14" / "PignuPixel11" and the license is
copied next to them.

Usage (fonttools and brotli are not project dependencies):

    python3 -m venv .venv-fonts
    .venv-fonts/bin/pip install fonttools brotli
    .venv-fonts/bin/python scripts/subset-fonts.py

Re-run after adding text that uses a Hangul syllable outside KS X 1001 or a
new symbol; the build does not do this automatically.
"""

from __future__ import annotations

import io
import pathlib
import urllib.request

from fontTools import subset
from fontTools.ttLib import TTFont

GALMURI_VERSION = "2.40.3"
CDN = f"https://cdn.jsdelivr.net/npm/galmuri@{GALMURI_VERSION}"
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "src" / "assets" / "fonts"

FONTS = {
    "Galmuri14": "PignuPixel14",
    "Galmuri11": "PignuPixel11",
}


def ks_x_1001_hangul() -> set[str]:
    chars = set()
    for lead in range(0xB0, 0xC9):
        for trail in range(0xA1, 0xFF):
            try:
                chars.add(bytes([lead, trail]).decode("euc-kr"))
            except UnicodeDecodeError:
                pass
    return chars


def used_characters() -> set[str]:
    chars: set[str] = set()
    files = [*ROOT.joinpath("src").rglob("*.ts"), *ROOT.joinpath("src").rglob("*.tsx")]
    files.append(ROOT / "index.html")
    for path in files:
        chars |= set(path.read_text(encoding="utf-8"))
    return {c for c in chars if c.isprintable()}


def fetch(url: str) -> bytes:
    with urllib.request.urlopen(url) as response:
        return response.read()


def rename(font: TTFont, family: str) -> None:
    name_table = font["name"]
    postscript = f"{family}-Regular"
    for record in name_table.names:
        if record.nameID in (1, 16, 21):
            record.string = family
        elif record.nameID == 4:
            record.string = f"{family} Regular"
        elif record.nameID == 6:
            record.string = postscript
        elif record.nameID == 3:
            record.string = f"{postscript};{GALMURI_VERSION}"


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    text = "".join(
        sorted(ks_x_1001_hangul() | used_characters() | {chr(i) for i in range(0x20, 0x7F)})
    )
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.name_languages = ["*"]

    for source, target in FONTS.items():
        # Keep the source head.modified so re-running yields identical bytes.
        font = TTFont(
            io.BytesIO(fetch(f"{CDN}/dist/{source}.woff2")), recalcTimestamp=False
        )
        subsetter = subset.Subsetter(options)
        subsetter.populate(text=text)
        subsetter.subset(font)
        rename(font, target)
        out = OUT_DIR / f"{target}.woff2"
        font.flavor = "woff2"
        font.save(out)
        print(f"{out.relative_to(ROOT)}: {out.stat().st_size:,} bytes")

    license_text = fetch(f"{CDN}/ofl.md").decode("utf-8")
    (OUT_DIR / "OFL.md").write_text(
        "PignuPixel14 and PignuPixel11 are subsets of Galmuri14 and Galmuri11 "
        f"(galmuri@{GALMURI_VERSION}, https://github.com/quiple/galmuri), "
        "renamed as required by the Reserved Font Name clause.\n\n" + license_text,
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
