import json
import tempfile
import unittest
from pathlib import Path
from PIL import Image

from keepsake.layout import export, load_config, render


class LayoutTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        Image.new("RGB", (1800, 1800), "blue").save(self.root/"art.png")
        self.data = dict(names="Alex & Sam", blessing="May we keep growing.",
                         context="For all our little walks.", images=[{"path":"art.png"}])

    def config(self, **changes):
        data = dict(self.data, **changes)
        path = self.root/"card.json"
        path.write_text(json.dumps(data), encoding="utf-8")
        return load_config(path)

    def test_dimensions_and_determinism(self):
        cfg = self.config()
        self.assertEqual(render(cfg).size, (1181,1772))
        self.assertEqual(render(cfg).tobytes(), render(cfg).tobytes())
        self.assertEqual(render(self.config(orientation="landscape")).size, (1772,1181))

    def test_exports_metadata(self):
        paths = export(self.config(), self.root/"out")
        self.assertEqual(len(paths), 4)
        with Image.open(self.root/"out/print-10x15.png") as im:
            self.assertAlmostEqual(im.info["dpi"][0],300,places=1)
            self.assertTrue(im.info["icc_profile"])
            self.assertNotIn("exif", im.info)
        with Image.open(self.root/"out/wallpaper-1080x2400.png") as im:
            self.assertEqual(im.size,(1080,2400))

    def test_four_images_and_cover(self):
        self.assertEqual(render(self.config(images=[{"path":"art.png"}]*4,fit="cover")).size,
                         (1181,1772))

    def test_missing_and_invalid(self):
        for change in (dict(images=[]),dict(orientation="square"),
                       dict(images=[{"path":"missing.png"}]),dict(blessing="")):
            with self.subTest(change=change), self.assertRaises(ValueError):
                self.config(**change)

    def test_overflow_fails(self):
        with self.assertRaises(ValueError):
            render(self.config(blessing="unbreakable"*300))

    def test_contain_preserves_edges(self):
        from keepsake.layout import read_art
        image = Image.new("RGB",(400,100),"red")
        image.putpixel((0,0),(0,255,0))
        image.save(self.root/"art.png")
        self.assertEqual(read_art(self.root/"art.png").getpixel((0,0)),(0,255,0))
        cfg = self.config()
        result = render(cfg)
        self.assertEqual(result.getpixel((64, int(1772*.16)+(int(1772*.67)-int(1772*.16)-263)//2)), (0,255,0))


if __name__ == "__main__":
    unittest.main()
