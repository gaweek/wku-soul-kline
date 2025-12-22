import React from 'react';
import { DollarSign, TrendingUp, Building2, Award, Briefcase } from 'lucide-react';
import { CelebrityFinancialData, CelebrityHonor } from '../../types';

interface CelebrityFinancialCardProps {
  financialData?: CelebrityFinancialData | null;
  honors?: CelebrityHonor[];
  celebrityName: string;
  isCompany?: boolean;
  className?: string;
}

const CelebrityFinancialCard: React.FC<CelebrityFinancialCardProps> = ({
  financialData,
  honors = [],
  celebrityName,
  isCompany = false,
  className = ''
}) => {
  const hasFinancialData = financialData && (
    financialData.netWorth ||
    financialData.marketCap ||
    financialData.stockPrice ||
    financialData.peakNetWorth
  );

  const hasHonors = honors && honors.length > 0;

  if (!hasFinancialData && !hasHonors) {
    return null;
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          {isCompany ? (
            <Building2 className="w-6 h-6" />
          ) : (
            <DollarSign className="w-6 h-6" />
          )}
          <div>
            <h3 className="font-bold text-lg">{isCompany ? '企业数据' : '财富数据'}</h3>
            <p className="text-emerald-200 text-sm">{celebrityName}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Financial Stats Grid */}
        {hasFinancialData && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {financialData.netWorth && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs text-emerald-600 font-medium">
                    {isCompany ? '估值' : '净资产'}
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-800">{financialData.netWorth}</p>
              </div>
            )}

            {financialData.marketCap && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">市值</span>
                </div>
                <p className="text-lg font-bold text-gray-800">{financialData.marketCap}</p>
              </div>
            )}

            {financialData.stockPrice && (
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-xs text-purple-600 font-medium">股价</span>
                </div>
                <p className="text-lg font-bold text-gray-800">{financialData.stockPrice}</p>
              </div>
            )}

            {financialData.peakNetWorth && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span className="text-xs text-amber-600 font-medium">巅峰财富</span>
                </div>
                <p className="text-lg font-bold text-gray-800">{financialData.peakNetWorth}</p>
              </div>
            )}
          </div>
        )}

        {/* Major Holdings */}
        {financialData?.majorHoldings && financialData.majorHoldings.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-700">主要持股/资产</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {financialData.majorHoldings.map((holding, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {holding}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Honors Section */}
        {hasHonors && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-amber-600" />
              <h4 className="font-medium text-gray-700">荣誉成就</h4>
            </div>
            <div className="space-y-2">
              {honors.slice(0, 5).map((honor, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm">{honor.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      {honor.year && <span>{honor.year}年</span>}
                      {honor.category && (
                        <>
                          <span>·</span>
                          <span>{honor.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {honors.length > 5 && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  还有 {honors.length - 5} 项荣誉...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CelebrityFinancialCard;
