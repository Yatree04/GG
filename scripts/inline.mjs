// Inline the Vite build (dist/index.html + assets) into one self-contained page,
// dist/preview.html, which is published as the always-on Claude artifact.
// Run: npm run build:preview
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dist = join(import.meta.dirname, "..", "dist");
const html = readFileSync(join(dist, "index.html"), "utf8");
const asset = (href) => readFileSync(join(dist, href.replace(/^\//, "")), "utf8");

const css = [...html.matchAll(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)].map((m) => asset(m[1]));
const js = [...html.matchAll(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g)].map((m) => asset(m[1]));
const title = html.match(/<title>.*?<\/title>/)[0];

const out = `${title}
<style>${css.join("\n")}</style>
<div id="root"></div>
<script type="module">${js.join("\n").replace(/<\/script/gi, "<\\/script")}</script>
`;
writeFileSync(join(dist, "preview.html"), out);
console.log("wrote dist/preview.html", out.length, "bytes");
