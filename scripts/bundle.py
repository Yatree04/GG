"""Bundle index.html + css + js into one self-contained page (dist/garage.html).

Used to publish the prototype as a single-file Claude artifact.
Run:  python3 scripts/bundle.py
"""
import pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text()

def between(a, b):
    return html.split(a, 1)[1].split(b, 1)[0]

head = between("<!-- @bundle:head-start -->", "<!-- @bundle:head-end -->")
body = between("<!-- @bundle:body-start -->", "<!-- @bundle:body-end -->")

head = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">',
              lambda m: "<style>\n" + (root / m.group(1)).read_text() + "\n</style>", head)
body = re.sub(r'<script src="(js/[^"]+)"></script>',
              lambda m: "<script>\n" + (root / m.group(1)).read_text() + "\n</script>", body)

title = re.search(r"<title>.*?</title>", html).group(0)
out = root / "dist" / "garage.html"
out.parent.mkdir(exist_ok=True)
out.write_text(title + "\n" + head.strip() + "\n" + body.strip() + "\n")
print("wrote", out, out.stat().st_size, "bytes")
