"""Bundle each page + css + js into one self-contained file in dist/.

  index.html   -> dist/garage.html   (app + demo panel)
  preview.html -> dist/preview.html  (garage app only, the always-on preview artifact)

Run:  python3 scripts/bundle.py
"""
import pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent

def bundle(src, dest):
    html = (root / src).read_text()

    def between(a, b):
        return html.split(a, 1)[1].split(b, 1)[0]

    head = between("<!-- @bundle:head-start -->", "<!-- @bundle:head-end -->")
    body = between("<!-- @bundle:body-start -->", "<!-- @bundle:body-end -->")
    head = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">',
                  lambda m: "<style>\n" + (root / m.group(1)).read_text() + "\n</style>", head)
    body = re.sub(r'<script src="(js/[^"]+)"></script>',
                  lambda m: "<script>\n" + (root / m.group(1)).read_text() + "\n</script>", body)
    title = re.search(r"<title>.*?</title>", html).group(0)
    out = root / "dist" / dest
    out.parent.mkdir(exist_ok=True)
    out.write_text(title + "\n" + head.strip() + "\n" + body.strip() + "\n")
    print("wrote", out, out.stat().st_size, "bytes")

bundle("index.html", "garage.html")
bundle("preview.html", "preview.html")
