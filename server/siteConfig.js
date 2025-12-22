/**
 * 站点配置管理模块
 * Site Configuration Manager
 *
 * 从环境变量读取站点配置，提供默认值
 * 用户可通过 .env 文件自定义站点名称和域名
 */

import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 站点配置
const siteConfig = {
  // 站点名称 (显示在页面标题、页脚等)
  name: process.env.SITE_NAME || '人生K线',

  // 站点域名 (不含协议)
  domain: process.env.SITE_DOMAIN || 'localhost:5173',

  // 站点完整 URL (含协议)
  url: process.env.SITE_URL || 'http://localhost:5173',

  // 站点描述
  description: process.env.SITE_DESCRIPTION || '基于 AI 大模型 + 传统八字命理的人生运势可视化工具',

  // 站点关键词
  keywords: process.env.SITE_KEYWORDS || '八字,命理,K线,运势,AI分析',

  // 版权信息
  copyright: process.env.SITE_COPYRIGHT || `© ${new Date().getFullYear()} ${process.env.SITE_NAME || '人生K线'}`,

  // 联系邮箱
  contactEmail: process.env.SITE_CONTACT_EMAIL || '',

  // ICP 备案号 (中国大陆)
  icpNumber: process.env.SITE_ICP_NUMBER || '',

  // 是否显示官方链接
  showOfficialLink: process.env.SHOW_OFFICIAL_LINK !== 'false',

  // 官方网站
  officialUrl: 'https://www.life-kline.com',
};

/**
 * 获取站点配置
 * @returns {Object} 站点配置对象
 */
export function getSiteConfig() {
  return { ...siteConfig };
}

/**
 * 获取用于前端的站点配置 (安全过滤)
 * @returns {Object} 前端安全的配置对象
 */
export function getPublicSiteConfig() {
  return {
    name: siteConfig.name,
    domain: siteConfig.domain,
    url: siteConfig.url,
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    copyright: siteConfig.copyright,
    showOfficialLink: siteConfig.showOfficialLink,
    officialUrl: siteConfig.officialUrl,
  };
}

export default siteConfig;
