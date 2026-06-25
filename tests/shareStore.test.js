import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  createShareRecord,
  getShareRecord,
  pruneShareRecords,
  SHARE_RECORD_MAX_AGE_MS,
  SHARE_RECORD_MAX_COUNT,
  SHARE_RECORD_MAX_PAYLOAD_BYTES,
} from '../server/shareStore.js';

const createTempStore = async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'wku-share-store-'));
  return {
    dir,
    storeFile: path.join(dir, 'records.json'),
    cleanup: () => rm(dir, { recursive: true, force: true }),
  };
};

const minimalPayload = {
  result: {
    summary: '一条可以被分享的 WKU 结果',
    kline: [{ close: 88 }],
    meta: { generatedAt: '2026-06-26T00:00:00.000Z' },
  },
  createdAt: '2026-06-26T00:00:00.000Z',
};

test('createShareRecord stores a result behind a short share id', async () => {
  const store = await createTempStore();

  try {
    const record = await createShareRecord(minimalPayload, { storeFile: store.storeFile });

    assert.match(record.id, /^[A-Za-z0-9_-]{8,}$/);
    assert.equal(record.href, `/#/s/${record.id}`);
    assert.ok(record.href.length < 32);

    const loaded = await getShareRecord(record.id, { storeFile: store.storeFile });
    assert.deepEqual(loaded?.payload, minimalPayload);
  } finally {
    await store.cleanup();
  }
});

test('createShareRecord can store a two-person invite payload behind a short id', async () => {
  const store = await createTempStore();
  const invitePayload = {
    personA: {
      draft: '我已经填好的社交样本',
      birthday: '2001-11-08',
      gender: '暂不透露',
      mbti: 'INFP',
      sbti: '夜聊搭子',
      interestText: '独立音乐、电影',
      mood: '想认识能慢慢聊起来的同频朋友',
      socialProblem: '',
    },
    relationshipGoal: '想知道我们从哪里更容易自然靠近',
    createdAt: '2026-06-26T00:00:00.000Z',
  };

  try {
    const record = await createShareRecord(invitePayload, { storeFile: store.storeFile });
    const loaded = await getShareRecord(record.id, { storeFile: store.storeFile });

    assert.match(record.id, /^[A-Za-z0-9_-]{8,}$/);
    assert.deepEqual(loaded?.payload, invitePayload);
  } finally {
    await store.cleanup();
  }
});

test('share store rejects oversized payloads instead of growing without bound', async () => {
  const store = await createTempStore();

  try {
    const oversized = {
      ...minimalPayload,
      result: {
        ...minimalPayload.result,
        summary: 'x'.repeat(SHARE_RECORD_MAX_PAYLOAD_BYTES + 1),
      },
    };

    await assert.rejects(
      () => createShareRecord(oversized, { storeFile: store.storeFile }),
      /too large/
    );
  } finally {
    await store.cleanup();
  }
});

test('pruneShareRecords removes expired entries and caps total share records', () => {
  const now = Date.parse('2026-06-26T00:00:00.000Z');
  const expiredTime = new Date(now - SHARE_RECORD_MAX_AGE_MS - 1000).toISOString();
  const records = {
    expired: {
      id: 'expired',
      href: '/#/s/expired',
      payload: minimalPayload,
      createdAt: expiredTime,
    },
  };

  for (let index = 0; index < SHARE_RECORD_MAX_COUNT + 12; index += 1) {
    records[`fresh-${index}`] = {
      id: `fresh-${index}`,
      href: `/#/s/fresh-${index}`,
      payload: minimalPayload,
      createdAt: new Date(now + index).toISOString(),
    };
  }

  const pruned = pruneShareRecords(records, now);
  const keys = Object.keys(pruned);

  assert.equal(keys.includes('expired'), false);
  assert.equal(keys.length, SHARE_RECORD_MAX_COUNT);
  assert.equal(keys.includes('fresh-0'), false);
  assert.equal(keys.includes(`fresh-${SHARE_RECORD_MAX_COUNT + 11}`), true);
});
