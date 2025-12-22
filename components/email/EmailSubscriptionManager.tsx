import React, { useState, useEffect } from 'react';
import { Mail, Check, Bell, Gift, AlertCircle, Loader2, CheckCircle, Award } from 'lucide-react';

interface EmailSubscriptionManagerProps {
  userPoints: number;
  onPointsChange: () => void;
}

interface SubscriptionData {
  emailVerified: boolean;
  bindingRewardClaimed: boolean;
  subscriptionRewardClaimed: boolean;
  subscriptions: {
    sub_daily_fortune: boolean;
    sub_monthly_fortune: boolean;
    sub_yearly_fortune: boolean;
    sub_birthday_reminder: boolean;
    sub_low_points: boolean;
    sub_feature_updates: boolean;
    sub_promotions: boolean;
  };
}

const EmailSubscriptionManager: React.FC<EmailSubscriptionManagerProps> = ({
  userPoints: _userPoints,
  onPointsChange
}) => {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [verificationSending, setVerificationSending] = useState(false);
  const [rewardClaiming, setRewardClaiming] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch subscription settings
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/email/subscription', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        } else {
          setErrorMessage('Failed to load email settings');
        }
      } catch (err) {
        console.error('Failed to fetch subscription:', err);
        setErrorMessage('Failed to load email settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const showMessage = (message: string, isError: boolean = false) => {
    if (isError) {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 5000);
    } else {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const handleSendVerification = async () => {
    setVerificationSending(true);
    try {
      const response = await fetch('/api/email/send-verification', {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Verification email sent! Please check your inbox.');
      } else {
        showMessage(data.message || 'Failed to send verification email', true);
      }
    } catch (err) {
      showMessage('Network error, please try again', true);
    } finally {
      setVerificationSending(false);
    }
  };

  const handleToggleSubscription = async (key: keyof SubscriptionData['subscriptions']) => {
    if (!subscription) return;

    const newValue = !subscription.subscriptions[key];
    const updatedSubscriptions = {
      ...subscription.subscriptions,
      [key]: newValue
    };

    // Optimistic update
    setSubscription({
      ...subscription,
      subscriptions: updatedSubscriptions
    });

    try {
      const response = await fetch('/api/email/subscription', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subscriptions: updatedSubscriptions })
      });

      if (!response.ok) {
        // Revert on error
        setSubscription(subscription);
        showMessage('Failed to update subscription', true);
      }
    } catch (err) {
      // Revert on error
      setSubscription(subscription);
      showMessage('Network error, please try again', true);
    }
  };

  const handleClaimBindingReward = async () => {
    setRewardClaiming(true);
    try {
      const response = await fetch('/api/email/claim-binding-reward', {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(`Successfully claimed ${data.points} points!`);
        setSubscription(prev => prev ? { ...prev, bindingRewardClaimed: true } : null);
        onPointsChange();
      } else {
        showMessage(data.message || 'Failed to claim reward', true);
      }
    } catch (err) {
      showMessage('Network error, please try again', true);
    } finally {
      setRewardClaiming(false);
    }
  };

  const handleClaimSubscriptionReward = async () => {
    setRewardClaiming(true);
    try {
      const response = await fetch('/api/email/claim-subscription-reward', {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(`Successfully claimed ${data.points} points!`);
        setSubscription(prev => prev ? { ...prev, subscriptionRewardClaimed: true } : null);
        onPointsChange();
      } else {
        showMessage(data.message || 'Failed to claim reward', true);
      }
    } catch (err) {
      showMessage('Network error, please try again', true);
    } finally {
      setRewardClaiming(false);
    }
  };

  const subscriptionOptions = [
    { key: 'sub_daily_fortune' as const, label: '每日运势提醒', icon: Bell },
    { key: 'sub_monthly_fortune' as const, label: '月度运势提醒', icon: Bell },
    { key: 'sub_yearly_fortune' as const, label: '年度运势提醒', icon: Bell },
    { key: 'sub_birthday_reminder' as const, label: '农历生日提醒', icon: Gift },
    { key: 'sub_low_points' as const, label: '积分不足提醒', icon: AlertCircle },
    { key: 'sub_feature_updates' as const, label: '功能更新通知', icon: Check },
    { key: 'sub_promotions' as const, label: '活动促销通知', icon: Gift },
  ];

  const hasAnySubscription = subscription && Object.values(subscription.subscriptions).some(v => v);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      {successMessage && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{errorMessage}</span>
        </div>
      )}

      {/* Email Verification Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          邮箱验证状态
        </h3>

        {subscription?.emailVerified ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">邮箱已验证</span>
            </div>

            {!subscription.bindingRewardClaimed && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">验证奖励可领取</span>
                  </div>
                  <button
                    onClick={handleClaimBindingReward}
                    disabled={rewardClaiming}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                  >
                    {rewardClaiming ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        领取中...
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4" />
                        领取 1000 点
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">邮箱未验证</span>
            </div>

            <button
              onClick={handleSendVerification}
              disabled={verificationSending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
            >
              {verificationSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  发送中...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  发送验证邮件
                </>
              )}
            </button>

            <p className="text-xs text-gray-500">
              验证邮箱后可获得 1000 积分奖励
            </p>
          </div>
        )}
      </div>

      {/* Subscription Options */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          订阅设置
        </h3>

        <div className="space-y-3">
          {subscriptionOptions.map(option => {
            const Icon = option.icon;
            const isEnabled = subscription?.subscriptions[option.key] || false;

            return (
              <div
                key={option.key}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">{option.label}</span>
                </div>

                <button
                  onClick={() => handleToggleSubscription(option.key)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                    isEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscription Reward */}
      {hasAnySubscription && !subscription?.subscriptionRewardClaimed && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-gray-900">订阅奖励</h4>
                <p className="text-sm text-gray-600">感谢您订阅邮件通知</p>
              </div>
            </div>

            <button
              onClick={handleClaimSubscriptionReward}
              disabled={rewardClaiming}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium whitespace-nowrap"
            >
              {rewardClaiming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  领取中...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  领取 1000 点
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">邮件订阅说明</p>
            <ul className="space-y-1 text-blue-800 list-disc list-inside">
              <li>您可以随时开启或关闭任何订阅</li>
              <li>我们尊重您的隐私，不会向第三方共享您的邮箱</li>
              <li>验证邮箱和订阅均可获得积分奖励</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSubscriptionManager;
