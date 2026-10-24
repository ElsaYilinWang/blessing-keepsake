"""Generate original abstract landscape placeholders; contains no people or photos."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1] / "assets" / "samples"
root.mkdir(parents=True, exist_ok=True)
for i, label in enumerate(["Little walks", "Shared laughter", "Quiet afternoons", "Days to come"]):
    im = Image.new("RGB", (1200, 1000), "#e9e6df")
    d = ImageDraw.Draw(im)
    d.ellipse((830, 100, 990, 260), fill="#d8bf91")
    d.polygon([(0,650),(300,300+i*35),(700,650),(1000,400),(1200,640),(1200,1000),(0,1000)],
              fill="#acb7a4")
    d.polygon([(0,780),(380,550),(800,760),(1200,600),(1200,1000),(0,1000)],
              fill="#81968d")
    d.line([(0,900),(400,830),(800,940),(1200,860)], fill="#d9cfb8", width=24)
    im.save(root / ("memory-" + str(i+1) + ".png"))
