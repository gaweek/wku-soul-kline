import React from 'react';
import {
  Rocket,
  Heart,
  GraduationCap,
  Briefcase,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Star,
  Baby,
  Home,
  Plane,
  DollarSign,
  Activity,
  Award,
  Zap,
  Circle,
  type LucideIcon
} from 'lucide-react';
import { TimelineEvent, TimelineEventSentiment } from '../../types';

// Icon mapping for timeline events
const iconMap: Record<string, LucideIcon> = {
  'rocket': Rocket,
  'heart': Heart,
  'graduation-cap': GraduationCap,
  'briefcase': Briefcase,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'alert-triangle': AlertTriangle,
  'star': Star,
  'baby': Baby,
  'home': Home,
  'plane': Plane,
  'dollar-sign': DollarSign,
  'activity': Activity,
  'award': Award,
  'zap': Zap,
  'circle': Circle,
};

// Sentiment color mapping
const sentimentColors: Record<TimelineEventSentiment, { bg: string; border: string; text: string }> = {
  positive: {
    bg: 'bg-emerald-100',
    border: 'border-emerald-400',
    text: 'text-emerald-700',
  },
  negative: {
    bg: 'bg-rose-100',
    border: 'border-rose-400',
    text: 'text-rose-700',
  },
  neutral: {
    bg: 'bg-gray-100',
    border: 'border-gray-400',
    text: 'text-gray-700',
  },
};

interface EventAnnotationProps {
  event: TimelineEvent;
  x: number;
  y: number;
  onClick?: (event: TimelineEvent) => void;
  onHover?: (event: TimelineEvent | null) => void;
}

// SVG-based Event Annotation for use in Recharts
export const EventAnnotationShape: React.FC<EventAnnotationProps> = ({
  event,
  x,
  y,
  onClick,
  onHover,
}) => {
  const IconComponent = iconMap[event.icon] || Circle;
  const isFuture = event.isFuture;

  // Color based on sentiment
  const fillColor = event.sentiment === 'positive'
    ? '#10B981' // emerald-500
    : event.sentiment === 'negative'
      ? '#F43F5E' // rose-500
      : '#6B7280'; // gray-500

  const strokeColor = event.sentiment === 'positive'
    ? '#047857' // emerald-700
    : event.sentiment === 'negative'
      ? '#BE123C' // rose-700
      : '#374151'; // gray-700

  return (
    <g
      transform={`translate(${x - 10}, ${y - 10})`}
      style={{ cursor: 'pointer' }}
      onClick={() => onClick?.(event)}
      onMouseEnter={() => onHover?.(event)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Background circle */}
      <circle
        cx={10}
        cy={10}
        r={12}
        fill={isFuture ? 'transparent' : fillColor}
        stroke={strokeColor}
        strokeWidth={isFuture ? 2 : 1}
        strokeDasharray={isFuture ? '4 2' : 'none'}
        opacity={0.9}
      />

      {/* Pulse animation for future events */}
      {isFuture && (
        <circle
          cx={10}
          cy={10}
          r={12}
          fill="none"
          stroke={fillColor}
          strokeWidth={2}
          opacity={0.5}
        >
          <animate
            attributeName="r"
            from="12"
            to="20"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="0.5"
            to="0"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Icon placeholder - render as small circle for now */}
      <circle
        cx={10}
        cy={10}
        r={4}
        fill={isFuture ? fillColor : 'white'}
      />
    </g>
  );
};

// React component for Event Tooltip Card
interface EventCardProps {
  event: TimelineEvent;
  position?: { x: number; y: number };
  onClose?: () => void;
  onAddToCalendar?: (event: TimelineEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  position,
  onClose,
  onAddToCalendar,
}) => {
  const colors = sentimentColors[event.sentiment];
  const IconComponent = iconMap[event.icon] || Circle;

  return (
    <div
      className={`absolute z-50 w-72 bg-white rounded-xl shadow-2xl border-2 ${colors.border} animate-fade-in`}
      style={position ? { left: position.x, top: position.y } : undefined}
    >
      {/* Header */}
      <div className={`${colors.bg} px-4 py-3 rounded-t-lg flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <IconComponent className={`w-5 h-5 ${colors.text}`} />
          <span className={`font-bold ${colors.text}`}>
            {event.year}年{event.month ? `${event.month}月` : ''}
          </span>
        </div>
        {event.isFuture && (
          <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full animate-pulse-glow">
            预测
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-bold text-gray-800 mb-2">{event.title}</h4>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          {event.description}
        </p>

        {/* Type badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2 py-1 rounded ${
            event.type === 'corporate' ? 'bg-blue-100 text-blue-700' :
            event.type === 'personal' ? 'bg-purple-100 text-purple-700' :
            'bg-orange-100 text-orange-700'
          }`}>
            {event.type === 'corporate' ? '商业' :
             event.type === 'personal' ? '个人' : '市场'}
          </span>

          {event.verificationStatus && (
            <span className={`text-xs px-2 py-1 rounded ${
              event.verificationStatus === 'verified' ? 'bg-green-100 text-green-700' :
              event.verificationStatus === 'unverified' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {event.verificationStatus === 'verified' ? '已验证' :
               event.verificationStatus === 'unverified' ? '未验证' : '待验证'}
            </span>
          )}
        </div>

        {/* Actions */}
        {event.isFuture && onAddToCalendar && (
          <button
            onClick={() => onAddToCalendar(event)}
            className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            添加到日历提醒
          </button>
        )}
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default EventAnnotationShape;
