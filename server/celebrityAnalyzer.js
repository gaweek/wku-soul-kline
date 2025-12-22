/**
 * 名人命理分析器
 * 使用LLM为名人/企业生成深度八字分析报告
 */
import fetch from 'node-fetch';
import { AGENT_CELEBRITY_ANALYSIS_PROMPT } from './agentPrompts.js';

const DEFAULT_API_BASE_URL = process.env.API_BASE_URL || 'https://api.openai.com/v1';
const DEFAULT_API_KEY = process.env.API_KEY || ''; // 需要在 .env 中配置

// 名人分析使用的模型 - 需要高质量输出
const CELEBRITY_ANALYSIS_MODEL = 'grok-4';
const FALLBACK_MODELS = ['gemini-3-pro-preview', 'grok-4-auto'];

/**
 * 构建名人分析的用户提示词
 * @param {object} celebrity - 名人数据对象
 */
function buildCelebrityPrompt(celebrity) {
  const birthDate = new Date(celebrity.birthDate || celebrity.birth_date);
  const birthYear = birthDate.getFullYear();
  const birthMonth = birthDate.getMonth() + 1;
  const birthDay = birthDate.getDate();
  const birthHour = birthDate.getHours();

  const isCompany = celebrity.category === 'corporate_fate' ||
                    celebrity.category === 'ai_tech' ||
                    celebrity.category === 'crypto_macro';

  return `
【${isCompany ? '企业/项目' : '名人'}信息】
名称: ${celebrity.nameCn || celebrity.name_cn} (${celebrity.name})
类别: ${celebrity.categoryCn || celebrity.category_cn}
${isCompany ? '成立' : '出生'}日期: ${birthYear}年${birthMonth}月${birthDay}日 ${birthHour}时
${isCompany ? '总部' : '出生'}地点: ${celebrity.birthLocation?.city || celebrity.birth_location_city || '未知'}

【八字四柱】
年柱: ${celebrity.yearPillar || celebrity.year_pillar}
月柱: ${celebrity.monthPillar || celebrity.month_pillar}
日柱: ${celebrity.dayPillar || celebrity.day_pillar}
时柱: ${celebrity.hourPillar || celebrity.hour_pillar}

【已有描述】
${celebrity.description}

【标签】
${(celebrity.tags || []).join(', ')}

【分析要求】
请为此${isCompany ? '企业/项目' : '名人'}生成深度八字命理分析报告。
${isCompany ? '注意：企业八字以成立日期为准，分析其发展运势。' : ''}
分析需要基于真实的命理逻辑，每个维度至少200字，必须有命理依据支撑。
`;
}

/**
 * 解析LLM响应中的JSON
 * @param {string} content - LLM返回的内容
 */
function parseAnalysisResponse(content) {
  try {
    // 清理内容
    let cleaned = content.trim();
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    cleaned = cleaned.replace(/^[\s\S]*?(?=\{)/m, '');

    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
    }

    return JSON.parse(cleaned);
  } catch (error) {
    console.error('[celebrityAnalyzer] JSON解析失败:', error.message);
    console.error('[celebrityAnalyzer] 原始内容前500字:', content.substring(0, 500));
    return null;
  }
}

/**
 * 验证分析结果是否完整
 * @param {object} result - 解析后的分析结果
 */
function validateAnalysisResult(result) {
  if (!result || typeof result !== 'object') return false;

  const { analysisData, scores } = result;

  // 检查必要的分析字段
  const requiredAnalysisFields = ['summary', 'personality', 'career', 'wealth', 'marriage', 'health'];
  for (const field of requiredAnalysisFields) {
    if (!analysisData?.[field] || analysisData[field].length < 100) {
      console.warn(`[celebrityAnalyzer] 字段 ${field} 缺失或内容太短 (${analysisData?.[field]?.length || 0}字)`);
      return false;
    }
  }

  // 检查评分字段
  const requiredScoreFields = ['overall', 'personality', 'career', 'wealth', 'marriage', 'health'];
  for (const field of requiredScoreFields) {
    if (typeof scores?.[field] !== 'number' || scores[field] < 0 || scores[field] > 100) {
      console.warn(`[celebrityAnalyzer] 评分字段 ${field} 无效: ${scores?.[field]}`);
      return false;
    }
  }

  return true;
}

/**
 * 调用LLM API生成分析
 * @param {string} model - 模型名称
 * @param {string} userPrompt - 用户提示词
 * @param {number} timeoutMs - 超时时间
 */
