import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {
  PutObjectCommand,
  S3Client,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { put } from "@vercel/blob";

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export function isS3Configured() {
  return Boolean(
    process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY &&
      process.env.S3_SECRET_KEY
  );
}

export function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function getS3Client() {
  return new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!,
    },
    forcePathStyle: Boolean(process.env.S3_ENDPOINT),
  });
}

function getPublicUrl(key: string) {
  if (process.env.S3_PUBLIC_URL) {
    return `${process.env.S3_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  }
  if (process.env.S3_ENDPOINT && process.env.S3_BUCKET) {
    const endpoint = process.env.S3_ENDPOINT.replace(/\/$/, "");
    return `${endpoint}/${process.env.S3_BUCKET}/${key}`;
  }
  return `/${key}`;
}

export async function uploadMediaFile(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ url: string; key: string; storage: "s3" | "local" }> {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  const key = `media/${new Date().getFullYear()}/${randomUUID()}-${safeName}`;

  if (isS3Configured()) {
    const client = getS3Client();
    const input: PutObjectCommandInput = {
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ACL: "public-read",
    };
    await client.send(new PutObjectCommand(input));
    return { url: getPublicUrl(key), key, storage: "s3" };
  }

  if (isBlobConfigured()) {
    const blob = await put(key, buffer, { access: "public", contentType: mimeType });
    return { url: blob.url, key: blob.pathname, storage: "s3" };
  }

  if (process.env.VERCEL) {
    throw new Error("Stockage non configuré : ajoutez BLOB_READ_WRITE_TOKEN ou les variables S3 dans Vercel.");
  }

  const localDir = LOCAL_UPLOAD_DIR;
  await mkdir(localDir, { recursive: true });
  const localName = `${randomUUID()}-${safeName}`;
  const localPath = path.join(localDir, localName);
  await writeFile(localPath, buffer);
  return { url: `/uploads/${localName}`, key: localName, storage: "local" };
}
