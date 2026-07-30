"""Generate the mpv loading screen (src-tauri/assets/loading.png).

Dark app background, centered app icon with a subtle accent glow. Phase
text is overlaid at runtime via mpv show-text, so the image stays static.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
ICON = ROOT / "public" / "app-icon-source.png"
OUT = ROOT / "src-tauri" / "assets" / "loading.png"

W, H = 1600, 900
BG = (20, 20, 20, 255)          # --bg-sunken / near-black app chrome
ACCENT = (145, 71, 255, 255)    # --accent

img = Image.new("RGBA", (W, H), BG)

# soft accent glow behind the icon
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
cx, cy, r = W // 2, H // 2, 260
gd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(*ACCENT[:3], 46))
glow = glow.filter(ImageFilter.GaussianBlur(120))
img.alpha_composite(glow)

# centered app icon; round the corners ourselves (source corners are black)
icon = Image.open(ICON).convert("RGBA").resize((224, 224), Image.LANCZOS)
mask = Image.new("L", icon.size, 0)
md = ImageDraw.Draw(mask)
md.rounded_rectangle([0, 0, icon.size[0], icon.size[1]], radius=52, fill=255)
icon.putalpha(mask)
img.alpha_composite(icon, (cx - 112, cy - 112))

OUT.parent.mkdir(parents=True, exist_ok=True)
img.convert("RGB").save(OUT, optimize=True)
print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")
