# Fortune Calculator Service

A comprehensive fortune calculation service for Life Kline that provides daily, monthly, and yearly fortune predictions based on Bazi (八字) astrology.

## Features

### Daily Fortune
- Overall score (1-100)
- Career, wealth, relationship, and health aspects
- Lucky numbers and colors
- Auspicious hours for important activities
- Personalized advice and warnings
- Based on daily Bazi interactions with personal chart

### Monthly Fortune
- Monthly themes and trends
- Key dates with event predictions
- Detailed aspect analysis
- Monthly advice based on elemental interactions

### Yearly Fortune
- Annual trend analysis (rising, declining, stable, volatile)
- Key moments and turning points
- Crisis periods with mitigation strategies
- Opportunities by sector
- Zodiac compatibility analysis
- Favorable and challenging months

## Usage

### Basic Setup

```typescript
import { FortuneCalculator, BaziData } from './services/fortuneCalculator';

const calculator = new FortuneCalculator();

// Define Bazi data
const bazi: BaziData = {
  yearPillar: "甲子",   // Year pillar
  monthPillar: "丙寅",  // Month pillar
  dayPillar: "戊午",    // Day pillar
  hourPillar: "庚申",   // Hour pillar
  gender: "Male"        // Gender
};
```

### Calculating Daily Fortune

```typescript
const today = new Date();
const dailyFortune = calculator.calculateDaily(bazi, today);

console.log(`Overall Score: ${dailyFortune.overall_score}`);
console.log(`Career: ${dailyFortune.career.score} - ${dailyFortune.career.description}`);
console.log(`Lucky Colors: ${dailyFortune.lucky_colors.join(', ')}`);
console.log(`Advice: ${dailyFortune.advice.join('; ')}`);
```

### Calculating Monthly Fortune

```typescript
const monthlyFortune = calculator.calculateMonthly(bazi, 2024, 12);
console.log(`Theme: ${monthlyFortune.theme}`);
console.log(`Key Events: ${monthlyFortune.key_dates.length}`);
```

### Calculating Yearly Fortune

```typescript
const yearlyFortune = calculator.calculateYearly(bazi, 2024);
console.log(`Trend: ${yearlyFortune.overall_trend}`);
console.log(`Opportunities: ${yearlyFortune.opportunities.length}`);
```

## Calculation Logic

The fortune calculator uses traditional Chinese metaphysical principles:

### Bazi Interactions
- **Heavenly Stems**: Analyze stem relationships (identical, clash, combination)
- **Earthly Branches**: Evaluate branch interactions and combinations
- **Five Elements**: Balance and interaction between Wood, Fire, Earth, Metal, Water
- **Yin/Yang Balance**: Harmonious interactions vs. conflicts

### Fortune Scoring
- **Base Score**: Determined by day master and current period interactions
- **Modifiers**: Applied based on:
  - Elemental relationships
  - Seasonal influences
  - Zodiac compatibility
  - Starmap interactions

### Elemental Analysis
- **Output Stars** (食伤): Career and expression
- **Wealth Stars** (财星): Financial opportunities
- **Power Stars** (官杀): Authority and status
- **Resource Stars** (印星): Support and learning

## Data Types

### BaziData
```typescript
interface BaziData {
  yearPillar: string;   // Format: "甲子" (Stem + Branch)
  monthPillar: string;  // Format: "丙寅"
  dayPillar: string;    // Format: "戊午"
  hourPillar: string;   // Format: "庚申"
  gender: 'Male' | 'Female';
}
```

### DailyFortune
```typescript
interface DailyFortune {
  date: string;
  overall_score: number;        // 1-100
  career: FortuneAspect;
  wealth: FortuneAspect;
  relationship: FortuneAspect;
  health: FortuneAspect;
  lucky_numbers: number[];
  lucky_colors: string[];
  advice: string[];
  auspicious_hours: string[];
  warnings: string[];
}
```

### MonthlyFortune
```typescript
interface MonthlyFortune {
  year: number;
  month: number;
  overall_score: number;
  theme: string;
  career: FortuneAspect;
  wealth: FortuneAspect;
  relationship: FortuneAspect;
  health: FortuneAspect;
  key_dates: KeyDate[];
  monthly_advice: string[];
  lucky_colors: string[];
  lucky_numbers: number[];
}
```

### YearlyFortune
```typescript
interface YearlyFortune {
  year: number;
  overall_trend: TrendType;
  overall_score: number;
  key_moments: KeyMoment[];
  crisis_times: CrisisPeriod[];
  opportunities: Opportunity[];
  analysis: YearlyAnalysis;
  zodiac_compatibility: ZodiacCompatibility;
  favorable_months: number[];
  challenging_months: number[];
  yearly_advice: string[];
}
```

## Integration with Life Kline

This calculator is designed to integrate with the Life Kline system:

1. **User Profiles**: Use existing Bazi data from user inputs
2. **K-Line Charts**: Fortune scores can influence K-line chart calculations
3. **Personalized Content**: Generate customized advice and predictions
4. **Timing Analysis**: Identify auspicious periods for important decisions

## Testing

Run the demonstration script:

```bash
cd /home/lifekline
npx ts-node services/fortuneCalculator.test.ts
```

## Dependencies

- `lunar-javascript`: Chinese calendar and Bazi calculations
- TypeScript/Node.js environment

## Best Practices

1. **Input Validation**: Always validate Bazi pillars before calculation
2. **Score Interpretation**:
   - 80-100: Excellent (大吉)
   - 60-79: Good (吉)
   - 40-59: Average (平)
   - 20-39: Poor (凶)
   - 1-19: Very Poor (大凶)
3. **Advice Context**: Provide actionable advice based on the scores
4. **Cultural Sensitivity**: Respect traditional principles while providing modern interpretations

## Notes

- The calculator provides probabilities and trends, not certainties
- Results should be used as guidance, not absolute predictions
- Personal free will and effort can influence outcomes
- Consult with professional advisors for major life decisions