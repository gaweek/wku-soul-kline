import fetch from 'node-fetch';
import { sanitizeVibeInput } from './vibelineEngine.js';
import {
  buildVibeMatchUserPrompt,
  VIBEMATCH_AGENT_DEFINITIONS,
} from './vibelinePrompts.js';
import { getProviderDefaultModel } from './modelConfig.js';

const DEFAULT_API_BASE_URL = process.env.API_BASE_URL || 'https://api.openai.com/v1';
const DEFAULT_API_KEY = process.env.API_KEY || '';
const DEFAULT_MODEL = getProviderDefaultModel(
  DEFAULT_API_BASE_URL,
  process.env.DEFAULT_MODEL,
  'gemini-3-pro-preview'
);

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const sendSSE = (res, event, data) => {
  if (!res.writableEnded) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
};

const formatElapsed = (startedAt) => `${((Date.now() - startedAt) / 1000).toFixed(1)}s`;

const parseJsonObject = (content = '') => {
  let clean = String(content || '').trim();
  clean = clean.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  clean = clean.replace(/^[\s\S]*?(?=\{)/m, '');
  if (clean.startsWith('```json')) clean = clean.slice(7);
  else if (clean.startsWith('```')) clean = clean.slice(3);
  if (clean.endsWith('```')) clean = clean.slice(0, -3);

  const jsonStart = clean.indexOf('{');
  const jsonEnd = clean.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    clean = clean.slice(jsonStart, jsonEnd + 1);
  }

  return JSON.parse(clean);
};

const normalizeMatchInput = (raw = {}) => ({
  personA: sanitizeVibeInput(raw.personA || raw.a || {}),
  personB: sanitizeVibeInput(raw.personB || raw.b || {}),
  relationshipGoal: String(raw.relationshipGoal || raw.goal || '想知道两个人如何自然靠近').trim(),
});

