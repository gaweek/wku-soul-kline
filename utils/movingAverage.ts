/**
 * Moving Average Calculation Utilities
 * For use in K-line charts to show trend lines
 */

import { KLinePoint } from '../types';

/**
 * Calculate Simple Moving Average (SMA)
 * @param data - Array of KLinePoint data
 * @param period - Number of periods for averaging
 * @returns Array of MA values (null for initial periods where MA can't be calculated)
 */
export function calculateMA(data: KLinePoint[], period: number): (number | null)[] {
  return data.map((_, index) => {
    if (index < period - 1) return null;
    const slice = data.slice(index - period + 1, index + 1);
    const sum = slice.reduce((acc, d) => acc + d.score, 0);
    return Math.round((sum / period) * 10) / 10;
  });
}

/**
 * Calculate Exponential Moving Average (EMA)
 * More responsive to recent price changes
 * @param data - Array of KLinePoint data
 * @param period - Number of periods for averaging
 * @returns Array of EMA values
 */
export function calculateEMA(data: KLinePoint[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);
  let ema: number | null = null;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      // First EMA is SMA
      const sum = data.slice(0, period).reduce((acc, d) => acc + d.score, 0);
      ema = sum / period;
      result.push(Math.round(ema * 10) / 10);
    } else {
      // EMA = (Close - Previous EMA) × Multiplier + Previous EMA
      ema = (data[i].score - ema!) * multiplier + ema!;
      result.push(Math.round(ema * 10) / 10);
    }
  }

  return result;
}

/**
 * Determine trend based on MA relationship
 * @param currentScore - Current period's score
 * @param ma5 - 5-period MA value
 * @param ma10 - 10-period MA value (optional)
 * @returns Trend description
 */
export function getTrendStatus(
  currentScore: number,
  ma5: number | null,
  ma10?: number | null
): {
  trend: 'bullish' | 'bearish' | 'neutral';
  description: string;
  signal: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
} {
  if (ma5 === null) {
    return {
      trend: 'neutral',
      description: '数据不足以计算趋势',
      signal: 'hold',
    };
  }

  const aboveMA5 = currentScore > ma5;
  const aboveMA10 = ma10 !== null && ma10 !== undefined ? currentScore > ma10 : null;
  const ma5AboveMA10 = ma10 !== null && ma10 !== undefined ? ma5 > ma10 : null;

  // Strong bullish: price above both MAs, MA5 above MA10
  if (aboveMA5 && aboveMA10 && ma5AboveMA10) {
    return {
      trend: 'bullish',
      description: '强势上升趋势，顺风顺水',
      signal: 'strong_buy',
    };
  }

  // Bullish: price above MA5
  if (aboveMA5 && (aboveMA10 === null || aboveMA10)) {
    return {
      trend: 'bullish',
      description: '上升趋势，运势向好',
      signal: 'buy',
    };
  }

  // Strong bearish: price below both MAs, MA5 below MA10
  if (!aboveMA5 && aboveMA10 === false && ma5AboveMA10 === false) {
    return {
      trend: 'bearish',
      description: '强势下降趋势，需谨慎行事',
      signal: 'strong_sell',
    };
  }

  // Bearish: price below MA5
  if (!aboveMA5) {
    return {
      trend: 'bearish',
      description: '下降趋势，运势走低',
      signal: 'sell',
    };
  }

  return {
    trend: 'neutral',
    description: '趋势不明，观望为主',
    signal: 'hold',
  };
}

/**
 * Find Golden Cross and Death Cross points
 * Golden Cross: MA5 crosses above MA10 (bullish signal)
 * Death Cross: MA5 crosses below MA10 (bearish signal)
 */
export function findCrossPoints(
  data: KLinePoint[],
  ma5: (number | null)[],
  ma10: (number | null)[]
): Array<{
  index: number;
  year: number;
  type: 'golden' | 'death';
  ma5Value: number;
  ma10Value: number;
}> {
  const crossPoints: Array<{
    index: number;
    year: number;
    type: 'golden' | 'death';
    ma5Value: number;
    ma10Value: number;
  }> = [];

  for (let i = 1; i < data.length; i++) {
    const prevMA5 = ma5[i - 1];
    const prevMA10 = ma10[i - 1];
    const currMA5 = ma5[i];
    const currMA10 = ma10[i];

    if (prevMA5 === null || prevMA10 === null || currMA5 === null || currMA10 === null) {
      continue;
    }

    // Golden Cross: MA5 was below MA10, now above
    if (prevMA5 < prevMA10 && currMA5 > currMA10) {
      crossPoints.push({
        index: i,
        year: data[i].year,
        type: 'golden',
        ma5Value: currMA5,
        ma10Value: currMA10,
      });
    }

    // Death Cross: MA5 was above MA10, now below
    if (prevMA5 > prevMA10 && currMA5 < currMA10) {
      crossPoints.push({
        index: i,
        year: data[i].year,
        type: 'death',
        ma5Value: currMA5,
        ma10Value: currMA10,
      });
    }
  }

  return crossPoints;
}

export default {
  calculateMA,
  calculateEMA,
  getTrendStatus,
  findCrossPoints,
};