async function callLLMApi(model, userPrompt, timeoutMs = 120000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    console.log(`[celebrityAnalyzer] 使用模型 ${model} 开始生成分析...`);
    const startTime = Date.now();

    const response = await fetch(`${DEFAULT_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEFAULT_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: AGENT_CELEBRITY_ANALYSIS_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    clearTimeout(timeoutId);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[celebrityAnalyzer] API请求失败 (${elapsed}s): ${response.status} - ${errText.substring(0, 200)}`);
      return { success: false, error: `HTTP ${response.status}`, elapsed };
    }

    const responseJson = await response.json();
    const content = responseJson.choices?.[0]?.message?.content;

    if (!content) {
      return { success: false, error: 'EMPTY_RESPONSE', elapsed };
    }

    const parsed = parseAnalysisResponse(content);
    if (!parsed) {
      return { success: false, error: 'PARSE_ERROR', elapsed };
    }

    if (!validateAnalysisResult(parsed)) {
      return { success: false, error: 'VALIDATION_ERROR', data: parsed, elapsed };
    }

    console.log(`[celebrityAnalyzer] ✓ 分析生成成功 (${elapsed}s)`);
    return { success: true, data: parsed, elapsed, model };

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.warn(`[celebrityAnalyzer] 请求超时`);
      return { success: false, error: 'TIMEOUT' };
    }
    console.warn(`[celebrityAnalyzer] 请求异常: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 为名人生成完整的命理分析
 * @param {object} celebrity - 名人数据对象
 * @param {object} options - 选项
 * @returns {Promise<object>} 分析结果
 */
export async function generateCelebrityAnalysis(celebrity, options = {}) {
  const { maxRetries = 2 } = options;
  const userPrompt = buildCelebrityPrompt(celebrity);
  const modelsToTry = [CELEBRITY_ANALYSIS_MODEL, ...FALLBACK_MODELS];

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`[celebrityAnalyzer] 尝试模型 ${model} (第${attempt}次)...`);

      const result = await callLLMApi(model, userPrompt);

      if (result.success) {
        return {
          success: true,
          analysisData: result.data.analysisData,
          scores: result.data.scores,
          financialData: result.data.financialData || null,
          honors: result.data.honors || [],
          generatedAt: new Date().toISOString(),
          model: result.model,
          elapsed: result.elapsed,
        };
      }

      // 如果有部分数据但验证失败，尝试使用
      if (result.error === 'VALIDATION_ERROR' && result.data) {
        console.warn(`[celebrityAnalyzer] 数据验证失败但有部分数据，尝试补全...`);
        const partialData = result.data;
        // 填充缺失的默认值
        partialData.scores = partialData.scores || {
          overall: 60, personality: 60, career: 60, wealth: 60, marriage: 60, health: 60
        };
        partialData.analysisData = partialData.analysisData || {};

        return {
          success: true,
          analysisData: partialData.analysisData,
          scores: partialData.scores,
          financialData: partialData.financialData || null,
          honors: partialData.honors || [],
          generatedAt: new Date().toISOString(),
          model: model,
          elapsed: result.elapsed,
          partial: true,
        };
      }

      if (attempt < maxRetries) {
        console.log(`[celebrityAnalyzer] 等待1.5秒后重试...`);
        await new Promise(r => setTimeout(r, 1500));
      }
    }
    console.warn(`[celebrityAnalyzer] 模型 ${model} 所有尝试失败，切换备用模型...`);
  }

  return {
    success: false,
    error: 'ALL_MODELS_FAILED',
    message: '所有模型均无法生成有效分析',
  };
}

/**
 * 批量生成名人分析（用于后台任务）
 * @param {Array} celebrities - 名人数据数组
 * @param {function} onProgress - 进度回调
 */
export async function batchGenerateCelebrityAnalysis(celebrities, onProgress) {
  const results = [];
  const total = celebrities.length;

  for (let i = 0; i < total; i++) {
    const celebrity = celebrities[i];
    console.log(`[celebrityAnalyzer] 批量生成进度: ${i + 1}/${total} - ${celebrity.nameCn || celebrity.name_cn}`);

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        celebrity: celebrity.nameCn || celebrity.name_cn,
        status: 'processing',
      });
    }

    const result = await generateCelebrityAnalysis(celebrity);
    results.push({
      id: celebrity.id,
      name: celebrity.nameCn || celebrity.name_cn,
      ...result,
    });

    // 每次请求后等待2秒，避免API限流
    if (i < total - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  return results;
}

export default {
  generateCelebrityAnalysis,
  batchGenerateCelebrityAnalysis,
};
