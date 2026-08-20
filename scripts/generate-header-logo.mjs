import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const source = path.join(root, "public/logo/lushipost-brand.png");
const output = path.join(root, "public/logo/lushipost-header.png");

const meta = await sharp(source).metadata();
const width = meta.width ?? 720;

const { data, info } = await sharp(source)
  .extract({ left: 0, top: 35, width, height: 200 })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;

  if (brightness < 95) {
    data[i + 3] = 0;
  } else {
    data[i] = 15;
    data[i + 1] = 15;
    data[i + 2] = 15;
    data[i + 3] = brightness > 130 ? 255 : Math.round(((brightness - 95) / 35) * 255);
  }
}

await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .trim()
  .png()
  .toFile(output);

console.log(`Generated ${output} from ${width}px source`);
