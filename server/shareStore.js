import { randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SHARE_RECORD_MAX_COUNT = 500;
export const SHARE_RECORD_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
export const SHARE_RECORD_MAX_PAYLOAD_BYTES = 120 * 1024;

const DEFAULT_STORE_DIR = process.env.WKU_SHARE_STORE_DIR || path.join(__dirname, '..', '.wku-share-store');
const DEFAULT_STORE_FILE = path.join(DEFAULT_STORE_DIR, 'share-records.json');
const SHARE_ID_PATTERN = /^[A-Za-z0-9_-]{8,48}$/;

const getStoreFile = (options = {}) => options.storeFile || DEFAULT_STORE_FILE;

const measurePayloadBytes = (payload) => Buffer.byteLength(JSON.stringify(payload), 'utf8');

const normalizeRecords = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter(([id, record]) => (
      SHARE_ID_PATTERN.test(id)
      && record
      && typeof record === 'object'
      && record.id === id
      && record.payload
      && typeof record.createdAt === 'string'
    ))
  );
};

const readRecords = async (storeFile) => {
  try {
    const raw = await readFile(storeFile, 'utf8');
    return normalizeRecords(JSON.parse(raw));
  } catch (error) {
    if (error?.code === 'ENOENT') return {};
    throw error;
  }
};

const writeRecords = async (storeFile, records) => {
  await mkdir(path.dirname(storeFile), { recursive: true });
  const tmpFile = `${storeFile}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmpFile, JSON.stringify(records), 'utf8');
  await rename(tmpFile, storeFile);
};

export const buildShortShareHref = (id) => `/#/s/${id}`;

export const pruneShareRecords = (records, now = Date.now()) => {
  const freshRecords = Object.values(normalizeRecords(records))
    .filter((record) => {
      const createdAt = Date.parse(record.createdAt);
      return Number.isFinite(createdAt) && now - createdAt <= SHARE_RECORD_MAX_AGE_MS;
    })
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .slice(0, SHARE_RECORD_MAX_COUNT);

  return Object.fromEntries(freshRecords.map((record) => [record.id, record]));
};

const createShareId = () => randomBytes(8).toString('base64url');

export const createShareRecord = async (payload, options = {}) => {
  if (!payload?.result || typeof payload.result !== 'object') {
    throw new Error('Share payload is invalid');
  }

  if (measurePayloadBytes(payload) > SHARE_RECORD_MAX_PAYLOAD_BYTES) {
    throw new Error('Share payload is too large');
  }

  const storeFile = getStoreFile(options);
  const records = pruneShareRecords(await readRecords(storeFile));
  let id = createShareId();

  while (records[id]) {
    id = createShareId();
  }

  const record = {
    id,
    href: buildShortShareHref(id),
    payload,
    createdAt: new Date().toISOString(),
  };

  records[id] = record;
  await writeRecords(storeFile, pruneShareRecords(records));
  return record;
};

export const getShareRecord = async (id, options = {}) => {
  if (!SHARE_ID_PATTERN.test(id || '')) return null;

  const storeFile = getStoreFile(options);
  const records = await readRecords(storeFile);
  const pruned = pruneShareRecords(records);

  if (Object.keys(pruned).length !== Object.keys(records).length) {
    await writeRecords(storeFile, pruned);
  }

  return pruned[id] || null;
};
