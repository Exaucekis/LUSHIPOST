import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const source = path.join(
  root,
  "public/logo/lushipost-monogram-source.png"
);

const { data, info } = await sharp(source)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

function processVariant(letterRgb, bgThreshold = 55) {
  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;

    if (brightness < bgThreshold) {
      out[i + 3] = 0;
      continue;
    }

    out[i] = letterRgb[0];
    out[i + 1] = letterRgb[1];
    out[i + 2] = letterRgb[2];
    out[i + 3] = Math.min(255, Math.round(((brightness - bgThreshold) / (255 - bgThreshold)) * 255));
  }
  return out;
}

async function writeVariant(buffer, filename) {
  await sharp(buffer, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim()
    .png()
    .toFile(path.join(root, "public/logo", filename));
}

const dark = processVariant([10, 10, 10]);
const light = processVariant([255, 255, 255]);

await writeVariant(dark, "lushipost-monogram-header.png");
await writeVariant(light, "lushipost-monogram.png");

console.log("Generated monogram PNGs with transparent background.");
