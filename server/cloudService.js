/**
 * 官方云服务对接模块
 * 对接 life-kline.com 提供的算力服务
 */

import fetch from 'node-fetch';
import { logEvent } from './database.js';

/**
 * 调用云服务进行分析
 * @param {Object} payload - 分析请求载荷
 * @param {Object} config - API 配置
 * @param {Object} options - 可选配置
 * @returns {Promise<Object>} 分析结果
 */
export async function callCloudService(payload, config, options = {}) {
  const { endpoint, apiKey, timeout = 120000 } = config;
  const { userId, analysisType = 'standard' } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const startTime = Date.now();

    // 日志记录
    await logEvent('cloud_service_request', {
      userId,
      analysisType,
      timestamp: new Date().toISOString()
    });

    console.log(`[Cloud Service] 发起云服务请求 - 类型: ${analysisType}`);

    // 调用官方 API
    const response = await fetch(`${endpoint}/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Client-Version': '1.0.0',
        'X-Analysis-Type': analysisType
      },
      signal: controller.signal,
      body: JSON.stringify({
        ...payload,
        clientType: 'self-hosted',
        version: '1.0.0'
      })
    });

    clearTimeout(timeoutId);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    // 处理响应
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));

      // 日志记录失败
      await logEvent('cloud_service_error', {
        userId,
        status: response.status,
        error: errorData.error || errorData.message,
        elapsed: `${elapsed}s`
      });

      // 特定错误处理
      if (response.status === 401) {
        throw new Error('API Key 无效，请访问 life-kline.com 检查您的密钥');
      } else if (response.status === 402) {
        throw new Error('配额不足，请访问 life-kline.com 充值');
      } else if (response.status === 429) {
        throw new Error('请求频率过高，请稍后重试');
      }

      throw new Error(errorData.error || errorData.message || `云服务请求失败 (HTTP ${response.status})`);
    }

    const result = await response.json();

    // 日志记录成功
    await logEvent('cloud_service_success', {
      userId,
      elapsed: `${elapsed}s`,
      quota: result.quota || null
    });

    console.log(`[Cloud Service] 云服务请求成功 - 耗时: ${elapsed}s`);

    // 返回标准化结果
    return {
      success: true,
      data: result.data || result,
      quota: result.quota,
      elapsed: parseFloat(elapsed),
      source: 'cloud'
    };

  } catch (error) {
    clearTimeout(timeoutId);

    // 超时处理
    if (error.name === 'AbortError') {
      await logEvent('cloud_service_timeout', {
        userId,
        timeout: `${timeout}ms`
      });
      throw new Error('云服务请求超时，请稍后重试');
    }

    // 网络错误
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      await logEvent('cloud_service_network_error', {
        userId,
        error: error.message
      });
      throw new Error('无法连接到云服务，请检查网络连接');
    }

    // 其他错误
    console.error('[Cloud Service] 云服务请求失败:', error);
    throw error;
  }
}

/**
 * 查询云服务配额
 * @param {string} apiKey - API 密钥
 * @param {string} endpoint - 服务端点
 * @returns {Promise<Object>} 配额信息
 */
export async function getCloudQuota(apiKey, endpoint) {
  try {
    const response = await fetch(`${endpoint}/quota`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `获取配额失败 (HTTP ${response.status})`);
    }

    const quota = await response.json();

    return {
      total: quota.total || 0,
      used: quota.used || 0,
      remaining: quota.remaining || 0,
      resetDate: quota.resetDate || null,
      plan: quota.plan || 'free'
    };

  } catch (error) {
    console.error('[Cloud Service] 获取配额失败:', error);
    throw error;
  }
}

/**
 * 验证云服务 API Key
 * @param {string} apiKey - API 密钥
 * @param {string} endpoint - 服务端点
 * @returns {Promise<Object>} 验证结果
 */
export async function validateCloudApiKey(apiKey, endpoint) {
  try {
    const response = await fetch(`${endpoint}/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return {
        valid: false,
        error: `验证失败 (HTTP ${response.status})`
      };
    }

    const result = await response.json();

    return {
      valid: result.valid || false,
      userId: result.userId || null,
      plan: result.plan || null
    };

  } catch (error) {
    console.error('[Cloud Service] API Key 验证失败:', error);
    return {
      valid: false,
      error: error.message
    };
  }
}
