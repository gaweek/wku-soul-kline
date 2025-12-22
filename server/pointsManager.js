/**
 * 积分管理模块
 * 统一管理所有功能的积分消耗配置和扣点逻辑
 */

import { getUserById, updateUserPoints, logEvent } from './database.js';

/**
 * 积分消耗配置
 */
export const POINTS_CONFIG = {
  // 免费功能
  FREE: {
    YEARLY_FORTUNE: 0,        // 今年运势
    MONTHLY_FORTUNE: 0,       // 本月运势
    YEARLY_KLINE: 0,          // 本年度36月K线
    BASIC_DAILY_FORTUNE: 0,   // 每日运势基础版
    FULL_ANALYSIS_GUEST: 0,   // 游客首次分析免费
  },

  // 付费功能
  PAID: {
    DAILY_FORTUNE_AI: 20,     // 每日运势AI增强版
    DAILY_KLINE: 20,          // 日K线61天
    MONTHLY_KLINE: 30,        // 月度7月K线
    FULL_ANALYSIS: 50,        // 完整命理分析
  },

  // 奖励配置
  REWARDS: {
    SHARE_REWARD: 300,        // 分享奖励
    INITIAL_POINTS: 1000,     // 新用户初始点数
  }
};

/**
 * 获取功能所需积分
 * @param {string} featureKey - 功能键名 (如 'DAILY_FORTUNE_AI')
 * @returns {number} 所需积分
 */
export const getFeatureCost = (featureKey) => {
  if (POINTS_CONFIG.PAID[featureKey] !== undefined) {
    return POINTS_CONFIG.PAID[featureKey];
  }
  if (POINTS_CONFIG.FREE[featureKey] !== undefined) {
    return POINTS_CONFIG.FREE[featureKey];
  }
  return 0;
};

/**
 * 检查用户积分是否足够
 * @param {string} userId - 用户ID
 * @param {string} featureKey - 功能键名
 * @returns {{sufficient: boolean, required: number, current: number}}
 */
export const checkUserPoints = (userId, featureKey) => {
  const user = getUserById(userId);
  if (!user) {
    return { sufficient: false, required: getFeatureCost(featureKey), current: 0, error: 'USER_NOT_FOUND' };
  }

  const cost = getFeatureCost(featureKey);
  return {
    sufficient: user.points >= cost,
    required: cost,
    current: user.points,
  };
};

/**
 * 扣除用户积分
 * @param {string} userId - 用户ID
 * @param {string} featureKey - 功能键名
 * @param {string} ipAddress - IP地址 (用于日志)
 * @returns {{success: boolean, newPoints?: number, error?: string}}
 */
export const deductUserPoints = (userId, featureKey, ipAddress = null) => {
  const user = getUserById(userId);
  if (!user) {
    return { success: false, error: 'USER_NOT_FOUND' };
  }

  const cost = getFeatureCost(featureKey);
  if (cost === 0) {
    return { success: true, newPoints: user.points, cost: 0 };
  }

  if (user.points < cost) {
    return { success: false, error: 'INSUFFICIENT_POINTS', required: cost, current: user.points };
  }

  const newPoints = Math.max(0, user.points - cost);
  updateUserPoints(userId, newPoints);

  // 记录日志
  try {
    logEvent('info', '积分消耗', {
      feature: featureKey,
      cost,
      before: user.points,
      after: newPoints,
    }, userId, ipAddress);
  } catch (e) {
    // 日志失败不影响主流程
    console.warn('积分消耗日志记录失败:', e.message);
  }

  return { success: true, newPoints, cost };
};

/**
 * Express中间件 - 检查积分
 * 用于需要扣点的API端点
 * @param {string} featureKey - 功能键名
 */
export const requirePoints = (featureKey) => {
  return (req, res, next) => {
    const cost = getFeatureCost(featureKey);

    // 免费功能直接通过
    if (cost === 0) {
      req.pointsInfo = { cost: 0, isFree: true };
      return next();
    }

    // 未登录用户
    if (!req.auth || !req.auth.sub) {
      return res.status(401).json({
        error: 'AUTH_REQUIRED',
        message: '此功能需要登录',
        feature: featureKey,
        cost,
      });
    }

    const userId = req.auth.sub;
    const user = getUserById(userId);

    if (!user) {
      return res.status(401).json({
        error: 'USER_NOT_FOUND',
        message: '用户不存在',
      });
    }

    if (user.points < cost) {
      return res.status(402).json({
        error: 'INSUFFICIENT_POINTS',
        message: '积分不足',
        required: cost,
        current: user.points,
        feature: featureKey,
      });
    }

    // 标记待扣除的积分信息
    req.pointsInfo = {
      cost,
      userId,
      currentPoints: user.points,
      feature: featureKey,
      isFree: false,
    };

    next();
  };
};

/**
 * 执行积分扣除 (在API成功响应后调用)
 * @param {Object} req - Express请求对象
 * @returns {{success: boolean, newPoints?: number, cost?: number}}
 */
export const executePointsDeduction = (req) => {
  if (!req.pointsInfo || req.pointsInfo.isFree || req.pointsInfo.cost === 0) {
    return { success: true, newPoints: req.pointsInfo?.currentPoints, cost: 0 };
  }

  const { userId, cost, feature, currentPoints } = req.pointsInfo;
  const newPoints = Math.max(0, currentPoints - cost);

  updateUserPoints(userId, newPoints);

  // 记录日志
  try {
    logEvent('info', '积分消耗', {
      feature,
      cost,
      before: currentPoints,
      after: newPoints,
    }, userId, req.ip);
  } catch (e) {
    console.warn('积分消耗日志记录失败:', e.message);
  }

  return { success: true, newPoints, cost };
};

/**
 * 获取功能名称的中文描述
 * @param {string} featureKey - 功能键名
 * @returns {string}
 */
export const getFeatureDisplayName = (featureKey) => {
  const names = {
    DAILY_FORTUNE_AI: '每日运势AI增强版',
    DAILY_KLINE: '日K线分析',
    MONTHLY_KLINE: '月度K线分析',
    FULL_ANALYSIS: '完整命理分析',
    YEARLY_FORTUNE: '今年运势',
    MONTHLY_FORTUNE: '本月运势',
    YEARLY_KLINE: '本年度K线',
    BASIC_DAILY_FORTUNE: '每日运势基础版',
  };
  return names[featureKey] || featureKey;
};

export default {
  POINTS_CONFIG,
  getFeatureCost,
  checkUserPoints,
  deductUserPoints,
  requirePoints,
  executePointsDeduction,
  getFeatureDisplayName,
};
