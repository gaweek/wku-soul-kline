declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromDate(date: Date): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getLunar(): Lunar;
    toYmd(): string;
    toString(): string;
  }

  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar;
    static fromDate(date: Date): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getTimeInGanZhi(): string;
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getSolar(): Solar;
    getYearInChinese(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    isLeapMonth(): boolean;
    toFullString(): string;
    toString(): string;
  }

  export class LunarYear {
    static fromYear(year: number): LunarYear;
    getYear(): number;
    getMonths(): LunarMonth[];
    getLeapMonth(): number;
  }

  export class LunarMonth {
    getYear(): number;
    getMonth(): number;
    isLeap(): boolean;
    getDayCount(): number;
  }
}
