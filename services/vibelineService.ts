import {
  VibeLineAgentStatus,
  VibeLineAgentStatusMap,
  VibeLineAgentType,
  VibeLineInput,
  VibeLineResult,
  VibeMatchInput,
  VibeMatchResult,
} from '../types/vibeline';

interface AnalyzeCallbacks {
  onProgress?: (message: string) => void;
  onPreview?: (result: VibeLineResult) => void;
  onAgentUpdate?: (agentType: VibeLineAgentType, status: VibeLineAgentStatus) => void;
}

interface MatchAnalyzeCallbacks {
  onProgress?: (message: string) => void;
  onPreview?: (result: VibeMatchResult) => void;
  onAgentUpdate?: (agentType: VibeLineAgentType, status: VibeLineAgentStatus) => void;
}

export const VIBELINE_AGENT_NAMES: Record<VibeLineAgentType, string> = {
  persona_asset: '社交画像建模',
  resonance_factor: '共鸣信号提取',
  lifecycle_kline: 'soul-kline生成',
  audience_market: '同频人群定位',
  narrative_packaging: '表达方案打磨',
  safety_authenticity: '安全边界守护',
};

export const createInitialVibeLineAgentStatuses = (): VibeLineAgentStatusMap => ({
  persona_asset: { status: 'pending', name: VIBELINE_AGENT_NAMES.persona_asset },
  resonance_factor: { status: 'pending', name: VIBELINE_AGENT_NAMES.resonance_factor },
  lifecycle_kline: { status: 'pending', name: VIBELINE_AGENT_NAMES.lifecycle_kline },
  audience_market: { status: 'pending', name: VIBELINE_AGENT_NAMES.audience_market },
  narrative_packaging: { status: 'pending', name: VIBELINE_AGENT_NAMES.narrative_packaging },
  safety_authenticity: { status: 'pending', name: VIBELINE_AGENT_NAMES.safety_authenticity },
});

export const analyzeVibeLine = async (
  input: VibeLineInput,
  callbacks: AnalyzeCallbacks = {}
): Promise<VibeLineResult> => {
  const response = await fetch('/api/vibeline/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || payload.error || 'WKU soul-kline生成失败');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('无法读取 WKU soul-kline 响应流');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split('\n\n');
    buffer = chunks.pop() || '';

    for (const chunk of chunks) {
      if (!chunk.trim() || chunk.startsWith(': keep-alive')) continue;

      const eventMatch = chunk.match(/^event: (.+)$/m);
      const dataMatch = chunk.match(/^data: (.+)$/m);
      if (!eventMatch || !dataMatch) continue;

      const event = eventMatch[1];
      const data = JSON.parse(dataMatch[1]);

      if (event === 'progress') {
        callbacks.onProgress?.(data.message || '');
      }

      if (event === 'vibeline_preview') {
        callbacks.onPreview?.(data.result as VibeLineResult);
      }

      if (event === 'agent_update') {
        const agentType = data.agentType as VibeLineAgentType;
        callbacks.onAgentUpdate?.(agentType, {
          status: data.status,
          name: VIBELINE_AGENT_NAMES[agentType] || data.name,
          elapsed: data.elapsed,
          model: data.model,
          error: data.error,
        });
      }

      if (event === 'complete') {
        return data.result as VibeLineResult;
      }

      if (event === 'error') {
        throw new Error(data.message || data.error || 'WKU soul-kline生成失败');
      }
    }
  }

  throw new Error('WKU soul-kline 连接意外中断');
};

export const analyzeVibeMatch = async (
  input: VibeMatchInput,
  callbacks: MatchAnalyzeCallbacks = {}
): Promise<VibeMatchResult> => {
  const response = await fetch('/api/vibeline/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || payload.error || 'Who Know Us 生成失败');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('无法读取 Who Know Us 响应流');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split('\n\n');
    buffer = chunks.pop() || '';

    for (const chunk of chunks) {
      if (!chunk.trim() || chunk.startsWith(': keep-alive')) continue;

      const eventMatch = chunk.match(/^event: (.+)$/m);
      const dataMatch = chunk.match(/^data: (.+)$/m);
      if (!eventMatch || !dataMatch) continue;

      const event = eventMatch[1];
      const data = JSON.parse(dataMatch[1]);

      if (event === 'progress') {
        callbacks.onProgress?.(data.message || '');
      }

      if (event === 'vibematch_preview') {
        callbacks.onPreview?.(data.result as VibeMatchResult);
      }

      if (event === 'agent_update') {
        const agentType = data.agentType as VibeLineAgentType;
        callbacks.onAgentUpdate?.(agentType, {
          status: data.status,
          name: VIBELINE_AGENT_NAMES[agentType] || data.name,
          elapsed: data.elapsed,
          model: data.model,
          error: data.error,
        });
      }

      if (event === 'complete') {
        return data.result as VibeMatchResult;
      }

      if (event === 'error') {
        throw new Error(data.message || data.error || 'Who Know Us 生成失败');
      }
    }
  }

  throw new Error('Who Know Us 连接意外中断');
};
