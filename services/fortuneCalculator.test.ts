import { FortuneCalculator, BaziData } from './fortuneCalculator';

// Sample Bazi data for testing
const sampleBazi: BaziData = {
  yearPillar: "甲子",   // 1984 - Wood Rat
  monthPillar: "丙寅",  // Wood Tiger month
  dayPillar: "戊午",    // Earth Horse day
  hourPillar: "庚申",   // Metal Monkey hour
  gender: "Male"
};

const fortuneCalculator = new FortuneCalculator();

// Example usage and testing
function demonstrateFortuneCalculator() {
  console.log("=== Life Kline Fortune Calculator Demo ===\n");

  // 1. Calculate Daily Fortune
  console.log("1. Daily Fortune Calculation:");
  const today = new Date();
  const dailyFortune = fortuneCalculator.calculateDaily(sampleBazi, today);
  console.log(`Date: ${dailyFortune.date}`);
  console.log(`Overall Score: ${dailyFortune.overall_score}/100`);
  console.log(`Career: ${dailyFortune.career.score} - ${dailyFortune.career.description}`);
  console.log(`Wealth: ${dailyFortune.wealth.score} - ${dailyFortune.wealth.description}`);
  console.log(`Relationship: ${dailyFortune.relationship.score} - ${dailyFortune.relationship.description}`);
  console.log(`Health: ${dailyFortune.health.score} - ${dailyFortune.health.description}`);
  console.log(`Lucky Numbers: ${dailyFortune.lucky_numbers.join(', ')}`);
  console.log(`Lucky Colors: ${dailyFortune.lucky_colors.join(', ')}`);
  console.log(`Auspicious Hours: ${dailyFortune.auspicious_hours.join(', ')}`);
  console.log(`Advice: ${dailyFortune.advice.join('; ')}\n`);

  // 2. Calculate Monthly Fortune
  console.log("2. Monthly Fortune Calculation:");
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const monthlyFortune = fortuneCalculator.calculateMonthly(sampleBazi, currentYear, currentMonth);
  console.log(`Year: ${monthlyFortune.year}, Month: ${monthlyFortune.month}`);
  console.log(`Theme: ${monthlyFortune.theme}`);
  console.log(`Overall Score: ${monthlyFortune.overall_score}/100`);
  console.log(`Career: ${monthlyFortune.career.score} - ${monthlyFortune.career.description}`);
  console.log(`Wealth: ${monthlyFortune.wealth.score} - ${monthlyFortune.wealth.description}`);
  console.log(`Key Dates:`);
  monthlyFortune.key_dates.forEach(date => {
    console.log(`  - ${date.date}: ${date.event} (${date.impact})`);
  });
  console.log(`Monthly Advice: ${monthlyFortune.monthly_advice.join('; ')}\n`);

  // 3. Calculate Yearly Fortune
  console.log("3. Yearly Fortune Calculation:");
  const yearlyFortune = fortuneCalculator.calculateYearly(sampleBazi, currentYear);
  console.log(`Year: ${yearlyFortune.year}`);
  console.log(`Overall Trend: ${yearlyFortune.overall_trend}`);
  console.log(`Overall Score: ${yearlyFortune.overall_score}/100`);
  console.log(`Favorable Months: ${yearlyFortune.favorable_months.join(', ')}`);
  console.log(`Challenging Months: ${yearlyFortune.challenging_months.join(', ')}`);
  console.log(`Key Moments:`);
  yearlyFortune.key_moments.forEach(moment => {
    console.log(`  - Month ${moment.month}: ${moment.event} (${moment.type}, ${moment.impact})`);
  });
  console.log(`Opportunities:`);
  yearlyFortune.opportunities.forEach(opp => {
    console.log(`  - Month ${opp.month}: ${opp.sector} (${opp.potential})`);
  });
  console.log(`Yearly Advice: ${yearlyFortune.yearly_advice.join('; ')}\n`);
}

// Run the demonstration
if (require.main === module) {
  demonstrateFortuneCalculator();
}

export { demonstrateFortuneCalculator, sampleBazi };