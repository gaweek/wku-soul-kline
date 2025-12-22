import nodemailer from 'nodemailer';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Create transporter with config
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.MAIL_SMTP_PORT) || 25,
  secure: process.env.MAIL_SMTP_SECURE === 'true',
  tls: {
    rejectUnauthorized: false
  },
  auth: {
    user: process.env.MAIL_FROM || 'noreply@example.com',
    pass: process.env.MAIL_PASSWORD
  }
});

// Email template wrapper with branding and footer
function emailTemplate(content, title = '人生k线') {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 100%;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">人生k线</h1>
              <p style="margin: 10px 0 0 0; color: #f0f0f0; font-size: 14px;">命理加强版</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 13px;">
                这是一封来自人生k线的系统邮件，请勿直接回复。
              </p>
              <p style="margin: 0 0 15px 0; color: #666666; font-size: 13px;">
                如有任何问题，请联系我们的客服团队。
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                <a href="${BASE_URL}/unsubscribe" style="color: #667eea; text-decoration: none;">取消订阅</a> |
                <a href="${BASE_URL}" style="color: #667eea; text-decoration: none;">访问网站</a>
              </p>
              <p style="margin: 15px 0 0 0; color: #999999; font-size: 11px;">
                &copy; ${new Date().getFullYear()} 人生k线. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Button component for emails
function buttonHTML(text, url, color = '#667eea') {
  return `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${url}" style="display: inline-block; background-color: ${color}; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
        ${text}
      </a>
    </div>
  `;
}

// Base send function
export async function sendEmail(to, subject, html, text) {
  try {
    const info = await transporter.sendMail({
      from: `"人生k线" <${process.env.MAIL_FROM || 'noreply@example.com'}>`,
      to,
      subject: `人生k线命理加强版 - ${subject}`,
      html,
      text
    });

    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Send verification email
export async function sendVerificationEmail(email, token) {
  const verificationUrl = `${BASE_URL}/verify-email?token=${token}`;

  const content = `
    <h2 style="color: #333333; font-size: 24px; margin: 0 0 20px 0;">验证您的邮箱</h2>
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      您好！
    </p>
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      感谢您注册人生k线。请点击下方按钮验证您的邮箱地址：
    </p>
    ${buttonHTML('验证邮箱', verificationUrl)}
    <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
      此验证链接将在 <strong>24小时</strong> 后失效。如果您没有注册人生k线账户，请忽略此邮件。
    </p>
    <p style="color: #999999; font-size: 13px; line-height: 1.6; margin: 20px 0 0 0; padding: 15px; background-color: #f9f9f9; border-left: 3px solid #667eea; border-radius: 4px;">
      如果按钮无法点击，请复制以下链接到浏览器访问：<br>
      <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
    </p>
  `;

  const text = `
验证您的邮箱

您好！

感谢您注册人生k线。请访问以下链接验证您的邮箱地址：
${verificationUrl}

此验证链接将在24小时后失效。如果您没有注册人生k线账户，请忽略此邮件。
  `.trim();

  return sendEmail(email, '验证您的邮箱', emailTemplate(content), text);
}

// Send password reset email
export async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`;

  const content = `
    <h2 style="color: #333333; font-size: 24px; margin: 0 0 20px 0;">重置您的密码</h2>
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      您好！
    </p>
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      我们收到了重置您账户密码的请求。请点击下方按钮重置密码：
    </p>
    ${buttonHTML('重置密码', resetUrl, '#e74c3c')}
    <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
      此重置链接将在 <strong>1小时</strong> 后失效。如果您没有请求重置密码，请忽略此邮件，您的账户仍然安全。
    </p>
    <p style="color: #999999; font-size: 13px; line-height: 1.6; margin: 20px 0 0 0; padding: 15px; background-color: #f9f9f9; border-left: 3px solid #e74c3c; border-radius: 4px;">
      如果按钮无法点击，请复制以下链接到浏览器访问：<br>
      <a href="${resetUrl}" style="color: #e74c3c; word-break: break-all;">${resetUrl}</a>
    </p>
  `;

  const text = `
重置您的密码

您好！

我们收到了重置您账户密码的请求。请访问以下链接重置密码：
${resetUrl}

此重置链接将在1小时后失效。如果您没有请求重置密码，请忽略此邮件，您的账户仍然安全。
  `.trim();

  return sendEmail(email, '重置密码', emailTemplate(content), text);
}

// Send welcome email
export async function sendWelcomeEmail(email) {
  const loginUrl = `${BASE_URL}/login`;

  const content = `
    <h2 style="color: #333333; font-size: 24px; margin: 0 0 20px 0;">欢迎加入人生k线！</h2>
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      您好！
    </p>
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      欢迎加入人生k线命理加强版！我们很高兴您成为我们的一员。
    </p>
    <div style="background-color: #f0f4ff; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="color: #667eea; font-size: 18px; margin: 0 0 15px 0;">您可以使用以下功能：</h3>
      <ul style="color: #666666; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
        <li>创建和管理您的命理档案</li>
        <li>查看每日、每月、每年运势</li>
        <li>获取个性化的命理分析</li>
        <li>设置运势提醒，不错过重要时刻</li>
      </ul>
    </div>
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
      <strong style="color: #667eea;">新用户奖励：</strong>我们已为您准备了初始积分，快去探索吧！
    </p>
    ${buttonHTML('立即开始', loginUrl)}
    <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
      祝您使用愉快！
    </p>
  `;

  const text = `
欢迎加入人生k线！

您好！

欢迎加入人生k线命理加强版！我们很高兴您成为我们的一员。

您可以使用以下功能：
- 创建和管理您的命理档案
- 查看每日、每月、每年运势
- 获取个性化的命理分析
- 设置运势提醒，不错过重要时刻

新用户奖励：我们已为您准备了初始积分，快去探索吧！

立即访问：${loginUrl}

祝您使用愉快！
  `.trim();

  return sendEmail(email, '欢迎加入人生k线！', emailTemplate(content), text);
}

// Send fortune reminder
export async function sendFortuneReminder(email, type, profileName) {
  const loginUrl = `${BASE_URL}/fortune`;

  const typeMap = {
    daily: { title: '每日运势', emoji: '📅', desc: '新的一天开始了' },
    monthly: { title: '每月运势', emoji: '📆', desc: '新的月份已经到来' },
    yearly: { title: '流年运势', emoji: '🎊', desc: '新的一年开启新篇章' },
    birthday: { title: '生日运势', emoji: '🎂', desc: '祝您生日快乐' }
  };

  const typeInfo = typeMap[type] || typeMap.daily;

  const content = `
    <h2 style="color: #333333; font-size: 24px; margin: 0 0 20px 0;">
      ${typeInfo.emoji} ${typeInfo.title}提醒
    </h2>
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      您好，<strong>${profileName}</strong>！
    </p>
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      ${typeInfo.desc}，您的${typeInfo.title}已更新，快来查看吧！
    </p>
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
      <p style="color: #ffffff; font-size: 18px; margin: 0; font-weight: bold;">
        了解运势，把握机遇
      </p>
      <p style="color: #f0f0f0; font-size: 14px; margin: 10px 0 0 0;">
        点击下方按钮查看详细运势分析
      </p>
    </div>
    ${buttonHTML('查看运势', loginUrl)}
    <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
      祝您好运常伴！
    </p>
  `;

  const text = `
${typeInfo.title}提醒

您好，${profileName}！

${typeInfo.desc}，您的${typeInfo.title}已更新，快来查看吧！

了解运势，把握机遇

访问链接查看详细运势分析：${loginUrl}

祝您好运常伴！
  `.trim();

  return sendEmail(email, `${typeInfo.title}提醒`, emailTemplate(content), text);
}

// Send low points reminder
export async function sendLowPointsReminder(email, currentPoints) {
  const rechargeUrl = `${BASE_URL}/recharge`;

  const content = `
    <h2 style="color: #333333; font-size: 24px; margin: 0 0 20px 0;">您的积分即将耗尽</h2>
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      您好！
    </p>
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      您的账户积分即将不足，可能会影响您继续使用人生k线的服务。
    </p>
    <div style="background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
      <p style="color: #856404; font-size: 14px; margin: 0 0 10px 0;">当前剩余积分</p>
      <p style="color: #856404; font-size: 36px; font-weight: bold; margin: 0;">
        ${currentPoints}
      </p>
    </div>
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
      为了不影响您的使用体验，建议您及时充值。我们提供多种充值方案供您选择。
    </p>
    ${buttonHTML('立即充值', rechargeUrl, '#ffc107')}
    <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
      感谢您对人生k线的支持！
    </p>
  `;

  const text = `
您的积分即将耗尽

您好！

您的账户积分即将不足，可能会影响您继续使用人生k线的服务。

当前剩余积分：${currentPoints}

为了不影响您的使用体验，建议您及时充值。我们提供多种充值方案供您选择。

访问充值页面：${rechargeUrl}

感谢您对人生k线的支持！
  `.trim();

  return sendEmail(email, '您的积分即将耗尽', emailTemplate(content), text);
}

// Send feature update email
export async function sendFeatureUpdateEmail(email, features) {
  const loginUrl = `${BASE_URL}/login`;

  const featuresList = features.map(feature => `
    <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e0e0e0;">
      <h4 style="color: #667eea; font-size: 18px; margin: 0 0 10px 0;">
        ${feature.icon || '✨'} ${feature.title}
      </h4>
      <p style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0;">
        ${feature.description}
      </p>
    </div>
  `).join('');

  const content = `
    <h2 style="color: #333333; font-size: 24px; margin: 0 0 20px 0;">人生k线有新功能啦！</h2>
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      您好！
    </p>
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      我们很高兴地通知您，人生k线推出了新功能，为您带来更好的使用体验！
    </p>
    <div style="background-color: #f9f9f9; padding: 25px; border-radius: 8px; margin: 25px 0;">
      ${featuresList}
    </div>
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
      快来体验这些全新功能吧！
    </p>
    ${buttonHTML('立即体验', loginUrl)}
    <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
      感谢您一直以来的支持！
    </p>
  `;

  const featuresText = features.map(f => `- ${f.title}\n  ${f.description}`).join('\n\n');

  const text = `
人生k线有新功能啦！

您好！

我们很高兴地通知您，人生k线推出了新功能，为您带来更好的使用体验！

新功能列表：
${featuresText}

快来体验这些全新功能吧！

访问链接：${loginUrl}

感谢您一直以来的支持！
  `.trim();

  return sendEmail(email, '人生k线有新功能啦！', emailTemplate(content), text);
}

// Send promotional email
export async function sendPromotionalEmail(email, promotion) {
  const promotionUrl = `${BASE_URL}/promotion/${promotion.id}`;

  const content = `
    <h2 style="color: #333333; font-size: 24px; margin: 0 0 20px 0;">${promotion.title}</h2>
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      您好！
    </p>
    ${promotion.banner ? `
    <div style="margin: 20px 0; text-align: center;">
      <img src="${promotion.banner}" alt="${promotion.title}" style="max-width: 100%; height: auto; border-radius: 8px;">
    </div>
    ` : ''}
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
      ${promotion.description}
    </p>
    ${promotion.highlights ? `
    <div style="background-color: #f0f4ff; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="color: #667eea; font-size: 18px; margin: 0 0 15px 0;">活动亮点：</h3>
      <ul style="color: #666666; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
        ${promotion.highlights.map(h => `<li>${h}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
    ${promotion.validUntil ? `
    <p style="color: #e74c3c; font-size: 15px; line-height: 1.6; margin: 20px 0; text-align: center;">
      <strong>活动截止时间：${new Date(promotion.validUntil).toLocaleDateString('zh-CN')}</strong>
    </p>
    ` : ''}
    ${buttonHTML(promotion.buttonText || '立即参与', promotionUrl, '#f39c12')}
    <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
      机会难得，不容错过！
    </p>
  `;

  const highlightsText = promotion.highlights ? promotion.highlights.map(h => `- ${h}`).join('\n') : '';

  const text = `
${promotion.title}

您好！

${promotion.description}

${highlightsText ? `活动亮点：\n${highlightsText}\n\n` : ''}${promotion.validUntil ? `活动截止时间：${new Date(promotion.validUntil).toLocaleDateString('zh-CN')}\n\n` : ''}访问链接：${promotionUrl}

机会难得，不容错过！
  `.trim();

  return sendEmail(email, `[活动] ${promotion.title}`, emailTemplate(content), text);
}

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP configuration error:', error);
  } else {
    console.log('Email service is ready to send emails');
  }
});

export default {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendFortuneReminder,
  sendLowPointsReminder,
  sendFeatureUpdateEmail,
  sendPromotionalEmail
};
