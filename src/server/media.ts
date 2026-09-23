import type { Request, Response } from 'express';
import { del } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import type { MediaAsset, MediaKind } from '../types/index.js';
import { findMediaSlot, MEDIA_LIMITS } from '../config/mediaSlots.js';
import { collections, type MediaDoc, type UserDoc } from './db.js';
import { str } from './security.js';

export const isBlobConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());

const BLOB_HOST_SUFFIX = '.public.blob.vercel-storage.com';

function toAsset(doc: MediaDoc): MediaAsset {
  return {
    key: doc._id,
    kind: doc.kind,
    url: doc.url,
    contentType: doc.contentType,
    size: doc.size,
    updatedAt: doc.updatedAt.toISOString()
  };
}

export async function listMedia(): Promise<MediaAsset[]> {
  const docs = await (await collections.media()).find().toArray();
  return docs.map(toAsset);
}

// Public, cacheable map used by the website: { [slotKey]: { url, kind } }
export async function publicMedia(): Promise<Record<string, { url: string; kind: MediaKind }>> {
  const docs = await (await collections.media())
    .find({}, { projection: { url: 1, kind: 1 } })
    .toArray();
  return Object.fromEntries(docs.map((d) => [d._id, { url: d.url, kind: d.kind }]));
}

// Issues a short-lived token so the browser uploads straight to Vercel Blob.
// Files never pass through this function, which keeps large videos fast and within limits.
export async function handleUploadToken(req: Request, res: Response): Promise<void> {
  if (!isBlobConfigured()) {
    res.status(503).json({ error: 'Media storage is not configured (BLOB_READ_WRITE_TOKEN).' });
    return;
  }
  const result = await handleUpload({
    body: req.body as HandleUploadBody,
    request: req,
    onBeforeGenerateToken: async (pathname, clientPayload) => {
      let key = '';
      try {
        key = str((JSON.parse(clientPayload || '{}') as { key?: unknown }).key, 80);
      } catch {
        // Malformed payload falls through to the slot check
      }
      const slot = findMediaSlot(key);
      if (!slot) throw new Error('Unknown media slot');
      if (!pathname.startsWith(`media/${slot.key}/`)) throw new Error('Invalid upload path');
      const limits = MEDIA_LIMITS[slot.kind];
      return {
        allowedContentTypes: limits.types,
        maximumSizeInBytes: limits.maxBytes,
        addRandomSuffix: true,
        cacheControlMaxAge: 60 * 60 * 24 * 365
      };
    }
  });
  res.json(result);
}

export async function saveMedia(key: string, body: unknown, user: UserDoc): Promise<MediaAsset | string> {
  const slot = findMediaSlot(key);
  if (!slot) return 'Unknown media slot';

  const b = (body ?? {}) as Record<string, unknown>;
  const url = str(b.url, 1000);
  const contentType = str(b.contentType, 100);
  const size = typeof b.size === 'number' && Number.isFinite(b.size) ? b.size : 0;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return 'Invalid media URL';
  }
  // Only accept files that were uploaded to this project's Blob store for this slot
  if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith(BLOB_HOST_SUFFIX)) return 'Invalid media URL';
  const pathname = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
  if (!pathname.startsWith(`media/${slot.key}/`)) return 'Media URL does not match this slot';
  if (!MEDIA_LIMITS[slot.kind].types.includes(contentType)) return 'Unsupported file type';

  const media = await collections.media();
  const previous = await media.findOne({ _id: slot.key });
  const doc: MediaDoc = {
    _id: slot.key,
    kind: slot.kind,
    url,
    pathname,
    contentType,
    size,
    updatedAt: new Date(),
    updatedBy: user._id
  };
  await media.replaceOne({ _id: slot.key }, doc, { upsert: true });

  if (previous && previous.url !== url) await deleteBlob(previous.url);
  return toAsset(doc);
}

export async function removeMedia(key: string): Promise<boolean> {
  const media = await collections.media();
  const previous = await media.findOneAndDelete({ _id: key });
  if (!previous) return false;
  await deleteBlob(previous.url);
  return true;
}

async function deleteBlob(url: string): Promise<void> {
  if (!isBlobConfigured()) return;
  try {
    await del(url);
  } catch (err) {
    // An orphaned file only costs storage; never fail the request over it
    console.warn('Could not delete old media file', err);
  }
}
