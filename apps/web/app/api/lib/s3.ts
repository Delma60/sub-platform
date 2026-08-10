import { createHash, createHmac, randomUUID } from "crypto";

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function encodePathPart(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function createSignedUploadUrl(input: {
  fileName: string;
  contentType: string;
  folder?: "products" | "proofs" | "avatars";
}) {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;
  const bucket = process.env.S3_BUCKET_NAME;

  if (!accessKeyId || !secretAccessKey || !region || !bucket) {
    throw new Error("S3 upload environment variables are not configured");
  }

  const folder = input.folder ?? "products";
  const safeName = sanitizeFileName(input.fileName) || "upload";
  const key = `${folder}/${randomUUID()}-${safeName}`;
  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const credential = `${accessKeyId}/${credentialScope}`;
  const signedHeaders = "host";
  const expires = "900";
  const encodedKey = key.split("/").map(encodePathPart).join("/");
  const canonicalUri = `/${encodedKey}`;

  const query = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": credential,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": expires,
    "X-Amz-SignedHeaders": signedHeaders,
  });

  const canonicalQueryString = Array.from(query.entries())
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .sort()
    .join("&");

  const canonicalRequest = [
    "PUT",
    canonicalUri,
    canonicalQueryString,
    `host:${host}`,
    "",
    signedHeaders,
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    hash(canonicalRequest),
  ].join("\n");

  const dateKey = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const regionKey = hmac(dateKey, region);
  const serviceKey = hmac(regionKey, "s3");
  const signingKey = hmac(serviceKey, "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  query.set("X-Amz-Signature", signature);

  return {
    key,
    uploadUrl: `https://${host}${canonicalUri}?${query.toString()}`,
    publicUrl: `https://${host}${canonicalUri}`,
    headers: {
      "Content-Type": input.contentType,
    },
  };
}
