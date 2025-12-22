/**
 * Calendar Export Service
 * Generates .ics files for adding Life Kline predictions to calendars
 */

import { createEvents, EventAttributes, DateArray } from 'ics';
import { TimelineEvent } from '../types';

export interface CalendarEventInput {
  title: string;
  description: string;
  year: number;
  month?: number;
  day?: number;
  url?: string;
  category?: string;
}

/**
 * Generate ICS content for a single event
 */
export async function generateICS(event: CalendarEventInput): Promise<string> {
  const startDate: DateArray = [
    event.year,
    event.month || 1,
    event.day || 1,
  ];

  const eventConfig: EventAttributes = {
    title: `Life Kline 预警: ${event.title}`,
    description: event.description,
    start: startDate,
    duration: { days: 1 },
    url: event.url || `/reminder/${event.year}`,
    categories: event.category ? [event.category] : ['Life Kline', '命理预测'],
    status: 'CONFIRMED',
    busyStatus: 'FREE',
    productId: 'Life Kline/ics',
    calName: 'Life Kline 命运提醒',
  };

  return new Promise((resolve, reject) => {
    createEvents([eventConfig], (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}

/**
 * Generate ICS content for multiple events
 */
export async function generateMultipleICS(events: CalendarEventInput[]): Promise<string> {
  const eventConfigs: EventAttributes[] = events.map((event) => {
    const startDate: DateArray = [
      event.year,
      event.month || 1,
      event.day || 1,
    ];

    return {
      title: `Life Kline 预警: ${event.title}`,
      description: event.description,
      start: startDate,
      duration: { days: 1 },
      url: event.url || `/reminder/${event.year}`,
      categories: event.category ? [event.category] : ['Life Kline', '命理预测'],
      status: 'CONFIRMED',
      busyStatus: 'FREE',
    };
  });

  return new Promise((resolve, reject) => {
    createEvents(eventConfigs, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}

/**
 * Convert TimelineEvent to CalendarEventInput
 */
export function timelineEventToCalendarEvent(
  event: TimelineEvent,
  baseUrl?: string
): CalendarEventInput {
  const categoryMap = {
    corporate: '商业事件',
    personal: '个人运势',
    market: '市场趋势',
  };

  return {
    title: event.title,
    description: `${event.description}\n\n来自 Life Kline 的 AI 命理预测\n预测类型: ${categoryMap[event.type]}\n情绪倾向: ${event.sentiment === 'positive' ? '积极' : event.sentiment === 'negative' ? '消极' : '中性'}`,
    year: event.year,
    month: event.month,
    url: baseUrl ? `${baseUrl}/reminder/${event.year}` : undefined,
    category: categoryMap[event.type],
  };
}

/**
 * Download ICS file to user's device
 */
export function downloadICS(icsContent: string, filename: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * One-click function to add a TimelineEvent to calendar
 */
export async function addToCalendar(
  event: TimelineEvent,
  userName?: string
): Promise<void> {
  const calendarEvent = timelineEventToCalendarEvent(event);
  const icsContent = await generateICS(calendarEvent);
  const filename = `life-kline-${userName || 'prediction'}-${event.year}${event.month ? `-${event.month}` : ''}.ics`;
  downloadICS(icsContent, filename);
}

/**
 * Add multiple future events to calendar
 */
export async function addMultipleToCalendar(
  events: TimelineEvent[],
  userName?: string
): Promise<void> {
  const calendarEvents = events.map((e) => timelineEventToCalendarEvent(e));
  const icsContent = await generateMultipleICS(calendarEvents);
  const filename = `life-kline-${userName || 'predictions'}-future-events.ics`;
  downloadICS(icsContent, filename);
}

export default {
  generateICS,
  generateMultipleICS,
  downloadICS,
  addToCalendar,
  addMultipleToCalendar,
  timelineEventToCalendarEvent,
};
