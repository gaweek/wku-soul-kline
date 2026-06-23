import React, { useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import {
  AlertCircle,
  ArrowDown,
  CheckCircle2,
  Copy,
  Loader2,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Waves,
} from 'lucide-react';
import VibeLineChart from '../components/VibeLineChart';
import {
  analyzeVibeLine,
  analyzeVibeMatch,
  createInitialVibeLineAgentStatuses,
  VIBELINE_AGENT_NAMES,
} from '../services/vibelineService';
import {
  AudienceLens,
  VibeLineAgentStatusType,
  SoulKLineFactor,
  VibeLineAgentStatusMap,
  VibeLineAgentType,
  VibeLineInput,
  VibeLineResult,
  VibeLineVariant,
  VibeMatchResult,
} from '../types/vibeline';

gsap.registerPlugin(useGSAP, ScrollToPlugin);

type Mode = 'single' | 'match';

const VIBE_AGENT_ORDER: VibeLineAgentType[] = [
  'persona_asset',
  'resonance_factor',
  'lifecycle_kline',
  'audience_market',
  'narrative_packaging',
  'safety_authenticity',
];

const createAgentStatusSnapshot = (
  statusByType: Partial<Record<VibeLineAgentType, VibeLineAgentStatusType>> = {}
): VibeLineAgentStatusMap => {
  const next = createInitialVibeLineAgentStatuses();
  VIBE_AGENT_ORDER.forEach((type) => {
    next[type] = {
      ...next[type],
      status: statusByType[type] || next[type].status,
    };
  });
  return next;
};

const MATCH_AGENT_PHASES: Record<'start' | 'preview' | 'match' | 'complete', Partial<Record<VibeLineAgentType, VibeLineAgentStatusType>>> = {
  start: {
    persona_asset: 'running',
    resonance_factor: 'running',
  },
  preview: {
    persona_asset: 'completed',
    resonance_factor: 'completed',
    lifecycle_kline: 'running',
    audience_market: 'running',
  },
  match: {
    persona_asset: 'completed',
    resonance_factor: 'completed',
    lifecycle_kline: 'completed',
    audience_market: 'completed',
    narrative_packaging: 'running',
    safety_authenticity: 'running',
  },
  complete: {
    persona_asset: 'completed',
    resonance_factor: 'completed',
    lifecycle_kline: 'completed',
    audience_market: 'completed',
    narrative_packaging: 'completed',
    safety_authenticity: 'completed',
  },
};

interface ProfileFormState {
  draft: string;
  birthday: string;
  gender: string;
  mbti: string;
  sbti: string;
  interestText: string;
  mood: string;
  socialProblem: string;
}

const MBTI_OPTIONS = [
  '',
  'INTJ',
  'INTP',
  'ENTJ',
  'ENTP',
  'INFJ',
  'INFP',
  'ENFJ',
  'ENFP',
  'ISTJ',
  'ISFJ',
  'ESTJ',
  'ESFJ',
  'ISTP',
  'ISFP',
  'ESTP',
  'ESFP',
];

const SBTI_OPTIONS = [
  '',
  '慢热观察型',
  '灵感共振型',
  '陪伴稳定型',
  '边界清晰型',
  '主动破冰型',
  '兴趣探索型',
];

const GENDER_OPTIONS = [
  '',
  '女',
  '男',
  '非二元',
  '暂不透露',
];

const singleSamples: Array<ProfileFormState & { label: string }> = [
  {
    label: '慢热深聊型',
    draft: '我是一个慢热的人，喜欢独立音乐、电影和夜晚散步。刚认识时话不多，但熟起来后会认真听，也会分享很多奇怪的小观察。',
    birthday: '2001-11-08',
    gender: '暂不透露',
    mbti: 'INFP',
    sbti: '慢热观察型',
    interestText: '独立音乐、电影、夜晚散步',
    mood: '想认识能慢慢聊起来的同频朋友',
    socialProblem: '刚开始聊天时不知道怎么发出第一句话，怕显得太冷淡。',
  },
  {
    label: '游戏同好型',
    draft: '平时喜欢独立游戏、Steam、剧情向作品，也喜欢把生活里的小事讲得像游戏支线。不太会热场，但很容易因为一个共同兴趣聊很久。',
    birthday: '1999-06-12',
    gender: '男',
    mbti: 'INTP',
    sbti: '兴趣探索型',
    interestText: '独立游戏、Steam、剧情向作品',
    mood: '想遇到能自然接话的游戏同好',
    socialProblem: '话题一旦离开游戏就容易断，不知道怎么延展到生活。',
  },
  {
    label: '城市夜聊型',
    draft: '喜欢城市里的夜风、通勤时循环的歌、深夜突然想到的一句话。不是特别外向，但很容易被细腻和有生活感的人吸引。',
    birthday: '2000-05-03',
    gender: '女',
    mbti: 'ENFJ',
    sbti: '陪伴稳定型',
    interestText: '城市生活、音乐、情绪日记',
    mood: '想被懂，但不想用力社交',
    socialProblem: '容易把表达写得太含蓄，别人不知道该怎么接。',
  },
];

const lifecycleStages = [
  { label: '眼缘停留', detail: '第一眼愿不愿意停下' },
  { label: '想再看看', detail: '是否想继续了解你' },
  { label: '第一句话', detail: '评论或私信是否自然' },
  { label: '同频点亮', detail: '共同话题被点亮' },
  { label: '慢慢深聊', detail: '进入持续交流' },
  { label: '再次想起', detail: '之后还会想找你' },
];

const previewDeliverables = [
  '18 节点连接 K 线',
  '被懂信号与错频提醒',
  '可复制的表达短评',
];

const modeTabs: Array<{
  value: Mode;
  choiceTitle: string;
  title: string;
  subtitle: string;
  body: string;
  tags: string[];
}> = [
  {
    value: 'single',
    choiceTitle: '我想分析自己',
    title: 'Who Know U',
    subtitle: '个人连接',
    body: '看见我如何被陌生人注意、靠近、再次想起。',
    tags: ['1 人样本', '自我表达', '谁懂你'],
  },
  {
    value: 'match',
    choiceTitle: '我想分析我和 TA',
    title: 'Who Know Us',
    subtitle: '双人共振',
    body: '看见两个人哪里同频、哪里错频、怎么自然开场。',
    tags: ['2 人样本', '关系共振', '如何靠近'],
  },
];

const scoreGuideItems = [
  {
    title: '连接/共振分',
    body: '当前能不能继续靠近：分越高，越适合顺着话题继续聊。',
  },
  {
    title: '变化',
    body: '比一开始变顺还是变难：正数是变顺，负数是容易掉线。',
  },
  {
    title: '被懂上限',
    body: '这段样本最好能被接住到哪里：不是人格评分，只看这次表达。',
  },
];

const scoreBands = [
  {
    range: '0-49',
    label: '先降压',
    body: '容易错频，先换轻一点的表达，不急着推进。',
    tone: 'low',
  },
  {
    range: '50-69',
    label: '先找话题',
    body: '有机会，但需要更具体的兴趣、问题或共同点接住。',
    tone: 'mid',
  },
  {
    range: '70-100',
    label: '可以继续',
    body: '更容易被接住，可以顺着当前话题往下聊。',
    tone: 'high',
  },
];

const parseInterests = (text: string) => {
  return text
    .split(/[,，、\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
};

const calculateZodiacSign = (birthday = '') => {
  const match = birthday.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  const code = Number(match[2]) * 100 + Number(match[3]);
  if (code >= 321 && code <= 419) return '白羊座';
  if (code >= 420 && code <= 520) return '金牛座';
  if (code >= 521 && code <= 621) return '双子座';
  if (code >= 622 && code <= 722) return '巨蟹座';
  if (code >= 723 && code <= 822) return '狮子座';
  if (code >= 823 && code <= 922) return '处女座';
  if (code >= 923 && code <= 1023) return '天秤座';
  if (code >= 1024 && code <= 1122) return '天蝎座';
  if (code >= 1123 && code <= 1221) return '射手座';
  if (code >= 1222 || code <= 119) return '摩羯座';
  if (code >= 120 && code <= 218) return '水瓶座';
  if (code >= 219 && code <= 320) return '双鱼座';
  return '';
};

const profileToInput = (profile: ProfileFormState): VibeLineInput => ({
  draft: profile.draft,
  interests: parseInterests(profile.interestText),
  mood: profile.mood,
  platform: 'Soul',
  birthday: profile.birthday,
  zodiac: calculateZodiacSign(profile.birthday),
  gender: profile.gender,
  mbti: profile.mbti,
  sbti: profile.sbti,
  socialProblem: profile.socialProblem,
  tone: '真实、有记忆点、不要用力过猛',
  boundary: '仅做兴趣社交中的自我表达参考',
});

const updateProfile = (
  setter: React.Dispatch<React.SetStateAction<ProfileFormState>>,
  key: keyof ProfileFormState,
  value: string
) => {
  setter((prev) => ({ ...prev, [key]: value }));
};

const getGenerationScrollMessage = (mode: Mode) => (
  mode === 'single'
    ? '正在生成 Who Know U 预览盘，已为你滑到读盘位置。'
    : '正在生成 Who Know Us 共振预览盘，已为你滑到读盘位置。'
);

const panelClass = 'wku-panel';
const labelClass = 'mb-2 block text-[13px] font-bold text-slate-700';
const fieldClass = 'wku-input';
const MiniKLine: React.FC<{ active: boolean; match?: boolean }> = ({ active, match }) => (
  <svg className="wku-lens-sparkline" viewBox="0 0 154 54" aria-hidden="true">
    <path
      d={match ? 'M10 36 C28 22, 42 30, 58 22 C76 12, 92 34, 110 20 C126 8, 136 18, 146 10' : 'M10 38 C30 30, 42 33, 58 25 C78 14, 92 30, 108 20 C126 9, 138 14, 146 8'}
      fill="none"
      stroke={active ? '#67e8f9' : '#94a3b8'}
      strokeLinecap="round"
      strokeWidth="4"
    />
    {match && (
      <path
        d="M10 20 C28 28, 42 18, 58 30 C78 42, 94 18, 110 30 C126 40, 138 24, 146 32"
        fill="none"
        stroke={active ? '#a3e635' : '#cbd5e1'}
        strokeLinecap="round"
        strokeWidth="2.5"
        strokeDasharray="5 6"
      />
    )}
  </svg>
);

const HeroModeSwitch: React.FC<{
  mode: Mode;
  onSelectMode: (mode: Mode) => void;
}> = ({ mode, onSelectMode }) => (
  <div className="wku-hero-mode-switch" role="tablist" aria-label="快速选择分析模式">
    {modeTabs.map((item) => {
      const active = mode === item.value;
      return (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={active}
          aria-label={`切换到${item.subtitle}模式`}
          onClick={() => onSelectMode(item.value)}
          className={`wku-hero-mode-button wku-clickable ${active ? 'is-active' : ''}`}
        >
          <span>
            <strong>{item.title}</strong>
            <small>{item.value === 'match' ? '双人模式 · 看我和 TA' : '单人模式 · 看我自己'}</small>
          </span>
          <span className="wku-hero-mode-action">{active ? '当前模式' : '点击切换'}</span>
        </button>
      );
    })}
    <p className="wku-hero-mode-hint">想看两个人的共振关系，请选择 Who Know Us 双人模式。</p>
  </div>
);

const ModeChoiceCards: React.FC<{
  mode: Mode;
  onChange: (mode: Mode) => void;
}> = ({ mode, onChange }) => {
  const activeMode = modeTabs.find((item) => item.value === mode) ?? modeTabs[0];

  return (
    <div className="wku-mode-choice-panel is-compact">
      <div className="wku-mode-choice-head">
        <div>
          <p className="text-xs font-black text-teal-700">模式切换</p>
          <h3 className="mt-1 text-base font-black text-slate-950">当前：{activeMode.title}</h3>
        </div>
        <span>支持单人读盘 / 双人共振</span>
      </div>
      <div className="wku-mode-compact-row">
        <div className="wku-mode-segment" role="tablist" aria-label="模式切换">
          {modeTabs.map((item) => {
            const active = mode === item.value;
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChange(item.value)}
                className={`wku-mode-segment-button wku-clickable ${active ? 'is-active' : ''}`}
              >
                <span>{item.value === 'single' ? '单人模式' : '双人模式'}</span>
                <b>{item.title}</b>
              </button>
            );
          })}
        </div>
        <p className="wku-mode-current-copy">{activeMode.body}</p>
      </div>
    </div>
  );
};

const ScoreGuide: React.FC = () => (
  <div className="wku-score-guide" aria-label="分数怎么读">
    <div className="wku-score-section">
      <div className="wku-score-section-title">
        <span>当前模式</span>
        <b>0-100 连接读盘</b>
      </div>
      <p className="wku-score-section-copy">不是给人打分，只告诉你这段表达现在适合怎么聊。</p>
    </div>

    <div className="wku-score-section">
      <div className="wku-score-section-title">
        <span>读分口诀</span>
        <b>先看颜色，再看动作</b>
      </div>
      <div className="wku-score-meter" aria-hidden="true">
        {scoreBands.map((band) => (
          <span key={band.range} className={`is-${band.tone}`}>
            <b>{band.range}</b>
            {band.label}
          </span>
        ))}
      </div>
      <div className="wku-score-band-grid">
        {scoreBands.map((band) => (
          <div key={band.range} className={`wku-score-band is-${band.tone}`}>
            <b>{band.label}</b>
            <p>{band.body}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="wku-score-section">
      <div className="wku-score-section-title">
        <span>三个指标</span>
        <b>看哪一类分</b>
      </div>
      <div className="wku-score-guide-grid" aria-label="指标含义">
        {scoreGuideItems.map((item) => (
          <div key={item.title} className="wku-score-guide-item">
            <b>{item.title}</b>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const FormField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
}> = ({ label, value, onChange, placeholder, textarea, rows = 3 }) => (
  <label className="block">
    <span className={labelClass}>{label}</span>
    {textarea ? (
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`${fieldClass} resize-none px-3 py-3 leading-6`}
      />
    ) : (
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`${fieldClass} h-11 px-3`}
      />
    )}
  </label>
);

const ProfileForm: React.FC<{
  title: string;
  profile: ProfileFormState;
  onChange: (key: keyof ProfileFormState, value: string) => void;
  compact?: boolean;
  tone?: 'single' | 'self' | 'partner';
}> = ({ title, profile, onChange, compact, tone = 'single' }) => {
  const zodiac = calculateZodiacSign(profile.birthday);
  const completedFields = [
    profile.draft,
    profile.birthday,
    profile.gender,
    profile.mbti,
    profile.sbti,
    profile.interestText,
    profile.mood,
    profile.socialProblem,
  ].filter((item) => item.trim().length > 0).length;

  return (
    <div className={`${panelClass} wku-profile-form wku-profile-${tone} overflow-hidden`}>
      <div className="wku-panel-header px-4 py-4 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-cyan-200">输入样本</p>
            <h3 className="mt-1 text-base font-black">{title}</h3>
          </div>
          <span className="rounded-md bg-white/12 px-2 py-1 text-xs font-bold text-white">
            {zodiac || '星座待计算'}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-cyan-300 transition-all"
              style={{ width: `${Math.round((completedFields / 8) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-black text-white">{completedFields}/8</span>
        </div>
      </div>

      <div className="grid gap-3 p-4">
        <FormField
          label="自我介绍 / 常发动态"
          value={profile.draft}
          onChange={(value) => onChange('draft', value)}
          textarea
          rows={compact ? 3 : 5}
          placeholder="写一段你在 Soul 上会展示的真实状态"
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>生日</span>
            <input
              type="date"
              value={profile.birthday}
              onChange={(event) => onChange('birthday', event.target.value)}
              className={`${fieldClass} h-11 px-3`}
            />
          </label>

          <label className="block">
            <span className={labelClass}>性别</span>
            <select
              value={profile.gender}
              onChange={(event) => onChange('gender', event.target.value)}
              className={`${fieldClass} h-11 px-3`}
            >
              {GENDER_OPTIONS.map((option) => (
                <option key={option || 'empty'} value={option}>
                  {option || '未选择'}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>MBTI</span>
            <select
              value={profile.mbti}
              onChange={(event) => onChange('mbti', event.target.value)}
              className={`${fieldClass} h-11 px-3`}
            >
              {MBTI_OPTIONS.map((option) => (
                <option key={option || 'empty'} value={option}>
                  {option || '未选择'}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={labelClass}>SBTI</span>
            <select
              value={profile.sbti}
              onChange={(event) => onChange('sbti', event.target.value)}
              className={`${fieldClass} h-11 px-3`}
            >
              {SBTI_OPTIONS.map((option) => (
                <option key={option || 'empty'} value={option}>
                  {option || '未选择'}
                </option>
              ))}
            </select>
          </label>
        </div>

        <FormField
          label="个人兴趣"
          value={profile.interestText}
          onChange={(value) => onChange('interestText', value)}
          placeholder="独立音乐、电影、夜晚散步"
        />

        <FormField
          label="当前社交状态"
          value={profile.mood}
          onChange={(value) => onChange('mood', value)}
          placeholder="想认识什么样的人，或现在处在什么社交状态"
        />

        <FormField
          label="最近社交中遇到的问题"
          value={profile.socialProblem}
          onChange={(value) => onChange('socialProblem', value)}
          textarea
          rows={compact ? 2 : 3}
          placeholder="比如第一句话不知道怎么发、容易冷场、被误解为冷淡"
        />
      </div>
    </div>
  );
};

const AgentRow: React.FC<{
  type: VibeLineAgentType;
  statusMap: VibeLineAgentStatusMap;
}> = ({ type, statusMap }) => {
  const item = statusMap[type];
  const statusStyle = {
    pending: 'border-slate-200 bg-slate-50 text-slate-600',
    running: 'border-cyan-200 bg-cyan-50/80 text-cyan-900',
    completed: 'border-teal-200 bg-teal-50 text-teal-700',
    failed: 'border-amber-200 bg-amber-50 text-amber-700',
  }[item.status];
  const statusLabel = {
    pending: '等待',
    running: '运行中',
    completed: '完成',
    failed: '需重试',
  }[item.status];

  return (
    <div className={`relative flex min-h-[42px] items-center justify-between overflow-hidden rounded-lg border px-3 py-2 ${statusStyle}`}>
      <span className="text-sm font-semibold">{VIBELINE_AGENT_NAMES[type] || item.name}</span>
      <div className="flex items-center gap-2 text-xs">
        {item.status === 'running' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {item.status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5" />}
        {item.status === 'failed' && <AlertCircle className="h-3.5 w-3.5" />}
        <span>{item.elapsed || statusLabel}</span>
      </div>
      {item.status === 'running' && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 animate-pulse bg-teal-400/70" />
      )}
    </div>
  );
};

const AgentConsole: React.FC<{
  statusMap: VibeLineAgentStatusMap;
  completedCount: number;
  progress: string;
  mode: Mode;
}> = ({ statusMap, completedCount, progress, mode }) => (
  <div className="wku-agent-console">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-black text-teal-700">WKU Agent 工作台</p>
        <h2 className="mt-1 text-base font-black text-slate-950">
          {mode === 'single' ? '读懂样本的 6 个步骤' : '读懂关系的 6 个步骤'}
        </h2>
      </div>
      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
        {completedCount}/6
      </span>
    </div>
    <div className="space-y-2">
      {(Object.keys(statusMap) as VibeLineAgentType[]).map((type) => (
        <AgentRow key={type} type={type} statusMap={statusMap} />
      ))}
    </div>
    <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-xs font-semibold leading-5 text-slate-700">{progress}</p>
  </div>
);

const AgentHandoffCard: React.FC<{
  completedCount: number;
  progress: string;
  mode: Mode;
  onJump: () => void;
}> = ({ completedCount, progress, mode, onJump }) => (
  <div className="wku-agent-handoff">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-black text-teal-700">进度已同步到预览盘</p>
        <h2 className="mt-1 text-base font-black text-slate-950">
          {mode === 'single' ? 'Who Know U 正在生成' : 'Who Know Us 正在生成'}
        </h2>
      </div>
      <span>{completedCount}/6</span>
    </div>
    <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{progress}</p>
    <button type="button" onClick={onJump} className="wku-view-result-button wku-clickable mt-4 w-full">
      查看生成进度
      <ArrowDown className="h-4 w-4" />
    </button>
  </div>
);

const ScoreBadge: React.FC<{
  label: string;
  value: string | number;
  help: string;
  tone: 'boost' | 'risk' | 'sync' | 'stage';
}> = ({ label, value, help, tone }) => (
  <span className={`wku-score-badge is-${tone}`}>
    <span>{label}</span>
    <b>{value}</b>
    <small>{help}</small>
  </span>
);

const FactorCard: React.FC<{
  factor: SoulKLineFactor;
  type: 'up' | 'down';
}> = ({ factor, type }) => {
  const isUp = type === 'up';
  return (
    <article className={`${panelClass} p-4`}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="text-sm font-black text-slate-950">{factor.title}</h3>
        <ScoreBadge
          label={isUp ? '助推分' : '风险分'}
          value={isUp ? `+${factor.impact ?? 0}` : `-${factor.risk ?? 0}`}
          help={isUp ? '越高越适合保留' : '越高越需要修正'}
          tone={isUp ? 'boost' : 'risk'}
        />
      </div>
      <p className="text-xs font-semibold leading-5 text-slate-600">依据：{factor.evidence}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{factor.suggestion}</p>
    </article>
  );
};

const SoulmateCard: React.FC<{ lens: AudienceLens }> = ({ lens }) => (
  <article className={`${panelClass} p-4`}>
    <div className="mb-2 flex items-start justify-between gap-3">
      <h3 className="text-sm font-black text-slate-950">{lens.type}</h3>
      <ScoreBadge
        label="同频分"
        value={lens.resonance}
        help="越高越容易接住你"
        tone="sync"
      />
    </div>
    <p className="text-sm leading-6 text-slate-700">{lens.why}</p>
    <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs font-semibold leading-5 text-slate-700">{lens.likelyReply}</p>
  </article>
);

const ShareCard: React.FC<{
  card: VibeLineVariant;
  copiedId: string;
  onCopy: (card: VibeLineVariant) => void;
}> = ({ card, copiedId, onCopy }) => (
  <article className={`${panelClass} p-4`}>
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <h3 className="text-sm font-black text-slate-950">{card.title}</h3>
        <p className="text-xs font-semibold text-slate-600">{card.tone} / {card.bestFor}</p>
      </div>
      <button
        type="button"
        onClick={() => onCopy(card)}
        className="wku-clickable inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200"
        title="复制"
      >
        {copiedId === card.id ? <CheckCircle2 className="h-4 w-4 text-teal-600" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
    <p className="text-sm leading-6 text-slate-700">{card.text}</p>
  </article>
);

const ResultPreviewPanel: React.FC<{ mode: Mode }> = ({ mode }) => {
  const isMatch = mode === 'match';
  const items = isMatch
    ? [
        ['共振 K 线', '看两个人从互相注意到余温回访的靠近走势'],
        ['错频节点', '识别哪里容易误读，哪里适合慢慢靠近'],
        ['阶段建议', '每个阶段给出不压迫的交流建议'],
      ]
    : [
        ['连接 K 线', '看你在不同社交阶段的吸引与留存'],
        ['谁懂你', '找到更容易接住你表达的人群线索'],
        ['表达文案', '生成可以直接复制或分享的连接短评'],
      ];

  return (
    <div className="wku-soft-rise rounded-xl border border-dashed border-slate-300 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-950">
            {isMatch ? '你们的 Who Know Us 会在这里生成' : '你的 Who Know U 会在这里生成'}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
            样本准备好后点击生成。系统会先给出 K 线，再把每个结果拆成能行动、能分享、能复盘的内容。
          </p>
        </div>
        <span className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white">
          {isMatch ? '双人共振' : '个人连接'}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {items.map(([title, body]) => (
          <div key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-950">{title}</p>
            <p className="mt-2 text-xs leading-5 text-slate-700">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const VibeLinePage: React.FC = () => {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const resultSectionRef = useRef<HTMLElement | null>(null);
  const [mode, setMode] = useState<Mode>('single');
  const [singleProfile, setSingleProfile] = useState<ProfileFormState>(singleSamples[0]);
  const [personA, setPersonA] = useState<ProfileFormState>(singleSamples[0]);
  const [personB, setPersonB] = useState<ProfileFormState>(singleSamples[2]);
  const [relationshipGoal, setRelationshipGoal] = useState('想知道我们从哪里更容易自然靠近，以及哪里容易错频');
  const [result, setResult] = useState<VibeLineResult | null>(null);
  const [matchResult, setMatchResult] = useState<VibeMatchResult | null>(null);
  const [agentStatuses, setAgentStatuses] = useState<VibeLineAgentStatusMap>(createInitialVibeLineAgentStatuses);
  const [progress, setProgress] = useState('等待生成你的 WKU soul-kline');
  const [loading, setLoading] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);
  const [error, setError] = useState('');
  const [matchError, setMatchError] = useState('');
  const [copiedId, setCopiedId] = useState('');
  const [scrollIntent, setScrollIntent] = useState<Mode | null>(null);
  const { contextSafe } = useGSAP({ scope: pageRef });

  const singleInput = useMemo(() => profileToInput(singleProfile), [singleProfile]);
  const canSubmit = singleInput.draft.trim().length >= 12 && !loading;
  const canMatch = personA.draft.trim().length >= 12 && personB.draft.trim().length >= 12 && !matchLoading;
  const completedCount = Object.values(agentStatuses).filter((item) => item.status === 'completed').length;
  const modeMeta = mode === 'single'
    ? {
        name: 'Who Know U',
        short: '个人连接',
        description: '看见你在兴趣社交里哪里容易被懂，哪里容易被错过。',
      }
    : {
        name: 'Who Know Us',
        short: '双人共振',
        description: '看见两个人如何靠近、哪里同频、哪里容易错频。',
      };
  const activeLoading = mode === 'single' ? loading : matchLoading;
  const activeCanRun = mode === 'single' ? canSubmit : canMatch;
  const activeError = mode === 'single' ? error : matchError;
  const activeActionLabel = mode === 'single' ? 'soul-kline生成' : 'Who Know Us 共振生成';
  const activeActionHint = mode === 'single'
    ? '填写你的真实社交样本，WKU 会先读懂你，再生成连接走势。'
    : '填写两个人的样本，WKU 会比较靠近路径和错频位置。';
  const activeHasResult = mode === 'single' ? Boolean(result) : Boolean(matchResult);
  const activeResultReady = activeHasResult && !activeLoading;
  const generateButtonLabel = activeLoading ? '生成中' : activeResultReady ? '重新生成 soul-kline' : '生成 soul-kline';

  const performGenerationPreviewScroll = contextSafe(() => {
    const target = resultSectionRef.current;
    if (!target) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      target.scrollIntoView({ block: 'start' });
      return;
    }

    const note = target.querySelector<HTMLElement>('.wku-generation-scroll-note');

    gsap.killTweensOf([window, target, note].filter(Boolean));
    gsap.to(window, {
      duration: 0.88,
      ease: 'power3.inOut',
      scrollTo: { y: target, offsetY: 16 },
      overwrite: true,
    });
    gsap.fromTo(
      target,
      { y: 18, filter: 'brightness(1.02)' },
      {
        y: 0,
        filter: 'brightness(1)',
        duration: 0.6,
        delay: 0.12,
        ease: 'power3.out',
        overwrite: 'auto',
        clearProps: 'transform,filter',
      }
    );
    if (note) {
      gsap.fromTo(
        note,
        { autoAlpha: 0, y: -8, scale: 0.98 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.38,
          delay: 0.2,
          ease: 'power3.out',
          overwrite: 'auto',
          clearProps: 'transform,opacity,visibility',
        }
      );
    }
  });

  const scrollToGenerationPreview = (runMode: Mode) => {
    setScrollIntent(runMode);
    window.setTimeout(performGenerationPreviewScroll, 80);
  };

  const handleModeChange = (nextMode: Mode) => {
    setMode(nextMode);
    setScrollIntent(null);
    setAgentStatuses(createInitialVibeLineAgentStatuses());
    setProgress(nextMode === 'single' ? '等待生成你的 WKU soul-kline' : '等待生成你们的 Who Know Us');
  };

  const handleHeroModeSelect = (nextMode: Mode) => {
    handleModeChange(nextMode);
    window.setTimeout(() => {
      document.getElementById('wku-experience')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  };

  const startMatchFromSingle = () => {
    setPersonA(singleProfile);
    handleHeroModeSelect('match');
  };

  useGSAP(() => {
    gsap.set('.wku-hero, .wku-stage-card, .wku-mode-bar, .wku-workbench, .wku-input-deck, .wku-output', {
      autoAlpha: 1,
      clearProps: 'transform,opacity,visibility',
    });
  }, { scope: pageRef });

  useGSAP(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    gsap.fromTo(
      '.wku-mode-content',
      { autoAlpha: 0.88, y: 10 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.24,
        ease: 'power3.out',
        overwrite: 'auto',
        clearProps: 'transform,opacity,visibility',
      }
    );
    gsap.fromTo(
      '.wku-output',
      { autoAlpha: 0.94, y: 8 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.22,
        ease: 'power3.out',
        overwrite: 'auto',
        clearProps: 'transform,opacity,visibility',
      }
    );
  }, { scope: pageRef, dependencies: [mode] });

  const runAnalyze = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    setResult(null);
    setProgress('正在启动 Who Know U 连接引擎');
    scrollToGenerationPreview('single');
    setAgentStatuses(() => {
      const next = createInitialVibeLineAgentStatuses();
      (Object.keys(next) as VibeLineAgentType[]).forEach((type) => {
        next[type] = { ...next[type], status: 'running' };
      });
      return next;
    });

    try {
      const finalResult = await analyzeVibeLine(singleInput, {
        onProgress: setProgress,
        onPreview: setResult,
        onAgentUpdate: (agentType, status) => {
          setAgentStatuses((prev) => ({
            ...prev,
            [agentType]: {
              ...prev[agentType],
              ...status,
              name: VIBELINE_AGENT_NAMES[agentType] || status.name,
            },
          }));
        },
      });
      setResult(finalResult);
      setProgress('你的 Who Know U 已生成');
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
      setProgress('生成中断');
    } finally {
      setLoading(false);
      setScrollIntent(null);
    }
  };

  const runMatch = async () => {
    if (!canMatch) return;
    setMatchLoading(true);
    setMatchError('');
    setMatchResult(null);
    setProgress('正在启动 Who Know Us 共振引擎');
    scrollToGenerationPreview('match');
    setAgentStatuses(createAgentStatusSnapshot(MATCH_AGENT_PHASES.start));

    try {
      const finalResult = await analyzeVibeMatch(
        {
          personA: profileToInput(personA),
          personB: profileToInput(personB),
          relationshipGoal,
        },
        {
          onProgress: (message) => {
            setProgress(message);
            if (message.includes('计算') || message.includes('错频')) {
              setAgentStatuses(createAgentStatusSnapshot(MATCH_AGENT_PHASES.match));
            }
          },
          onPreview: (preview) => {
            setMatchResult(preview);
            setAgentStatuses(createAgentStatusSnapshot(MATCH_AGENT_PHASES.preview));
          },
          onAgentUpdate: (agentType, status) => {
            setAgentStatuses((prev) => ({
              ...prev,
              [agentType]: {
                ...prev[agentType],
                ...status,
                name: VIBELINE_AGENT_NAMES[agentType] || status.name,
              },
            }));
          },
        }
      );
      setMatchResult(finalResult);
      setAgentStatuses(createAgentStatusSnapshot(MATCH_AGENT_PHASES.complete));
      setProgress('你们的 Who Know Us 已生成');
    } catch (err) {
      setMatchError(err instanceof Error ? err.message : '生成失败');
      setAgentStatuses((prev) => {
        const next = { ...prev };
        VIBE_AGENT_ORDER.forEach((type) => {
          if (next[type].status !== 'completed') {
            next[type] = { ...next[type], status: 'failed' };
          }
        });
        return next;
      });
      setProgress('双人共振生成中断');
    } finally {
      setMatchLoading(false);
      setScrollIntent(null);
    }
  };

  const copyCard = (card: VibeLineVariant) => {
    void navigator.clipboard.writeText(card.text);
    setCopiedId(card.id);
    window.setTimeout(() => setCopiedId(''), 1400);
  };

  return (
    <div ref={pageRef} className="wku-page min-h-screen text-slate-950">
      <main className="relative mx-auto max-w-[1500px] px-4 py-5 sm:px-6">
        <section className="wku-hero wku-glass-hero wku-hero-strip mb-4 overflow-hidden">
          <div className="relative px-5 py-5 sm:px-7 lg:px-8">
            <div className="pointer-events-none absolute inset-0 opacity-90">
              <div className="wku-hero-aura left-[18%] top-[-18%]" />
              <div className="wku-hero-aura right-[5%] top-[18%] is-warm" />
            </div>

            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="wku-logo-mark">
                  <Waves className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-950">WKU soul-kline</p>
                  <p className="text-xs font-bold text-slate-500">Social Market Intelligence</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="wku-chip wku-chip-signal">2026 元创营 Demo</span>
                <span className="wku-chip">AI x Interest Social</span>
                <span className="wku-chip wku-chip-dark">{modeMeta.name}</span>
              </div>
            </div>

            <div className="wku-hero-copy-row relative z-10 mt-8">
              <div className="wku-hero-copy max-w-[980px]">
                <h1 className="wku-display text-4xl font-black leading-[1.02] text-slate-950 sm:text-5xl lg:text-[56px]">
                    WKU soul-kline
                </h1>
                <p className="wku-hero-subtitle mt-3 text-2xl font-black leading-tight text-slate-900 sm:text-[30px]">
                  谁会停下来看你，谁会再次想起你，<span>谁又真正懂你的灵魂？</span>
                </p>
                <p className="wku-hero-soul-line mt-3">
                  你不是不想社交，而是还没遇到那个真正懂你灵魂的人
                </p>
                <p className="mt-4 max-w-[68ch] text-base leading-7 text-slate-700">
                  把生日、性别、MBTI、SBTI、兴趣和真实社交样本放进 WKU。它不判断你是谁，只把陌生人从第一眼到再次想起的连接过程，画成一条可以触摸的 soul-kline。
                </p>
                <HeroModeSwitch mode={mode} onSelectMode={handleHeroModeSelect} />
              </div>

              <a className="wku-hero-cta wku-clickable" href="#wku-experience" aria-label="立即体验 WKU soul-kline">
                <span>立即体验</span>
                <ArrowDown className="h-4 w-4" />
              </a>
            </div>

            <div className="wku-hero-map mt-5">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1080 360" preserveAspectRatio="none" role="img" aria-label="WKU soul-kline 横向连接曲线">
                <defs>
                  <linearGradient id="wkuHeroStripLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="48%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#a3e635" />
                  </linearGradient>
                  <linearGradient id="wkuHeroStripArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.2" />
                    <stop offset="58%" stopColor="#67e8f9" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#f8fafc" stopOpacity="0" />
                  </linearGradient>
                  <filter id="wkuHeroGlow" x="-18%" y="-40%" width="136%" height="180%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path d="M58 254 C 178 186, 272 236, 362 164 C 456 88, 548 240, 646 154 C 744 68, 860 108, 1018 58 L1018 324 L58 324 Z" fill="url(#wkuHeroStripArea)" />
                <path d="M58 254 C 178 186, 272 236, 362 164 C 456 88, 548 240, 646 154 C 744 68, 860 108, 1018 58" fill="none" stroke="rgba(15,23,42,0.08)" strokeLinecap="round" strokeWidth="24" />
                <path className="wku-preview-line" d="M58 254 C 178 186, 272 236, 362 164 C 456 88, 548 240, 646 154 C 744 68, 860 108, 1018 58" fill="none" stroke="url(#wkuHeroStripLine)" strokeLinecap="round" strokeWidth="7" filter="url(#wkuHeroGlow)" />
              </svg>

              {lifecycleStages.map((stage, index) => (
                <div key={stage.label} className={`wku-hero-node node-${index + 1}`}>
                  <span className="wku-mono text-[11px] font-black text-cyan-700">{String(index + 1).padStart(2, '0')}</span>
                  <p className="mt-1 text-sm font-black text-slate-950">{stage.label}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">{stage.detail}</p>
                </div>
              ))}

            </div>
          </div>
        </section>

        <section id="wku-experience" className="wku-experience-grid scroll-mt-5">
          <div className="wku-workbench wku-mode-bar">
            <div className="wku-workbench-header">
              <div>
                <p className="text-xs font-black text-teal-700">WKU 体验工作台</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">先读样本，再看连接曲线</h2>
              </div>
              <div className="wku-workbench-steps" aria-label="当前使用流程">
                <span>选镜头</span>
                <span>填样本</span>
                <span>生成后看结果</span>
              </div>
            </div>

            <ModeChoiceCards mode={mode} onChange={handleModeChange} />

            <div className="wku-workbench-body">
              <aside className="wku-lens-desk">
                <div>
                  <p className="text-xs font-black text-teal-700">当前分析对象</p>
                  <h3 className="mt-1 text-xl font-black text-slate-950">{modeMeta.name}</h3>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{modeMeta.description}</p>
                </div>
                <span className="wku-active-lens-badge">{modeMeta.short}</span>
                <ScoreGuide />

                <div className="wku-sample-bank">
                  <p className="text-xs font-black text-slate-500">{mode === 'single' ? '快速代入一个社交样本' : '快速代入一组双人样本'}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {mode === 'single' ? (
                      singleSamples.map((sample) => (
                        <button
                          key={sample.label}
                          type="button"
                          onClick={() => setSingleProfile(sample)}
                          className="wku-sample-chip wku-clickable"
                        >
                          {sample.label}
                        </button>
                      ))
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setPersonA(singleSamples[0]);
                            setPersonB(singleSamples[2]);
                          }}
                          className="wku-sample-chip wku-clickable"
                        >
                          慢热 × 高频
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPersonA(singleSamples[1]);
                            setPersonB(singleSamples[2]);
                          }}
                          className="wku-sample-chip wku-clickable"
                        >
                          游戏 × 夜聊
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {activeLoading ? (
                  <AgentHandoffCard
                    completedCount={completedCount}
                    progress={progress}
                    mode={mode}
                    onJump={() => resultSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  />
                ) : (
                  <AgentConsole
                    statusMap={agentStatuses}
                    completedCount={completedCount}
                    progress={progress}
                    mode={mode}
                  />
                )}
              </aside>

              <section className="wku-input-deck">
                <div className="wku-input-deck-head">
                  <div>
                    <p className="text-xs font-black text-teal-700">WKU 输入台</p>
                    <h3 className="mt-1 text-xl font-black text-slate-950">{mode === 'single' ? '生成我的 Who Know U' : '生成我和 TA 的 Who Know Us'}</h3>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{activeLoading ? progress : activeActionHint}</p>
                  </div>
                  <div className="wku-input-actions">
                    <span className="wku-input-status">{activeResultReady ? '已生成' : activeLoading ? '生成中' : '待生成'}</span>
                    <button
                      type="button"
                      onClick={mode === 'single' ? runAnalyze : runMatch}
                      disabled={!activeCanRun || activeLoading}
                      className="wku-start-button wku-clickable wku-start-button-head"
                    >
                      {activeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {generateButtonLabel}
                    </button>
                  </div>
                </div>

                <div className="wku-mode-content">
                  {mode === 'single' ? (
                    <div className="wku-single-form-shell">
                      <ProfileForm
                        title="Who Know U 输入台"
                        profile={singleProfile}
                        tone="single"
                        onChange={(key, value) => updateProfile(setSingleProfile, key, value)}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className={`${panelClass} p-4`}>
                        <FormField
                          label="这次想看什么关系问题"
                          value={relationshipGoal}
                          onChange={setRelationshipGoal}
                          textarea
                          rows={2}
                        />
                      </div>
                      <div className="wku-match-form-grid">
                        <ProfileForm
                          title="你的社交样本"
                          profile={personA}
                          compact
                          tone="self"
                          onChange={(key, value) => updateProfile(setPersonA, key, value)}
                        />
                        <ProfileForm
                          title="TA 的社交样本"
                          profile={personB}
                          compact
                          tone="partner"
                          onChange={(key, value) => updateProfile(setPersonB, key, value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {activeError && (
                  <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {activeError}
                  </div>
                )}

                <div className="wku-command-ribbon">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-950">{activeActionLabel}</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                      {activeResultReady ? '读盘已经生成。你可以继续修改样本重新生成，结果已在下方同步更新。' : activeLoading ? progress : '样本准备好后点击生成 soul-kline，系统会先读懂样本，再进入读盘。'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={mode === 'single' ? runAnalyze : runMatch}
                      disabled={!activeCanRun || activeLoading}
                      className="wku-start-button wku-clickable"
                    >
                      {activeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {generateButtonLabel}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <section ref={resultSectionRef} id="wku-results" className="wku-output wku-result-block space-y-5 scroll-mt-5">
            {activeLoading && (
              <div className="wku-generation-scroll-note" role="status" aria-live="polite">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{getGenerationScrollMessage(scrollIntent || mode)}</span>
              </div>
            )}
            {mode === 'single' ? (
              <>
                <VibeLineChart data={result?.kline || []} loading={loading} loadingText={progress} modeLabel="Who Know U" agentStatuses={agentStatuses} />

                {!loading && (
                  result ? (
                    <>
                    <div className={`${panelClass} p-5`}>
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <span className="rounded-md bg-slate-950 px-3 py-1 text-sm font-black text-white">
                          {result.marketType}
                        </span>
                        <span className="rounded-md bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">
                          Who Know U 已生成
                        </span>
                        {result.input.zodiac && (
                          <span className="rounded-md bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                            {result.input.zodiac}
                          </span>
                        )}
                        {result.input.mbti && (
                          <span className="rounded-md bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                            {result.input.mbti}
                          </span>
                        )}
                      </div>
                      <p className="text-base leading-8 text-slate-700">{result.summary}</p>
                      <button type="button" onClick={startMatchFromSingle} className="wku-view-result-button wku-clickable mt-4">
                        去看我和 TA
                        <Users className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                      <div className={`${panelClass} p-4`}>
                        <div className="mb-3 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-teal-600" />
                          <h2 className="text-base font-black">被懂信号</h2>
                        </div>
                        <div className="grid gap-3">
                          {result.risingFactors.map((factor) => (
                            <FactorCard key={factor.title} factor={factor} type="up" />
                          ))}
                        </div>
                      </div>

                      <div className={`${panelClass} p-4`}>
                        <div className="mb-3 flex items-center gap-2">
                          <TrendingDown className="h-5 w-5 text-rose-600" />
                          <h2 className="text-base font-black">错频提醒</h2>
                        </div>
                        <div className="grid gap-3">
                          {result.fallingFactors.map((factor) => (
                            <FactorCard key={factor.title} factor={factor} type="down" />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className={`${panelClass} p-4`}>
                      <div className="mb-3 flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <h2 className="text-base font-black">谁懂你？</h2>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        {result.soulmateSignals.map((lens) => (
                          <SoulmateCard key={lens.type} lens={lens} />
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                      <div className={`${panelClass} p-4`}>
                        <div className="mb-3 flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5 text-teal-600" />
                          <h2 className="text-base font-black">表达微调</h2>
                        </div>
                        <div className="space-y-2">
                          {result.rebalanceSuggestions.map((tip) => (
                            <p key={tip} className="rounded-md bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-700">
                              {tip}
                            </p>
                          ))}
                        </div>
                        <p className="mt-3 text-xs font-semibold leading-5 text-slate-600">{result.safety.note}</p>
                      </div>

                      <div className={`${panelClass} p-4`}>
                        <div className="mb-3 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-amber-500" />
                          <h2 className="text-base font-black">可分享连接短评</h2>
                        </div>
                        <div className="grid gap-3">
                          {result.variants.map((card) => (
                            <ShareCard key={card.id} card={card} copiedId={copiedId} onCopy={copyCard} />
                          ))}
                        </div>
                      </div>
                    </div>
                    </>
                  ) : <ResultPreviewPanel mode="single" />
                )}
              </>
            ) : (
              <>
                  <VibeLineChart data={matchResult?.resonanceKline || []} loading={matchLoading} loadingText={progress} modeLabel="Who Know Us" agentStatuses={agentStatuses} />

                {!matchLoading && (
                  matchResult ? (
                    <>
                    <div className={`${panelClass} p-5`}>
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <span className="rounded-md bg-slate-950 px-3 py-1 text-sm font-black text-white">
                          {matchResult.marketType}
                        </span>
                        <span className="rounded-md bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">
                          共振分 {matchResult.matchScore}/100
                        </span>
                        <span className="rounded-md bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                          Who Know Us 已生成
                        </span>
                      </div>
                      <p className="text-base leading-8 text-slate-700">{matchResult.summary}</p>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                      <div className={`${panelClass} p-4`}>
                        <div className="mb-3 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-teal-600" />
                          <h2 className="text-base font-black">一起变熟的入口</h2>
                        </div>
                        <div className="grid gap-3">
                          {matchResult.overlapSignals.map((factor) => (
                            <FactorCard key={factor.title} factor={factor} type="up" />
                          ))}
                        </div>
                      </div>

                      <div className={`${panelClass} p-4`}>
                        <div className="mb-3 flex items-center gap-2">
                          <TrendingDown className="h-5 w-5 text-rose-600" />
                          <h2 className="text-base font-black">可能误会的瞬间</h2>
                        </div>
                        <div className="grid gap-3">
                          {matchResult.mismatchRisks.map((factor) => (
                            <FactorCard key={factor.title} factor={factor} type="down" />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className={`${panelClass} p-4`}>
                      <div className="mb-3 flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <h2 className="text-base font-black">不同阶段建议</h2>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {matchResult.stageAdvice.map((item) => (
                          <article key={item.stage} className={`${panelClass} p-4`}>
                            <div className="mb-2 flex items-start justify-between gap-3">
                              <h3 className="text-sm font-black text-slate-950">{item.stage}</h3>
                              <ScoreBadge
                                label="阶段分"
                                value={item.score}
                                help="越高越适合推进"
                                tone="stage"
                              />
                            </div>
                            <p className="text-xs leading-5 text-teal-700">{item.highlight}</p>
                            <p className="mt-2 text-xs leading-5 text-rose-700">{item.risk}</p>
                            <p className="mt-3 text-sm leading-6 text-slate-700">{item.suggestion}</p>
                          </article>
                        ))}
                      </div>
                    </div>

                    <div className={`${panelClass} p-4`}>
                      <div className="mb-3 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        <h2 className="text-base font-black">第一句话灵感</h2>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        {matchResult.conversationBridges.map((tip) => (
                          <p key={tip} className="rounded-md bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-700">
                            {tip}
                          </p>
                        ))}
                      </div>
                      <p className="mt-3 text-xs font-semibold leading-5 text-slate-600">{matchResult.safety.note}</p>
                    </div>
                    </>
                  ) : <ResultPreviewPanel mode="match" />
                )}
              </>
            )}
          </section>
        </section>
      </main>
    </div>
  );
};

export default VibeLinePage;
