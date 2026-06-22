import assert from 'node:assert/strict';
import test from 'node:test';
import * as engine from '../server/vibelineEngine.js';
import {
  buildFallbackVibeMatchResult,
  buildFallbackVibeLineResult,
  calculateZodiacSign,
  mergeVibeLineAgentResults,
  sanitizeVibeInput,
} from '../server/vibelineEngine.js';

const sensitiveChartTerm = '\u516b\u5b57';
const sensitiveTrendTerm = '\u8fd0\u52bf';
const sensitiveSystemTerm = '\u547d\u7406';
const pairRoleLeakPattern = /(?:A\/B|A 的|A的|B 的|B的|让 A|让A|B 接|B接|A 未|B 未)/;

const collectStringValues = (value) => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStringValues);
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(collectStringValues);
  }
  return [];
};

test('sanitizeVibeInput removes metaphysics terms and preserves user intent', () => {
  const input = sanitizeVibeInput({
    draft: `我想发一条关于${sensitiveChartTerm}${sensitiveTrendTerm}和最近孤独感的动态，但怕没人接。`,
    interests: ['独立音乐', sensitiveSystemTerm, '散步'],
    mood: '有点想认识新朋友',
    platform: 'Soul',
    birthday: '2001-11-08',
    gender: '非二元',
    mbti: 'infp',
    sbti: '慢热观察型',
    socialProblem: '最近不知道怎么发出第一句话',
  });

  assert.equal(input.draft.includes(sensitiveChartTerm), false);
  assert.equal(input.draft.includes(sensitiveTrendTerm), false);
  assert.deepEqual(input.interests, ['独立音乐', '散步']);
  assert.equal(input.platform, 'Soul');
  assert.equal(input.zodiac, '天蝎座');
  assert.equal(input.gender, '非二元');
  assert.equal(input.mbti, 'INFP');
  assert.equal(input.sbti, '慢热观察型');
  assert.match(input.socialProblem, /第一句话/);
  assert.match(input.draft, /孤独感/);
});

test('calculateZodiacSign returns western zodiac labels from birthday', () => {
  assert.equal(calculateZodiacSign('2000-03-21'), '白羊座');
  assert.equal(calculateZodiacSign('2000-04-20'), '金牛座');
  assert.equal(calculateZodiacSign('2000-12-22'), '摩羯座');
  assert.equal(calculateZodiacSign('bad-input'), '');
});

test('buildFallbackVibeLineResult returns a complete WKU soul-kline lifecycle report', () => {
  const result = buildFallbackVibeLineResult({
    draft: '我是一个慢热的人，喜欢独立音乐、游戏和夜晚散步，想认识能慢慢聊起来的同频朋友。',
    interests: ['独立音乐', '游戏', '夜晚散步'],
    mood: '慢热但想连接',
    platform: 'Soul',
  });

  assert.equal(result.productName, 'WKU soul-kline');
  assert.match(result.tagline, /Who Know U/);
  assert.equal(result.kline.length, 18);
  assert.deepEqual([...new Set(result.kline.map((point) => point.stage))], [
    '眼缘停留',
    '想再看看',
    '第一句话',
    '同频点亮',
    '慢慢深聊',
    '再次想起',
  ]);
  assert.deepEqual(result.kline.slice(0, 3).map((point) => point.label), ['第一眼亮点', '可接近感', '停留理由']);
  assert.equal(result.marketType.length > 0, true);
  assert.equal(result.risingFactors.length >= 3, true);
  assert.equal(result.fallingFactors.length >= 2, true);
  assert.equal(result.soulmateSignals.length >= 3, true);
  assert.equal(result.rebalanceSuggestions.length >= 3, true);
  assert.equal(result.simulatedReplies.length >= 5, true);
  assert.equal(result.safety.flags.length, 0);

  for (const point of result.kline) {
    assert.equal(typeof point.open, 'number');
    assert.equal(typeof point.close, 'number');
    assert.equal(typeof point.high, 'number');
    assert.equal(typeof point.low, 'number');
    assert.equal(point.high >= Math.max(point.open, point.close), true);
    assert.equal(point.low <= Math.min(point.open, point.close), true);
    assert.equal(point.reason.length > 10, true);
  }
});

