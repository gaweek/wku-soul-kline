/**
 * 定价管理模块
 * 统一管理功能定价和积分套餐配置
 */

import { getDb } from './database.js';

// 默认功能定价配置
export const DEFAULT_PRICING = {
  FULL_ANALYSIS: {
    points: 50,
    price_usd: 0.99,
    price_cny: 6.99,
    display_name: '完整命理分析',
    category: 'analysis'
  },
  DAILY_FORTUNE_AI: {
    points: 20,
    price_usd: 0.49,
    price_cny: 2.99,
    display_name: '每日运势AI增强版',
    category: 'fortune'
  },
  MONTHLY_KLINE: {
    points: 30,
    price_usd: 0.69,
    price_cny: 4.99,
    display_name: '月度K线分析',
    category: 'kline'
  },
  DAILY_KLINE: {
    points: 20,
    price_usd: 0.49,
    price_cny: 2.99,
    display_name: '日K线分析',
    category: 'kline'
  },
};

// 默认积分套餐
export const DEFAULT_POINT_PACKAGES = [
  {
    id: 'starter',
    name: '入门套餐',
    points: 500,
    price_usd: 4.99,
    price_cny: 29.99,
    bonus: 0,
    display_order: 1,
    is_recommended: 0
  },
  {
    id: 'popular',
    name: '热门套餐',
    points: 1000,
    price_usd: 8.99,
    price_cny: 59.99,
    bonus: 100,
    display_order: 2,
    is_recommended: 1
  },
  {
    id: 'premium',
    name: '超值套餐',
    points: 5000,
    price_usd: 39.99,
    price_cny: 269.99,
    bonus: 750,
    display_order: 3,
    is_recommended: 0
  },
];

/**
 * 获取所有功能定价配置
 * @returns {Array} 定价配置列表
 */
export function getPricing() {
  const db = getDb();

  try {
    const rows = db.prepare(`
      SELECT * FROM pricing_config
      WHERE is_active = 1
      ORDER BY feature_key
    `).all();

    // 如果数据库为空,返回默认配置
    if (rows.length === 0) {
      return Object.entries(DEFAULT_PRICING).map(([key, value]) => ({
        feature_key: key,
        ...value,
        is_active: 1
      }));
    }

    return rows.map(row => ({
      id: row.id,
      feature_key: row.feature_key,
      points: row.points_cost,
      price_usd: row.price_usd,
      price_cny: row.price_cny,
      display_name: row.display_name || DEFAULT_PRICING[row.feature_key]?.display_name || row.feature_key,
      category: row.category || 'other',
      is_active: row.is_active === 1,
      updated_at: row.updated_at
    }));
  } catch (error) {
    console.error('获取定价配置失败:', error);
    // 返回默认配置作为后备
    return Object.entries(DEFAULT_PRICING).map(([key, value]) => ({
      feature_key: key,
      ...value,
      is_active: 1
    }));
  }
}

/**
 * 更新功能定价配置
 * @param {Object} config - 定价配置对象 {feature_key, points, price_usd, price_cny}
 * @returns {{success: boolean, error?: string}}
 */
export function updatePricing(config) {
  const db = getDb();

  try {
    const { feature_key, points, price_usd, price_cny, display_name, category } = config;

    if (!feature_key || points === undefined) {
      return { success: false, error: 'MISSING_REQUIRED_FIELDS' };
    }

    const now = new Date().toISOString();

    // 使用 UPSERT 插入或更新
    db.prepare(`
      INSERT INTO pricing_config (
        id, feature_key, points_cost, price_usd, price_cny,
        display_name, category, is_active, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
      ON CONFLICT(feature_key) DO UPDATE SET
        points_cost = excluded.points_cost,
        price_usd = excluded.price_usd,
        price_cny = excluded.price_cny,
        display_name = excluded.display_name,
        category = excluded.category,
        updated_at = excluded.updated_at
    `).run(
      `pricing_${feature_key}_${Date.now()}`,
      feature_key,
      points,
      price_usd || 0,
      price_cny || 0,
      display_name || DEFAULT_PRICING[feature_key]?.display_name || feature_key,
      category || DEFAULT_PRICING[feature_key]?.category || 'other',
      now
    );

    return { success: true };
  } catch (error) {
    console.error('更新定价配置失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 批量更新定价配置
 * @param {Array} configs - 定价配置数组
 * @returns {{success: boolean, updated: number, error?: string}}
 */
export function batchUpdatePricing(configs) {
  const db = getDb();

  try {
    const transaction = db.transaction((configList) => {
      let updated = 0;
      for (const config of configList) {
        const result = updatePricing(config);
        if (result.success) updated++;
      }
      return updated;
    });

    const updated = transaction(configs);
    return { success: true, updated };
  } catch (error) {
    console.error('批量更新定价配置失败:', error);
    return { success: false, updated: 0, error: error.message };
  }
}

/**
 * 获取所有积分套餐
 * @returns {Array} 积分套餐列表
 */
export function getPointPackages() {
  const db = getDb();

  try {
    const rows = db.prepare(`
      SELECT * FROM point_packages
      WHERE is_active = 1
      ORDER BY display_order ASC
    `).all();

    // 如果数据库为空,返回默认套餐
    if (rows.length === 0) {
      return DEFAULT_POINT_PACKAGES;
    }

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      points: row.points_amount,
      price_usd: row.price_usd,
      price_cny: row.price_cny,
      bonus: row.bonus_points || 0,
      is_recommended: row.is_recommended === 1,
      display_order: row.display_order,
      is_active: row.is_active === 1
    }));
  } catch (error) {
    console.error('获取积分套餐失败:', error);
    return DEFAULT_POINT_PACKAGES;
  }
}

