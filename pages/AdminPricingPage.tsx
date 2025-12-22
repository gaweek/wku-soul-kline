import React, { useState, useEffect } from 'react';
import { DollarSign, Save, RefreshCw, Package, Zap, AlertCircle, CheckCircle, Loader2, TrendingUp } from 'lucide-react';

interface PricingFeature {
  id?: string;
  feature_key: string;
  points: number;
  price_usd: number;
  price_cny: number;
  display_name: string;
  category: string;
  is_active: boolean;
}

interface PointPackage {
  id: string;
  name: string;
  points: number;
  price_usd: number;
  price_cny: number;
  bonus: number;
  is_recommended: boolean;
  display_order: number;
}

const AdminPricingPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [features, setFeatures] = useState<PricingFeature[]>([]);
  const [packages, setPackages] = useState<PointPackage[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'features' | 'packages'>('features');

  // 加载定价数据
  const loadPricing = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/pricing');
      if (!response.ok) throw new Error('加载失败');

      const data = await response.json();
      setFeatures(data.features || []);
      setPackages(data.packages || []);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '加载失败' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPricing();
  }, []);

  // 保存功能定价
  const savePricing = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features }),
      });

      if (!response.ok) throw new Error('保存失败');

      const data = await response.json();
      setMessage({ type: 'success', text: `成功更新 ${data.updated} 项定价配置` });

      // 重新加载数据
      await loadPricing();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  // 保存积分套餐
  const savePackages = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/packages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packages }),
      });

      if (!response.ok) throw new Error('保存失败');

      const data = await response.json();
      setMessage({ type: 'success', text: `成功更新 ${data.updated} 个套餐` });

      // 重新加载数据
      await loadPricing();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  // 更新功能定价
  const updateFeature = (index: number, field: keyof PricingFeature, value: any) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [field]: value };
    setFeatures(updated);
  };

  // 更新套餐
  const updatePackage = (index: number, field: keyof PointPackage, value: any) => {
    const updated = [...packages];

    // 如果设置为推荐,取消其他推荐
    if (field === 'is_recommended' && value === true) {
      updated.forEach((pkg, i) => {
        if (i !== index) pkg.is_recommended = false;
      });
    }

    updated[index] = { ...updated[index], [field]: value };
    setPackages(updated);
  };

  // 计算总价值
  const calculateValue = (pkg: PointPackage) => {
    return pkg.points + pkg.bonus;
  };

  // 计算折扣百分比
  const calculateDiscount = (pkg: PointPackage) => {
    if (pkg.bonus === 0) return 0;
    return Math.round((pkg.bonus / pkg.points) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">定价管理</h1>
                <p className="text-gray-500">配置功能定价和积分套餐</p>
              </div>
            </div>

            <button
              onClick={loadPricing}
              className="px-4 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              刷新
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('features')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'features'
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Zap className="w-4 h-4 inline mr-2" />
              功能定价
              {activeTab === 'features' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'packages'
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              积分套餐
              {activeTab === 'packages' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
              )}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <span className="flex-1">{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">功能定价配置</h2>
              <button
                onClick={savePricing}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    保存中
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    保存配置
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={feature.feature_key} className="border border-gray-200 rounded-xl p-5 hover:border-indigo-200 transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* 功能名称 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        功能名称
                      </label>
                      <div className="px-3 py-2 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900">{feature.display_name}</div>
                        <div className="text-xs text-gray-500 mt-1">{feature.feature_key}</div>
                      </div>
                    </div>

                    {/* 积分消耗 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        积分消耗
                      </label>
                      <input
                        type="number"
                        value={feature.points}
                        onChange={(e) => updateFeature(index, 'points', parseInt(e.target.value) || 0)}
                        min={0}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    </div>

                    {/* 美元价格 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        美元价格 ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={feature.price_usd}
                        onChange={(e) => updateFeature(index, 'price_usd', parseFloat(e.target.value) || 0)}
                        min={0}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    </div>

                    {/* 人民币价格 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        人民币价格 (¥)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={feature.price_cny}
                        onChange={(e) => updateFeature(index, 'price_cny', parseFloat(e.target.value) || 0)}
                        min={0}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">积分套餐配置</h2>
              <button
                onClick={savePackages}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    保存中
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    保存套餐
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className={`border-2 rounded-xl p-6 transition-all ${
                    pkg.is_recommended
                      ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50'
                      : 'border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  {/* 推荐标签 */}
                  <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pkg.is_recommended}
                        onChange={(e) => updatePackage(index, 'is_recommended', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700">推荐套餐</span>
                    </label>
                    {pkg.is_recommended && (
                      <span className="px-2 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full">
                        推荐
                      </span>
                    )}
                  </div>

                  {/* 套餐名称 */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      套餐名称
                    </label>
                    <input
                      type="text"
                      value={pkg.name}
                      onChange={(e) => updatePackage(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>

                  {/* 基础积分 */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      基础积分
                    </label>
                    <input
                      type="number"
                      value={pkg.points}
                      onChange={(e) => updatePackage(index, 'points', parseInt(e.target.value) || 0)}
                      min={0}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>

                  {/* 赠送积分 */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      赠送积分
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={pkg.bonus}
                        onChange={(e) => updatePackage(index, 'bonus', parseInt(e.target.value) || 0)}
                        min={0}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                      {pkg.bonus > 0 && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-600 font-medium">
                          +{calculateDiscount(pkg)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 价格 */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        美元价格
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={pkg.price_usd}
                          onChange={(e) => updatePackage(index, 'price_usd', parseFloat(e.target.value) || 0)}
                          min={0}
                          className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        人民币价格
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                        <input
                          type="number"
                          step="0.01"
                          value={pkg.price_cny}
                          onChange={(e) => updatePackage(index, 'price_cny', parseFloat(e.target.value) || 0)}
                          min={0}
                          className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 预览卡片 */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {calculateValue(pkg).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {pkg.bonus > 0 ? (
                          <>
                            {pkg.points.toLocaleString()} + <span className="text-emerald-600 font-medium">{pkg.bonus}</span> 赠送
                          </>
                        ) : (
                          '积分'
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-2 text-lg font-bold text-indigo-600">
                        <TrendingUp className="w-5 h-5" />
                        ¥{pkg.price_cny}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">提示：</p>
            <ul className="space-y-1 text-blue-700">
              <li>• 修改定价后需要点击"保存配置"或"保存套餐"按钮才会生效</li>
              <li>• 积分消耗为0表示该功能免费</li>
              <li>• 推荐套餐会在前端高亮显示,建议只设置一个推荐套餐</li>
              <li>• 价格修改会立即对新购买用户生效,不影响已购买的用户</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPricingPage;
