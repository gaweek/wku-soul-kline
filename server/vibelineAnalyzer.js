import fetch from 'node-fetch';
import {
  buildFallbackVibeLineResult,
  mergeVibeLineAgentResults,
  sanitizeVibeInput,
} from './vibelineEngine.js';
import {
  buildVibeLineUserPrompt,
  VIBELINE_AGENT_DEFINITIONS,
} from './vibelinePrompts.js';
import { getProviderDefaultModel } from './modelConfig.js';

const DEFAULT_API_BASE_URL = process.env.API_BASE_URL || 'https://api.openai.com/v1';
const DEFAULT_API_KEY = process.env.API_KEY || '';
const DEFAULT_MODEL = getProviderDefaultModel(
  DEFAULT_API_BASE_URL,
  process.env.DEFAULT_MODEL,
  'gemini-3-pro-preview'
);

const sendSSE = (res, event, data) => {
  if (!res.writableEnded) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
};

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
          { role: 'user', content: buildVibeLineUserPrompt(input, partialState) },
        ],
        temperature: 0.55,
      }),
    });

    clearTimeout(timeoutId);
    const elapsed = `${((Date.now() - startedAt) / 1000).toFixed(1)}s`;

    if (!response.ok) {
      const body = await response.text();
      return {
        success: false,
        agentType: agent.type,
        error: `HTTP ${response.status}: ${body.slice(0, 120)}`,
        elapsed,
      };
    }

    const json = await response.json();
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
    clearTimeout(timeoutId);
    return {
      success: false,
      agentType: agent.type,
      error: error.name === 'AbortError' ? 'TIMEOUT' : error.message,
    };
  }
};

export const handleVibeLineAnalyze = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const input = sanitizeVibeInput(req.body || {});
  const keepAliveInterval = setInterval(() => {
    if (!res.writableEnded) res.write(': keep-alive\n\n');
  }, 10000);

  const cleanup = () => clearInterval(keepAliveInterval);
  res.on('close', cleanup);
  res.on('finish', cleanup);

  sendSSE(res, 'progress', {
    message: '正在解析这句话的表达意图...',
    phase: 'init',
  });

  const fallback = buildFallbackVibeLineResult(input);
  const agentResults = {};
  const completedAgents = [];

  sendSSE(res, 'vibeline_preview', {
    result: fallback,
  });

  sendSSE(res, 'agents_start', {
    agents: VIBELINE_AGENT_DEFINITIONS.map((agent) => ({
      type: agent.type,
      name: agent.name,
    })),
  });

  const promises = VIBELINE_AGENT_DEFINITIONS.map((agent) => {
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

  await Promise.allSettled(promises);

  const result = mergeVibeLineAgentResults(input, agentResults);
  sendSSE(res, 'complete', {
    result,
    completedAgents,
    successCount: completedAgents.length,
    totalAgents: VIBELINE_AGENT_DEFINITIONS.length,
  });

  res.end();
};