/**
 * 更新积分套餐
 * @param {Object} pkg - 套餐配置对象
 * @returns {{success: boolean, error?: string}}
 */
export function updatePointPackage(pkg) {
  const db = getDb();

  try {
    const { id, name, points, price_usd, price_cny, bonus, is_recommended, display_order } = pkg;

    if (!id || !name || points === undefined) {
      return { success: false, error: 'MISSING_REQUIRED_FIELDS' };
    }

    // 如果设置为推荐,先取消其他推荐
    if (is_recommended) {
      db.prepare('UPDATE point_packages SET is_recommended = 0').run();
    }

    // 使用 UPSERT 插入或更新
    db.prepare(`
      INSERT INTO point_packages (
        id, name, points_amount, price_usd, price_cny,
        bonus_points, is_recommended, display_order, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        points_amount = excluded.points_amount,
        price_usd = excluded.price_usd,
        price_cny = excluded.price_cny,
        bonus_points = excluded.bonus_points,
        is_recommended = excluded.is_recommended,
        display_order = excluded.display_order
    `).run(
      id,
      name,
      points,
      price_usd || 0,
      price_cny || 0,
      bonus || 0,
      is_recommended ? 1 : 0,
      display_order || 999
    );

    return { success: true };
  } catch (error) {
    console.error('更新积分套餐失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 批量更新积分套餐
 * @param {Array} packages - 套餐配置数组
 * @returns {{success: boolean, updated: number, error?: string}}
 */
export function batchUpdatePointPackages(packages) {
  const db = getDb();

  try {
    const transaction = db.transaction((pkgList) => {
      let updated = 0;
      for (const pkg of pkgList) {
        const result = updatePointPackage(pkg);
        if (result.success) updated++;
      }
      return updated;
    });

    const updated = transaction(packages);
    return { success: true, updated };
  } catch (error) {
    console.error('批量更新积分套餐失败:', error);
    return { success: false, updated: 0, error: error.message };
  }
}

/**
 * 获取公开的定价信息(用于前端展示)
 * @returns {Object} 包含功能定价和积分套餐
 */
export function getPublicPricing() {
  return {
    features: getPricing().filter(f => f.is_active),
    packages: getPointPackages().filter(p => p.is_active),
  };
}

/**
 * 初始化定价表(如果不存在)
 */
export function initializePricingTables() {
  const db = getDb();

  try {
    // 创建定价配置表
    db.exec(`
      CREATE TABLE IF NOT EXISTS pricing_config (
        id TEXT PRIMARY KEY,
        feature_key TEXT UNIQUE NOT NULL,
        points_cost INTEGER NOT NULL,
        price_usd REAL,
        price_cny REAL,
        display_name TEXT,
        category TEXT,
        is_active INTEGER DEFAULT 1,
        updated_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_pricing_feature ON pricing_config(feature_key);
    `);

    // 创建积分套餐表
    db.exec(`
      CREATE TABLE IF NOT EXISTS point_packages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        points_amount INTEGER NOT NULL,
        price_usd REAL NOT NULL,
        price_cny REAL NOT NULL,
        bonus_points INTEGER DEFAULT 0,
        is_recommended INTEGER DEFAULT 0,
        display_order INTEGER DEFAULT 999,
        is_active INTEGER DEFAULT 1
      );

      CREATE INDEX IF NOT EXISTS idx_packages_order ON point_packages(display_order);
    `);

    // 检查是否需要初始化默认数据
    const pricingCount = db.prepare('SELECT COUNT(*) as count FROM pricing_config').get().count;
    const packagesCount = db.prepare('SELECT COUNT(*) as count FROM point_packages').get().count;

    // 初始化默认定价配置
    if (pricingCount === 0) {
      console.log('初始化默认定价配置...');
      for (const [key, value] of Object.entries(DEFAULT_PRICING)) {
        updatePricing({
          feature_key: key,
          points: value.points,
          price_usd: value.price_usd,
          price_cny: value.price_cny,
          display_name: value.display_name,
          category: value.category
        });
      }
    }

    // 初始化默认积分套餐
    if (packagesCount === 0) {
      console.log('初始化默认积分套餐...');
      for (const pkg of DEFAULT_POINT_PACKAGES) {
        updatePointPackage(pkg);
      }
    }

    console.log('定价表初始化完成');
  } catch (error) {
    console.error('定价表初始化失败:', error);
  }
}

export default {
  DEFAULT_PRICING,
  DEFAULT_POINT_PACKAGES,
  getPricing,
  updatePricing,
  batchUpdatePricing,
  getPointPackages,
  updatePointPackage,
  batchUpdatePointPackages,
  getPublicPricing,
  initializePricingTables,
};