test('mergeVibeLineAgentResults combines agent outputs with fallback coverage', () => {
  const input = sanitizeVibeInput({
    draft: '想发一点关于独立音乐和慢热社交的想法。',
    interests: ['独立音乐'],
  });

  const result = mergeVibeLineAgentResults(input, {
    resonance_factor: {
      risingFactors: [
        {
          title: '兴趣锚点清晰',
          impact: 16,
          evidence: '独立音乐',
          suggestion: '保留具体兴趣入口',
        },
      ],
    },
    audience_market: {
      soulmateSignals: [
        {
          type: '音乐同好型',
          resonance: 88,
          why: '兴趣锚点明确',
          likelyReply: '最近听了什么？',
        },
      ],
    },
    safety_authenticity: {
      safety: {
        status: 'passed',
        flags: [],
        note: '适合公开表达',
      },
    },
  });

  assert.equal(result.risingFactors[0].title, '兴趣锚点清晰');
  assert.equal(result.soulmateSignals[0].type, '音乐同好型');
  assert.equal(result.safety.note, '适合公开表达');
  assert.equal(result.kline.length, 18);
  assert.equal(result.simulatedReplies.length >= 5, true);
});

test('buildFallbackVibeMatchResult creates a two-person resonance report', () => {
  const result = buildFallbackVibeMatchResult({
    personA: {
      draft: '我慢热，喜欢独立音乐和电影，想认识能慢慢聊起来的人。',
      interests: ['独立音乐', '电影'],
      birthday: '2001-11-08',
      mbti: 'INFP',
      sbti: '慢热观察型',
      mood: '想被自然理解',
      socialProblem: '第一句话容易紧张',
    },
    personB: {
      draft: '我喜欢看展、城市散步和摄影，聊天节奏比较温和。',
      interests: ['看展', '城市散步', '摄影'],
      birthday: '2000-05-03',
      mbti: 'ENFJ',
      sbti: '陪伴稳定型',
      mood: '想遇到能持续交流的人',
      socialProblem: '怕对方觉得我太主动',
    },
    relationshipGoal: '想知道适不适合慢慢深聊',
  });

  assert.equal(result.productName, 'WKU soul-kline');
  assert.equal(result.mode, 'Who Know Us');
  assert.equal(result.personA.input.zodiac, '天蝎座');
  assert.equal(result.personB.input.zodiac, '金牛座');
  assert.equal(result.resonanceKline.length, 18);
  assert.equal(result.stageAdvice.length, 6);
  assert.equal(new Set(result.stageAdvice.map((item) => item.suggestion)).size >= 5, true);
  assert.equal(result.overlapSignals.length >= 3, true);
  assert.equal(result.mismatchRisks.length >= 2, true);
  assert.equal(result.conversationBridges.length >= 3, true);
  assert.equal(result.matchScore >= 0 && result.matchScore <= 100, true);
});

test('buildFallbackVibeMatchResult uses you and Ta instead of visible A/B labels', () => {
  const result = buildFallbackVibeMatchResult({
    personA: {
      draft: '我慢热，喜欢独立音乐和电影，想认识能慢慢聊起来的人。',
      interests: ['独立音乐', '电影'],
      socialProblem: '第一句话容易紧张',
    },
    personB: {
      draft: '我喜欢看展和摄影，聊天节奏比较温和。',
      interests: ['看展', '摄影'],
      socialProblem: '怕对方觉得我太主动',
    },
    relationshipGoal: '想知道适不适合慢慢深聊',
  });

  const visibleCopy = collectStringValues({
    summary: result.summary,
    resonanceKline: result.resonanceKline,
    overlapSignals: result.overlapSignals,
    mismatchRisks: result.mismatchRisks,
    stageAdvice: result.stageAdvice,
    conversationBridges: result.conversationBridges,
    safety: result.safety,
  }).join('\n');

  assert.doesNotMatch(visibleCopy, pairRoleLeakPattern);
  assert.match(visibleCopy, /你/);
  assert.match(visibleCopy, /Ta/);
});

test('normalizePairPerspectiveCopy rewrites model A/B labels in visible text', () => {
  assert.equal(typeof engine.normalizePairPerspectiveCopy, 'function');

  const normalized = engine.normalizePairPerspectiveCopy({
    reason: 'A 的第一句话冷淡，B怕别人接不住，基于 A/B 输入的评分依据。',
    suggestion: '让 A 分享一个兴趣瞬间，B 接一个生活片段。',
    nested: ['A未填写具体困扰 / B 未填写具体困扰'],
  });
  const visibleCopy = collectStringValues(normalized).join('\n');

  assert.doesNotMatch(visibleCopy, pairRoleLeakPattern);
  assert.match(visibleCopy, /你的第一句话/);
  assert.match(visibleCopy, /Ta/);
});
