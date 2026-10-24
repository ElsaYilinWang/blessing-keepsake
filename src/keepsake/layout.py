"""Deterministic raster layout; all relative asset paths resolve beside the JSON."""
import json
import math
import warnings
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageCms

PRINT_PORTRAIT = (1181, 1772)
BACKGROUND = "#f6f1e8"
INK = "#51483e"


def load_config(path):
    path = Path(path).resolve()
    config = json.loads(path.read_text(encoding="utf-8-sig"))
    if not isinstance(config, dict):
        raise ValueError("Config must be a JSON object")
    if config.get("orientation", "portrait") not in ("portrait", "landscape"):
        raise ValueError("orientation must be portrait or landscape")
    if config.get("fit", "contain") not in ("contain", "cover"):
        raise ValueError("fit must be contain or cover")
    images = config.get("images", [])
    if not isinstance(images, list) or len(images) not in (1, 4):
        raise ValueError("Provide exactly 1 or 4 images")
    for item in images:
        if not isinstance(item, dict) or not isinstance(item.get("path"), str):
            raise ValueError("Every image requires a path")
        if not (path.parent / item["path"]).is_file():
            raise ValueError("Image does not exist: " + item["path"])
    for field in ("names", "blessing", "context"):
        if not isinstance(config.get(field), str) or not config[field].strip():
            raise ValueError(field + " must be non-empty text")
    if not isinstance(config.get("footer", ""), str):
        raise ValueError("footer must be text")
    config["_base"] = path.parent
    return config


def font(config, size):
    custom = config.get("font")
    if custom:
        return ImageFont.truetype(str(config["_base"] / custom), size)
    # Pillow's embedded Aileron font: no system-font discovery or download.
    return ImageFont.load_default(size=size)


def wrap(draw, text, face, width):
    lines = []
    for paragraph in text.split("\n"):
        line = ""
        for word in paragraph.split():
            candidate = (line + " " + word).strip()
            if draw.textlength(candidate, font=face) > width:
                if not line:
                    return None
                lines.append(line)
                line = word
                if draw.textlength(line, font=face) > width:
                    return None
            else:
                line = candidate
        lines.append(line)
    return lines


def text_box(draw, text, box, config, maximum, minimum):
    if not text:
        return
    x, y, w, h = box
    for size in range(maximum, minimum - 1, -1):
        face = font(config, size)
        try:
            lines = wrap(draw, text, face, w)
        except UnicodeEncodeError as exc:
            raise ValueError("Use a custom font supporting this text") from exc
        spacing = math.ceil(size * 1.38)
        if lines is not None and len(lines) * spacing <= h:
            top = y + (h - len(lines) * spacing) / 2
            for line in lines:
                draw.text((x + w / 2, top), line, font=face,
                          fill=INK, anchor="mt", stroke_width=0)
                top += spacing
            return
    raise ValueError("Text cannot fit legibly; shorten: " + text[:65])


def read_art(path):
    with Image.open(path) as source:
        source = ImageOps.exif_transpose(source)
        icc = source.info.get("icc_profile")
        if icc:
            import io
            try:
                source = ImageCms.profileToProfile(
                    source, ImageCms.ImageCmsProfile(io.BytesIO(icc)),
                    ImageCms.createProfile("sRGB"), outputMode="RGB")
            except (OSError, ValueError, ImageCms.PyCMSError) as exc:
                raise ValueError("Cannot convert embedded color profile") from exc
        rgba = source.convert("RGBA")
        clean = Image.new("RGB", rgba.size, BACKGROUND)
        clean.paste(rgba, mask=rgba.getchannel("A"))
        return clean


def render(config):
    size = PRINT_PORTRAIT
    if config.get("orientation", "portrait") == "landscape":
        size = size[::-1]
    w, h = size
    canvas = Image.new("RGB", size, BACKGROUND)
    draw = ImageDraw.Draw(canvas)
    margin = 64  # 5.4 mm at 300 DPI; important content inside safe area
    inner = w - 2 * margin
    text_box(draw, config["names"], (margin, int(h*.045), inner, int(h*.085)),
             config, 46, 26)
    top, bottom = int(h*.16), int(h*.67)
    count = len(config["images"])
    gap = 24
    cols = 1 if count == 1 else 2
    rows = cols
    cell_w = (inner - gap*(cols-1)) // cols
    cell_h = (bottom-top-gap*(rows-1)) // rows
    for index, item in enumerate(config["images"]):
        art = read_art(config["_base"] / item["path"])
        target = (cell_w, cell_h)
        scale = (max if config.get("fit", "contain") == "cover" else min)(
            cell_w / art.width, cell_h / art.height)
        if scale > 1:
            warnings.warn("Small source may look soft in print: " + item["path"])
        if config.get("fit", "contain") == "cover":
            art = ImageOps.fit(art, target, method=Image.Resampling.LANCZOS)
        else:
            art = ImageOps.contain(art, target, method=Image.Resampling.LANCZOS)
        x = margin + (index % cols)*(cell_w+gap) + (cell_w-art.width)//2
        y = top + (index // cols)*(cell_h+gap) + (cell_h-art.height)//2
        canvas.paste(art, (x, y))
    text_box(draw, config["blessing"], (margin, int(h*.705), inner, int(h*.115)),
             config, 38, 24)
    text_box(draw, config["context"], (margin, int(h*.83), inner, int(h*.085)),
             config, 26, 19)
    text_box(draw, config.get("footer", ""), (margin, int(h*.93), inner, int(h*.035)),
             config, 20, 16)
    return canvas


def export(config, output, target="all"):
    output = Path(output)
    card = render(config)  # validate fully before creating outputs
    output.mkdir(parents=True, exist_ok=True)
    profile = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
    result = []
    if target in ("all", "print"):
        for suffix in ("png", "jpg"):
            path = output / ("print-10x15." + suffix)
            kwargs = {"quality": 95, "subsampling": 0} if suffix == "jpg" else {}
            card.save(path, dpi=(300, 300), icc_profile=profile, **kwargs)
            result.append(path)
    if target in ("all", "preview"):
        preview = ImageOps.contain(card, (900, 900), Image.Resampling.LANCZOS)
        path = output / "preview.jpg"
        preview.save(path, quality=90, icc_profile=profile)
        result.append(path)
    if target in ("all", "wallpaper"):
        # Reuse complete card; padding avoids cropping a face or line of text.
        phone = Image.new("RGB", (1080, 2400), BACKGROUND)
        art = ImageOps.contain(card, (960, 1680), Image.Resampling.LANCZOS)
        phone.paste(art, ((1080-art.width)//2, 430+(1680-art.height)//2))
        path = output / "wallpaper-1080x2400.png"
        phone.save(path, icc_profile=profile)
        result.append(path)
    return result