const requestAgent = async (agent, input, partialState, timeoutMs = 45000) => {
  if (!DEFAULT_API_KEY) {
    return { success: false, agentType: agent.type, error: 'MISSING_API_KEY' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const response = await fetch(`${DEFAULT_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEFAULT_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: agent.systemPrompt },
          { role: 'user', content: buildVibeMatchUserPrompt(input, partialState) },
        ],
        temperature: 0.55,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        success: false,
        agentType: agent.type,
        error: `HTTP ${response.status}: ${body.slice(0, 120)}`,
        elapsed: formatElapsed(startedAt),
      };
    }

    const json = await response.json();
    const elapsed = formatElapsed(startedAt);
    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      return { success: false, agentType: agent.type, error: 'EMPTY_RESPONSE', elapsed };
    }

    return {
      success: true,
      agentType: agent.type,
      data: parseJsonObject(content),
      model: DEFAULT_MODEL,
      elapsed,
    };
  } catch (error) {
    return {
      success: false,
      agentType: agent.type,
      error: error.name === 'AbortError' ? 'TIMEOUT' : error.message,
      elapsed: formatElapsed(startedAt),
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

const requireArray = (value, label, minLength = 1) => {
  if (!Array.isArray(value) || value.length < minLength) {
    throw new Error(`Who Know Us Agent 输出不完整：${label}`);
  }
  return value;
};

const requireText = (value, label) => {
  const text = String(value || '').trim();
  if (!text) {
    throw new Error(`Who Know Us Agent 输出不完整：${label}`);
  }
  return text;
};

const normalizeFactor = (factor, index, kind) => ({
  title: requireText(factor?.title, `${kind}[${index}].title`),
  impact: kind === 'overlapSignals' ? clamp(Number(factor?.impact ?? 12)) : undefined,
  risk: kind === 'mismatchRisks' ? clamp(Number(factor?.risk ?? 10)) : undefined,
  evidence: requireText(factor?.evidence, `${kind}[${index}].evidence`),
  suggestion: requireText(factor?.suggestion, `${kind}[${index}].suggestion`),
});

const normalizeKlinePoint = (point, index) => {
  const open = clamp(Number(point?.open));
  const close = clamp(Number(point?.close));
  const high = clamp(Number(point?.high));
  const low = clamp(Number(point?.low));

  if ([open, close, high, low].some(Number.isNaN)) {
    throw new Error(`Who Know Us Agent 输出不完整：resonanceKline[${index}] 分值`);
  }

  return {
    id: requireText(point?.id || `match_${index + 1}`, `resonanceKline[${index}].id`),
    stage: requireText(point?.stage, `resonanceKline[${index}].stage`),
    label: requireText(point?.label, `resonanceKline[${index}].label`),
    style: requireText(point?.style, `resonanceKline[${index}].style`),
    open,
    close,
    high: Math.max(high, open, close),
    low: Math.min(low, open, close),
    score: clamp(Number(point?.score ?? close)),
    volume: clamp(Number(point?.volume)),
    volatility: clamp(Number(point?.volatility)),
    riskLevel: point?.riskLevel === 'medium' || point?.riskLevel === 'high' ? point.riskLevel : 'low',
    reason: requireText(point?.reason, `resonanceKline[${index}].reason`),
  };
};

const buildMinimalPersonResult = (input, insight = {}) => {
  return {
    productName: 'WKU soul-kline',
    tagline: 'Who Know U? 看见一个人如何被懂。',
    input,
    marketType: requireText(insight.marketType, 'person insight marketType'),
    summary: requireText(insight.summary, 'person insight summary'),
    kline: [],
    variants: [],
    audienceLenses: [],
    risingFactors: [],
    fallingFactors: [],
    soulmateSignals: [],
    rebalanceSuggestions: [],
    simulatedReplies: [],
    expressionTips: [],
    safety: {
      status: 'passed',
      flags: [],
      note: '该字段来自双人建模 Agent 的个人侧摘要。',
    },
    meta: {
      mode: 'agent',
      completedAgents: ['persona_asset'],
      generatedAt: new Date().toISOString(),
    },
  };
};

const mergeMatchAgentResults = (input, agentResults = {}) => {
  const persona = agentResults.persona_asset || {};
  const resonance = agentResults.resonance_factor || {};
  const lifecycle = agentResults.lifecycle_kline || {};
  const context = agentResults.audience_market || {};
  const narrative = agentResults.narrative_packaging || {};
  const safetyAgent = agentResults.safety_authenticity || {};

  const overlapSignals = requireArray(resonance.overlapSignals, 'overlapSignals', 3)
    .slice(0, 5)
    .map((factor, index) => normalizeFactor(factor, index, 'overlapSignals'));
  const mismatchRisks = requireArray(resonance.mismatchRisks, 'mismatchRisks', 2)
    .slice(0, 5)
    .map((factor, index) => normalizeFactor(factor, index, 'mismatchRisks'));
  const resonanceKline = requireArray(lifecycle.resonanceKline, 'resonanceKline', 18)
    .slice(0, 18)
    .map(normalizeKlinePoint);
  const stageAdvice = requireArray(narrative.stageAdvice, 'stageAdvice', 6)
    .slice(0, 6)
    .map((item, index) => ({
      stage: requireText(item?.stage, `stageAdvice[${index}].stage`),
      score: clamp(Number(item?.score ?? resonanceKline[Math.min(index * 3, resonanceKline.length - 1)]?.close ?? 60)),
      highlight: requireText(item?.highlight, `stageAdvice[${index}].highlight`),
      risk: requireText(item?.risk, `stageAdvice[${index}].risk`),
      suggestion: requireText(item?.suggestion, `stageAdvice[${index}].suggestion`),
    }));
  const conversationBridges = [
    ...requireArray(resonance.conversationBridges, 'conversationBridges', 3),
    ...(Array.isArray(narrative.conversationBridges) ? narrative.conversationBridges : []),
  ].map((item) => String(item || '').trim()).filter(Boolean).slice(0, 6);

  if (conversationBridges.length < 3) {
    throw new Error('Who Know Us Agent 输出不完整：conversationBridges');
  }

  const safety = safetyAgent.safety || {};
  const matchScore = clamp(Number(context.matchScore ?? Math.round(
    resonanceKline.reduce((sum, point) => sum + point.close, 0) / resonanceKline.length
  )));

  return {
    productName: 'WKU soul-kline',
    mode: 'Who Know Us',
    tagline: 'Who Know Us? 看见两个人怎么靠近，而不是给关系下结论。',
    input,
    personA: buildMinimalPersonResult(input.personA, persona.personAInsight),
    personB: buildMinimalPersonResult(input.personB, persona.personBInsight),
    matchScore,
    marketType: requireText(context.marketType, 'marketType'),
    summary: requireText(context.summary || persona.relationshipFrame, 'summary'),
    resonanceKline,
    overlapSignals,
    mismatchRisks,
    stageAdvice,
    conversationBridges,
    safety: {
      status: safety.status || 'passed',
      flags: Array.isArray(safety.flags) ? safety.flags : [],
      note: requireText(safety.note || '双人结果仅用于兴趣社交中的表达参考，不承诺关系结果。', 'safety.note'),
    },
    meta: {
      mode: 'agent',
      completedAgents: Object.keys(agentResults),
      generatedAt: new Date().toISOString(),
    },
  };
};

export const handleVibeMatchAnalyze = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const keepAliveInterval = setInterval(() => {
    if (!res.writableEnded) res.write(': keep-alive\n\n');
  }, 10000);

  const cleanup = () => clearInterval(keepAliveInterval);
  res.on('close', cleanup);
  res.on('finish', cleanup);

  try {
    const input = normalizeMatchInput(req.body || {});
    const agentResults = {};
    const completedAgents = [];

    sendSSE(res, 'progress', {
      message: '正在启动 Who Know Us 多 Agent 共振分析...',
      phase: 'init',
    });

    const promises = VIBEMATCH_AGENT_DEFINITIONS.map((agent) => {
      sendSSE(res, 'agent_update', {
        agentType: agent.type,
        name: agent.name,
        status: 'running',
      });

      return requestAgent(agent, input, agentResults).then((result) => {
        if (result.success) {
          agentResults[agent.type] = result.data;
          completedAgents.push(agent.type);
          sendSSE(res, 'agent_update', {
            agentType: agent.type,
            name: agent.name,
            status: 'completed',
            elapsed: result.elapsed,
            model: result.model,
          });
          sendSSE(res, 'progress', {
            message: `✓ ${agent.name} 已完成，正在继续合并共振证据...`,
            phase: agent.type,
          });
        } else {
          sendSSE(res, 'agent_update', {
            agentType: agent.type,
            name: agent.name,
            status: 'failed',
            error: result.error,
          });
        }
        return result;
      });
    });

    const settled = await Promise.allSettled(promises);
    const failed = settled
      .map((item) => item.status === 'fulfilled' ? item.value : { success: false, error: item.reason?.message || 'UNKNOWN' })
      .filter((item) => !item.success);

    if (failed.length > 0) {
      throw new Error(`Who Know Us 真实 Agent 未全部完成：${failed.map((item) => item.agentType || item.error).join('、')}`);
    }

    sendSSE(res, 'progress', {
      message: '正在合并真实 Agent 结果，生成 Who Know Us 共振 K 线...',
      phase: 'merge',
    });

    const result = mergeMatchAgentResults(input, agentResults);

    sendSSE(res, 'complete', {
      result,
      completedAgents,
      successCount: completedAgents.length,
      totalAgents: VIBEMATCH_AGENT_DEFINITIONS.length,
    });
  } catch (error) {
    sendSSE(res, 'error', {
      message: error.message || 'Who Know Us 生成失败',
    });
  } finally {
    res.end();
  }
};
