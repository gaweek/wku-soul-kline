import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Copy,
  Home,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserRound,
  Users,
  UsersRound,
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

const ALL_AGENT_COMPLETE_STATUSES: Partial<Record<VibeLineAgentType, VibeLineAgentStatusType>> = {
  persona_asset: 'completed',
  resonance_factor: 'completed',
  lifecycle_kline: 'completed',
  audience_market: 'completed',
  narrative_packaging: 'completed',
  safety_authenticity: 'completed',
};

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
  complete: ALL_AGENT_COMPLETE_STATUSES,
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

const EMPTY_PROFILE: ProfileFormState = {
  draft: '',
  birthday: '',
  gender: '',
  mbti: '',
  sbti: '',
  interestText: '',
  mood: '',
  socialProblem: '',
};

const PROFILE_REQUIRED_FIELDS: Array<{ key: keyof ProfileFormState; label: string }> = [
  { key: 'birthday', label: '生日' },
  { key: 'gender', label: '性别' },
  { key: 'draft', label: '自我介绍 / 常发动态' },
  { key: 'mood', label: '当前社交状态' },
  { key: 'interestText', label: '个人兴趣' },
  { key: 'mbti', label: 'MBTI' },
];

const getMissingRequiredProfileFields = (profile: ProfileFormState) => (
  PROFILE_REQUIRED_FIELDS
    .filter((field) => !profile[field.key].trim())
    .map((field) => field.label)
);

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

const BUDDY_TYPE_OPTIONS = [
  '',
  '夜聊搭子',
  '游戏搭子',
  '电影搭子',
  '散步搭子',
  '学习搭子',
  '运动搭子',
  '探店搭子',
  '情绪陪伴搭子',
  '暂不确定',
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
    sbti: '夜聊搭子',
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
    sbti: '游戏搭子',
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
    sbti: '散步搭子',
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

const AI_MODEL_LABEL = 'DeepSeek';

const GENERATION_ESTIMATE_RANGES: Record<Mode, [number, number]> = {
  single: [18, 24],
  match: [24, 32],
};

const GENERATION_SCROLL_DURATION = 0.32;
const RECENT_RUNS_STORAGE_KEY = 'wkuRecentRuns';

type AppView = 'home' | 'workbench' | 'share' | 'invite';

interface InvitePayload {
  personA: ProfileFormState;
  relationshipGoal: string;
  createdAt: string;
}

interface SharePayload {
  result: VibeLineResult;
  createdAt: string;
}

interface RecentRunRecord {
  id: string;
  type: Mode;
  title: string;
  detail: string;
  href: string;
  createdAt: string;
}

const getConcreteEstimateSeconds = (mode: Mode, seed = '') => {
  const [min, max] = GENERATION_ESTIMATE_RANGES[mode];
  const span = max - min + 1;
  const hash = Array.from(seed || mode).reduce((total, char) => total + char.charCodeAt(0), 0);
  return min + (hash % span);
};

const encodeUrlPayload = (payload: unknown) => {
  try {
    return window.btoa(encodeURIComponent(JSON.stringify(payload)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  } catch {
    return '';
  }
};

const decodeUrlPayload = <T,>(value: string | null): T | null => {
  if (!value) return null;

  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(decodeURIComponent(window.atob(padded))) as T;
  } catch {
    try {
      return JSON.parse(decodeURIComponent(window.atob(value))) as T;
    } catch {
      return null;
    }
  }
};

const getHashPayload = (hash: string, route: 'share' | 'invite' | 's' | 'i') => {
  const prefix = `#/${route}/`;
  if (!hash.startsWith(prefix)) return null;
  return hash.slice(prefix.length) || null;
};

const buildShareHref = (payload: string) => `/#/share/${payload}`;
const buildShortShareHref = (id: string) => `/#/s/${id}`;
const buildInviteHref = (payload: string) => `/#/invite/${payload}`;
const buildShortInviteHref = (id: string) => `/#/i/${id}`;
const normalizeRecentShareHref = (href: string) => {
  let localHref = href;

  if (/^https?:\/\//.test(href)) {
    try {
      const url = new URL(href);
      localHref = `${url.pathname}${url.hash}`;
    } catch {
      localHref = href;
    }
  }

  if (localHref.startsWith('/#/share/')) return localHref;
  if (localHref.startsWith('/#/s/')) return localHref;
  if (localHref.startsWith('/share/')) return localHref.replace('/share/', '/#/share/');
  return localHref;
};
const getAbsoluteShareLink = (href: string) => {
  const path = normalizeRecentShareHref(href);
  if (typeof window === 'undefined' || /^https?:\/\//.test(path)) return path;
  return `${window.location.origin}${path}`;
};

const writeClipboardText = async (text: string) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    // Fall back below when clipboard permission or insecure contexts block the modern API.
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
};

const normalizeInviteProfile = (profile: Partial<ProfileFormState> = {}): ProfileFormState => ({
  draft: profile.draft || '',
  birthday: profile.birthday || '',
  gender: profile.gender || '',
  mbti: profile.mbti || '',
  sbti: profile.sbti || '',
  interestText: profile.interestText || '',
  mood: profile.mood || '',
  socialProblem: profile.socialProblem || '',
});

const encodeInvitePayload = (payload: InvitePayload) => {
  return encodeUrlPayload(payload);
};

const decodeInvitePayload = (value: string | null): InvitePayload | null => {
  const parsed = decodeUrlPayload<Partial<InvitePayload>>(value);
  if (!parsed?.personA?.draft) return null;

  return {
    personA: normalizeInviteProfile(parsed.personA),
    relationshipGoal: parsed.relationshipGoal || '想知道我们从哪里更容易自然靠近，以及哪里容易错频',
    createdAt: parsed.createdAt || '',
  };
};

const encodeSharePayload = (payload: SharePayload) => {
  return encodeUrlPayload(payload);
};

const createSharePayload = (result: VibeLineResult): SharePayload => ({
  result: {
    ...result,
    input: {
      ...result.input,
      draft: '',
      socialProblem: '',
      interests: result.input.interests.slice(0, 6),
    },
    kline: result.kline.map((point) => ({
      ...point,
      reason: point.reason.length > 80 ? `${point.reason.slice(0, 80)}...` : point.reason,
    })),
    variants: [],
    audienceLenses: [],
    risingFactors: result.risingFactors.slice(0, 3),
    fallingFactors: result.fallingFactors.slice(0, 3),
    soulmateSignals: result.soulmateSignals.slice(0, 3),
    rebalanceSuggestions: result.rebalanceSuggestions.slice(0, 3),
    simulatedReplies: [],
    expressionTips: [],
  },
  createdAt: result.meta.generatedAt || new Date().toISOString(),
});

const decodeSharePayload = (value: string | null): SharePayload | null => {
  const parsed = decodeUrlPayload<Partial<SharePayload>>(value);
  if (!parsed?.result?.summary || !Array.isArray(parsed.result.kline)) return null;

  return {
    result: parsed.result as VibeLineResult,
    createdAt: parsed.createdAt || parsed.result.meta?.generatedAt || '',
  };
};

const createShortStoredLink = async (payload: SharePayload | InvitePayload) => {
  const response = await fetch('/api/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload }),
  });

  if (!response.ok) {
    throw new Error('无法生成分享链接');
  }

  const data = await response.json() as { id?: string; href?: string };
  if (!data.href && !data.id) {
    throw new Error('分享链接返回异常');
  }

  return data;
};

const createShortShareLink = async (payload: SharePayload) => {
  const data = await createShortStoredLink(payload);
  return data.href || buildShortShareHref(data.id || '');
};

const createShortInviteLink = async (payload: InvitePayload) => {
  const data = await createShortStoredLink(payload);
  if (!data.id) {
    throw new Error('邀请链接返回异常');
  }

  return buildShortInviteHref(data.id);
};

const fetchShortSharePayload = async (id: string) => {
  const response = await fetch(`/api/share/${encodeURIComponent(id)}`);

  if (!response.ok) {
    throw new Error('分享链接已失效或暂时无法读取');
  }

  const data = await response.json() as { payload?: SharePayload };
  if (!data.payload?.result?.summary || !Array.isArray(data.payload.result.kline)) {
    throw new Error('分享内容格式异常');
  }

  return data.payload;
};

const fetchShortInvitePayload = async (id: string) => {
  const response = await fetch(`/api/share/${encodeURIComponent(id)}`);

  if (!response.ok) {
    throw new Error('邀请链接已失效或暂时无法读取');
  }

  const data = await response.json() as { payload?: Partial<InvitePayload> };
  if (!data.payload?.personA?.draft) {
    throw new Error('邀请内容格式异常');
  }

  return {
    personA: normalizeInviteProfile(data.payload.personA),
    relationshipGoal: data.payload.relationshipGoal || '想知道我们从哪里更容易自然靠近，以及哪里容易错频',
    createdAt: data.payload.createdAt || '',
  };
};

const buildLegacyShareHref = (payload: SharePayload) => {
  const shareToken = encodeSharePayload(payload);
  return shareToken ? buildShareHref(shareToken) : '';
};

const buildLegacyInviteHref = (payload: InvitePayload) => {
  const inviteToken = encodeInvitePayload(payload);
  return inviteToken ? buildInviteHref(inviteToken) : '';
};

const getRecentRuns = (): RecentRunRecord[] => {
  if (typeof window === 'undefined') return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_RUNS_STORAGE_KEY) || '[]') as RecentRunRecord[];
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return [];
  }
};

const buildSingleShareText = (result: VibeLineResult) => [
  `我的 WKU soul-kline：${result.marketType}`,
  result.summary,
  `最容易被懂：${result.soulmateSignals[0]?.type || '等待同频人群'}`,
  `表达建议：${result.rebalanceSuggestions[0] || result.safety.note}`,
].join('\n');

const buildMatchShareText = (result: VibeMatchResult) => [
  `我们的 Who Know Us：${result.marketType}`,
  `共振分 ${result.matchScore}/100`,
  result.summary,
  `第一句话灵感：${result.conversationBridges[0] || '从一个轻松的问题开始'}`,
].join('\n');

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
  const modeSwitchRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const reduceMotion = Boolean(context.conditions?.reduceMotion);
        const cards = gsap.utils.toArray<HTMLElement>('.wku-mode-switch-card');
        const inactiveCards = gsap.utils.toArray<HTMLElement>('.wku-mode-switch-card:not(.is-active)');
        const inactiveOrbits = gsap.utils.toArray<HTMLElement>('.wku-mode-switch-card:not(.is-active) .wku-mode-switch-orbit');

        gsap.set(inactiveOrbits, {
          autoAlpha: 1,
          rotation: 0,
          transformOrigin: '50% 50%',
        });

        if (reduceMotion) {
          gsap.set(inactiveCards, { '--wku-mode-ring-opacity': 0.72 });
          return;
        }

        gsap.fromTo(
          cards,
          { y: 3, scale: 0.996 },
          {
            y: 0,
            scale: 1,
            duration: 0.36,
            ease: 'power3.out',
            stagger: { each: 0.035, from: mode === 'match' ? 'end' : 'start' },
            clearProps: 'transform',
          }
        );

        gsap.to(inactiveOrbits, {
          rotation: 360,
          duration: 5.2,
          ease: 'none',
          repeat: -1,
        });

        gsap.fromTo(
          inactiveCards,
          { '--wku-mode-ring-opacity': 0.62 },
          {
            '--wku-mode-ring-opacity': 0.86,
            duration: 1.9,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          }
        );
      }
    );

    return () => mm.revert();
  }, { scope: modeSwitchRef, dependencies: [mode], revertOnUpdate: true });

  return (
    <div ref={modeSwitchRef} className="wku-mode-choice-panel is-prominent">
      <div className="wku-mode-choice-head">
        <div>
          <p className="text-xs font-black text-teal-700">模式切换 · 支持单人读盘 / 双人共振</p>
          <h3 className="mt-1 text-lg font-black text-slate-950">这次要分析哪条连接 K 线？</h3>
        </div>
        <span>当前：{activeMode.title}</span>
      </div>
      <div className="wku-mode-switch-grid" role="tablist" aria-label="模式切换">
        {modeTabs.map((item) => {
          const active = mode === item.value;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(item.value)}
              className={`wku-mode-switch-card wku-clickable ${active ? 'is-active' : ''}`}
            >
              <span className="wku-mode-switch-orbit" aria-hidden="true" />
              <span className="wku-mode-switch-card-head">
                <span>{item.value === 'single' ? '单人模式' : '双人模式'}</span>
                <b>{item.title}</b>
              </span>
              <span className="wku-mode-switch-card-copy">{item.body}</span>
              <span className="wku-mode-switch-action">{active ? '正在使用' : '点击切换'}</span>
            </button>
          );
        })}
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
            <span className={labelClass}>想找搭子类型</span>
            <select
              value={profile.sbti}
              onChange={(event) => onChange('sbti', event.target.value)}
              className={`${fieldClass} h-11 px-3`}
            >
              {BUDDY_TYPE_OPTIONS.map((option) => (
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
      <ArrowRight className="h-4 w-4" />
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

const ShareResultCard: React.FC<{
  title: string;
  eyebrow: string;
  summary: string;
  badges: string[];
  shareLink: string;
  copied: boolean;
  onCopy: () => void;
  onOpen?: () => void;
  copyLabel?: string;
  openLabel?: string;
  linkDescription?: string;
}> = ({
  title,
  eyebrow,
  summary,
  badges,
  shareLink,
  copied,
  onCopy,
  onOpen,
  copyLabel = '复制个人结果链接',
  openLabel = '打开分享页',
  linkDescription = '只展示这次 Who Know U 分析结果，不带编辑表单；对方打开后可以点击生成自己的 soul-kline。',
}) => (
  <article className="wku-result-share-card">
    <div className="wku-share-card-body">
      <div>
        <p className="text-xs font-black text-teal-700">结果分享卡</p>
        <h2 className="mt-1 text-lg font-black text-slate-950">{title}</h2>
      </div>
      <span>{eyebrow}</span>
    </div>
    <p className="mt-3 text-sm leading-6 text-slate-700">{summary}</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {badges.map((badge) => (
        <span key={badge} className="wku-share-card-badge">{badge}</span>
      ))}
    </div>
    <div className="wku-share-card-actions">
      <div className="wku-share-link-summary" aria-label="个人结果链接说明">
        <b>{copyLabel.includes('链接') ? '个人结果链接' : '结果摘要'}</b>
        <p>{linkDescription}</p>
        <span>{shareLink ? '内容已生成，可复制' : '生成结果后会自动出现'}</span>
      </div>
      <button type="button" onClick={onCopy} className="wku-view-result-button wku-clickable">
        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copyLabel}
      </button>
      {onOpen && (
        <button type="button" onClick={onOpen} className="wku-view-result-button wku-clickable">
          {openLabel}
        </button>
      )}
    </div>
  </article>
);

const InviteLinkPanel: React.FC<{
  personA: ProfileFormState;
  copied: boolean;
  pending: boolean;
  onCopy: () => void;
  inviteView?: boolean;
}> = ({ personA, copied, pending, onCopy, inviteView }) => {
  const personAReady = personA.draft.trim().length >= 12;

  return (
    <section className="wku-invite-panel" aria-label="双人邀请链接">
      <div className="wku-invite-panel-head">
        <div>
          <p className="text-xs font-black text-teal-700">双人邀请链接</p>
          <h3 className="mt-1 text-base font-black text-slate-950">
            {inviteView ? 'Ta 的信息已经填好，等待你填写' : '邀请 TA 补全样本'}
          </h3>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
            {inviteView
              ? '你补充自己的社交样本后，就能和 Ta 一起生成 Who Know Us 共振盘。'
              : '复制邀请链接发给 Ta，对方打开后会进入填写页，只需要补充自己的表达。'}
          </p>
        </div>
        <button
          type="button"
          onClick={onCopy}
          disabled={!personAReady || pending}
          className="wku-view-result-button wku-clickable"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {pending ? '生成链接中' : '复制邀请链接'}
        </button>
      </div>
    </section>
  );
};

const WorkbenchActionsPanel: React.FC<{
  mode: Mode;
  result: VibeLineResult | null;
  personA: ProfileFormState;
  personB: ProfileFormState;
  shareLink: string;
  inviteLinkPending: boolean;
  copiedId: string;
  inviteView: boolean;
  onCopyText: (id: string, text: string) => void;
  onCopyInvite: () => void;
  onOpenShare: () => void;
}> = ({
  mode,
  result,
  personA,
  personB,
  shareLink,
  inviteLinkPending,
  copiedId,
  inviteView,
  onCopyText,
  onCopyInvite,
  onOpenShare,
}) => (
  <div className="wku-workbench-actions">
    {mode === 'single' ? (
      <div className="wku-share-link-panel">
        <p className="text-xs font-black text-teal-700">个人分享功能</p>
        <h3 className="mt-1 text-base font-black text-slate-950">分享你的结果链接</h3>
        <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
          {result ? '链接只包含你的分析结果，对方打开后可以生成自己的 soul-kline。' : '生成 Who Know U 后，这里会出现可复制的个人结果链接。'}
        </p>
        <div className="mt-3 grid gap-2">
          <button
            type="button"
            disabled={!shareLink}
            onClick={() => onCopyText('single-share-link', shareLink)}
            className="wku-view-result-button wku-clickable w-full"
          >
            {copiedId === 'single-share-link' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            复制个人结果链接
          </button>
          <button
            type="button"
            disabled={!shareLink}
            onClick={onOpenShare}
            className="wku-view-result-button wku-clickable w-full"
          >
            打开分享页
          </button>
        </div>
      </div>
    ) : (
      <InviteLinkPanel
        personA={personA}
        copied={copiedId === 'match-invite-link'}
        pending={inviteLinkPending}
        inviteView={inviteView}
        onCopy={onCopyInvite}
      />
    )}
  </div>
);

const WorkbenchShell: React.FC<{
  activeView: AppView;
  mode: Mode;
  collapsed: boolean;
  recentRuns: RecentRunRecord[];
  activeRecentHref: string;
  copiedId: string;
  onToggle: () => void;
  onNavigateHome: () => void;
  onNavigateWorkbench: () => void;
  onSelectMode: (mode: Mode) => void;
  onOpenRecent: (record: RecentRunRecord) => void;
  onCopyRecent: (record: RecentRunRecord) => void;
  children: React.ReactNode;
}> = ({
  activeView,
  mode,
  collapsed,
  recentRuns,
  activeRecentHref,
  copiedId,
  onToggle,
  onNavigateHome,
  onNavigateWorkbench,
  onSelectMode,
  onOpenRecent,
  onCopyRecent,
  children,
}) => {
  const workbenchNavActive = activeView === 'workbench' || activeView === 'invite';

  return (
    <div className={`wku-app-shell ${collapsed ? 'is-collapsed' : ''}`}>
      <aside className={`wku-side-nav ${collapsed ? 'is-collapsed' : ''}`} aria-label="WKU 页面导航">
        <button type="button" className="wku-side-toggle wku-clickable" onClick={onToggle} aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}>
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
        <div className="wku-side-brand">
          <span>WKU</span>
          {!collapsed && (
            <div>
              <b>soul-kline</b>
              <small>体验工作台</small>
            </div>
          )}
        </div>
        <nav className="wku-side-nav-list">
          <button type="button" className={`wku-side-nav-item wku-clickable ${activeView === 'home' ? 'is-active' : ''}`} onClick={onNavigateHome}>
            <Home className="h-4 w-4" />
            {!collapsed && <span>首页</span>}
          </button>
          <button
            type="button"
            className={`wku-side-nav-item wku-clickable wku-side-workbench-link ${workbenchNavActive ? 'is-active' : ''}`}
            onClick={onNavigateWorkbench}
            aria-label="打开 WKU 工作台"
          >
            <Sparkles className="h-4 w-4" />
            {!collapsed && <span>WKU 工作台</span>}
          </button>
          {collapsed && (
            <>
              <button
                type="button"
                className={`wku-side-nav-item wku-clickable wku-side-collapsed-mode-button is-single ${
                  workbenchNavActive && mode === 'single' ? 'is-active' : ''
                }`}
                onClick={() => onSelectMode('single')}
                aria-label="切换到 Who Know U 单人模式"
                title="Who Know U 单人模式"
              >
                <span className="wku-side-collapsed-mode-glyph is-single">
                  <UserRound className="h-4 w-4" />
                </span>
              </button>
              <button
                type="button"
                className={`wku-side-nav-item wku-clickable wku-side-collapsed-mode-button is-match ${
                  workbenchNavActive && mode === 'match' ? 'is-active' : ''
                }`}
                onClick={() => onSelectMode('match')}
                aria-label="切换到 Who Know Us 双人模式"
                title="Who Know Us 双人模式"
              >
                <span className="wku-side-collapsed-mode-glyph is-match">
                  <UsersRound className="h-4 w-4" />
                </span>
              </button>
            </>
          )}
          {!collapsed && (
            <div className={`wku-side-workbench-group ${workbenchNavActive ? 'is-active' : ''}`}>
              <div className="wku-side-group-title" aria-label="WKU 工作台">
                <Sparkles className="h-4 w-4" />
                <span>WKU 工作台</span>
                <small>模式</small>
              </div>
              <div className="wku-side-mode-list" aria-label="WKU 工作台模式">
                <button
                  type="button"
                  className={`wku-side-mode-item wku-clickable ${workbenchNavActive && mode === 'single' ? 'is-active' : ''}`}
                  onClick={() => onSelectMode('single')}
                >
                  Who Know U
                </button>
                <button
                  type="button"
                  className={`wku-side-mode-item wku-clickable ${workbenchNavActive && mode === 'match' ? 'is-active' : ''}`}
                  onClick={() => onSelectMode('match')}
                >
                  Who Know Us
                </button>
              </div>
            </div>
          )}
        </nav>
        {!collapsed && (
          <div className="wku-recent-runs">
            <p>最近生成</p>
            {recentRuns.length ? (
              recentRuns.map((record) => {
                const isRecentActive = normalizeRecentShareHref(record.href) === activeRecentHref;

                return (
                  <article
                    key={record.id}
                    className={`wku-recent-run ${isRecentActive ? 'is-active' : ''}`}
                  >
                    <button
                      type="button"
                      className="wku-recent-run-main wku-clickable"
                      onClick={() => onOpenRecent(record)}
                      aria-current={isRecentActive ? 'page' : undefined}
                    >
                      <b>{record.title}</b>
                      <span>{record.detail}</span>
                    </button>
                    <button
                      type="button"
                      className="wku-recent-copy-button wku-clickable"
                      onClick={() => onCopyRecent(record)}
                      aria-label={`复制 ${record.title} 的分享链接`}
                      title="复制分享链接"
                    >
                      {copiedId === `recent-share-${record.id}` ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </article>
                );
              })
            ) : (
              <span className="wku-recent-empty">生成后会记录最近 5 次结果</span>
            )}
          </div>
        )}
      </aside>
      <div className="wku-app-content">{children}</div>
    </div>
  );
};

const HomePage: React.FC<{
  modeMeta: {
    name: string;
    short: string;
    description: string;
  };
  onStart: (mode: Mode) => void;
}> = ({ modeMeta, onStart }) => (
  <main className="wku-home-shell relative mx-auto max-w-[1640px] px-4 py-4 sm:px-6">
    <section className="wku-hero wku-glass-hero wku-hero-strip overflow-hidden">
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
          <div className="wku-hero-copy max-w-[1160px]">
            <h1 className="wku-display text-4xl font-black leading-[1.02] text-slate-950 sm:text-5xl lg:text-[60px]">
              WKU soul-kline
            </h1>
            <p className="wku-hero-subtitle mt-3 text-2xl font-black leading-tight text-slate-900 sm:text-[32px]">
              谁会停下来看你，谁会再次想起你，谁又真正懂你的灵魂？
            </p>
            <p className="wku-hero-soul-line mt-3">
              你不是不想社交，而是还没遇到那个真正懂你灵魂的人
            </p>
            <p className="mt-4 max-w-[68ch] text-base leading-7 text-slate-700">
              把生日、性别、MBTI、想找搭子类型、兴趣和真实社交样本放进 WKU。它不判断你是谁，只把陌生人从第一眼到再次想起的连接过程，画成一条可以触摸的 soul-kline。
            </p>
          </div>

          <button
            type="button"
            className="wku-hero-cta wku-clickable"
            onClick={() => onStart('single')}
            aria-label="立即体验 WKU soul-kline"
          >
            <span>立即体验</span>
            <ArrowRight className="h-4 w-4" />
          </button>
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
  </main>
);

const WorkbenchPage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <main className="wku-workbench-page relative mx-auto max-w-[1500px] px-4 py-5 sm:px-6">
    <section className="wku-experience-grid scroll-mt-5">
      {children}
    </section>
  </main>
);

const SharedResultPage: React.FC<{
  payload: SharePayload;
  shareLink: string;
  copied: boolean;
  onCopyShare: () => void;
  onStartOwn: () => void;
}> = ({ payload, shareLink, copied, onCopyShare, onStartOwn }) => {
  const { result } = payload;
  const finalScore = result.kline[result.kline.length - 1]?.close ?? '-';
  const shareText = buildSingleShareText(result);

  return (
    <section className="wku-shared-result-page">
      <div className="wku-shared-result-toolbar">
        <button type="button" className="wku-back-button wku-clickable" onClick={onStartOwn}>
          <ChevronLeft className="h-4 w-4" />
          生成我的 soul-kline
        </button>
        <button type="button" className="wku-back-button wku-clickable" onClick={onCopyShare} disabled={!shareLink}>
          {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          复制分享链接
        </button>
      </div>
      <div className="wku-shared-result-hero">
        <div>
          <p className="text-xs font-black text-teal-700">来自朋友的 Who Know U 结果</p>
          <h1 className="mt-2 text-2xl font-black text-slate-950">Ta 的 WKU soul-kline</h1>
          <p className="mt-3 max-w-[70ch] text-sm font-semibold leading-7 text-slate-700">{result.summary}</p>
        </div>
        <div className="wku-shared-score">
          <span>连接分</span>
          <b>{finalScore}</b>
        </div>
      </div>
      <VibeLineChart
        data={result.kline}
        modeLabel="Who Know U"
        modelLabel={AI_MODEL_LABEL}
        estimateText="已生成"
      />
      <div className="grid gap-4 xl:grid-cols-3">
        {result.soulmateSignals.slice(0, 3).map((lens) => (
          <SoulmateCard key={lens.type} lens={lens} />
        ))}
      </div>
      <div className="wku-shared-summary" aria-label="分享摘要">
        <b>结果摘要</b>
        <p>{shareText}</p>
      </div>
      <div className="wku-shared-result-cta">
        <div>
          <b>也看看谁会懂你</b>
          <p>进入工作台填写你的样本，生成只属于你的 WKU soul-kline。</p>
        </div>
        <button type="button" className="wku-start-button wku-clickable" onClick={onStartOwn}>
          <Sparkles className="h-4 w-4" />
          生成我的 soul-kline
        </button>
      </div>
    </section>
  );
};

const ShareLoadingPage: React.FC<{
  error: string;
  onStartOwn: () => void;
}> = ({ error, onStartOwn }) => (
  <section className="wku-shared-result-page">
    <div className="wku-shared-result-hero">
      <div>
        <p className="text-xs font-black text-teal-700">WKU soul-kline 分享页</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950">
          {error ? '这条分享暂时无法打开' : '正在读取朋友的 soul-kline'}
        </h1>
        <p className="mt-3 max-w-[70ch] text-sm font-semibold leading-7 text-slate-700">
          {error || '系统正在根据短链接加载分享结果，稍等一下就能看到完整读盘。'}
        </p>
      </div>
      <div className="wku-shared-score">
        <span>分享</span>
        <b>{error ? '!' : '...'}</b>
      </div>
    </div>
    <div className="wku-shared-result-cta">
      <div>
        <b>也可以先生成自己的 soul-kline</b>
        <p>进入工作台填写你的样本，生成只属于你的连接曲线。</p>
      </div>
      <button type="button" className="wku-start-button wku-clickable" onClick={onStartOwn}>
        <Sparkles className="h-4 w-4" />
        生成我的 soul-kline
      </button>
    </div>
  </section>
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

const NewSoulKLineAction: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className="wku-new-soul-action">
    <div>
      <b>想重新生成一条新的读盘？</b>
      <p>会清空当前样本和结果，回到输入台重新填写必填项。</p>
    </div>
    <button type="button" className="wku-start-button wku-clickable" onClick={onClick}>
      <Sparkles className="h-4 w-4" />
      去生成新的 soul-kline
    </button>
  </div>
);

const VibeLinePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sharePayload, invitePayload } = useParams<{ sharePayload?: string; invitePayload?: string }>();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const resultSectionRef = useRef<HTMLElement | null>(null);
  const [mode, setMode] = useState<Mode>('single');
  const [singleProfile, setSingleProfile] = useState<ProfileFormState>(singleSamples[0]);
  const [personA, setPersonA] = useState<ProfileFormState>(singleSamples[0]);
  const [personB, setPersonB] = useState<ProfileFormState>(singleSamples[2]);
  const [relationshipGoal, setRelationshipGoal] = useState('想知道我们从哪里更容易自然靠近，以及哪里容易错频');
  const [result, setResult] = useState<VibeLineResult | null>(null);
  const [matchResult, setMatchResult] = useState<VibeMatchResult | null>(null);
  const [singleAgentStatuses, setSingleAgentStatuses] = useState<VibeLineAgentStatusMap>(createInitialVibeLineAgentStatuses);
  const [matchAgentStatuses, setMatchAgentStatuses] = useState<VibeLineAgentStatusMap>(createInitialVibeLineAgentStatuses);
  const [singleProgress, setSingleProgress] = useState('等待生成你的 WKU soul-kline');
  const [matchProgress, setMatchProgress] = useState('等待生成你们的 Who Know Us');
  const [loading, setLoading] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);
  const [error, setError] = useState('');
  const [matchError, setMatchError] = useState('');
  const [copiedId, setCopiedId] = useState('');
  const [scrollIntent, setScrollIntent] = useState<Mode | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [recentRuns, setRecentRuns] = useState<RecentRunRecord[]>(getRecentRuns);
  const [hashRoute, setHashRoute] = useState(() => (typeof window === 'undefined' ? '' : window.location.hash));
  const [singleShareLink, setSingleShareLink] = useState('');
  const [inviteLinkPending, setInviteLinkPending] = useState(false);
  const [remoteSharePayload, setRemoteSharePayload] = useState<SharePayload | null>(null);
  const [remoteInvitePayload, setRemoteInvitePayload] = useState<InvitePayload | null>(null);
  const [shareLoadError, setShareLoadError] = useState('');
  const [inviteLoadError, setInviteLoadError] = useState('');
  const { contextSafe } = useGSAP({ scope: pageRef });
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const hashSharePayload = useMemo(() => getHashPayload(hashRoute, 'share'), [hashRoute]);
  const hashShortShareId = useMemo(() => getHashPayload(hashRoute, 's'), [hashRoute]);
  const hashInvitePayload = useMemo(() => getHashPayload(hashRoute, 'invite'), [hashRoute]);
  const hashShortInviteId = useMemo(() => getHashPayload(hashRoute, 'i'), [hashRoute]);
  const activeSharePayload = sharePayload || hashSharePayload || searchParams.get('wkuShare') || '';
  const legacySharedPayload = useMemo(
    () => decodeSharePayload(activeSharePayload),
    [activeSharePayload]
  );
  const activeShortShareId = hashShortShareId || searchParams.get('wkuShareId') || '';
  const sharedPayload = remoteSharePayload || legacySharedPayload;
  const legacyInvitePayloadValue = invitePayload || hashInvitePayload || searchParams.get('wkuInvite') || '';
  const legacyInvitePayload = useMemo(
    () => decodeInvitePayload(legacyInvitePayloadValue),
    [legacyInvitePayloadValue]
  );
  const activeShortInviteId = hashShortInviteId || searchParams.get('wkuInviteId') || '';
  const activeInvitePayload = remoteInvitePayload || legacyInvitePayload;
  const isWorkbenchRoute = location.pathname === '/workbench' || location.pathname === '/vibeline' || location.pathname === '/soul-kline';
  const activeView: AppView = sharedPayload || activeShortShareId
    ? 'share'
    : activeInvitePayload || activeShortInviteId || legacyInvitePayloadValue
      ? 'invite'
      : isWorkbenchRoute
        ? 'workbench'
        : 'home';
  const isHomeView = activeView === 'home';
  const inviteView = activeView === 'invite';
  const activeShareHref = activeShortShareId
    ? buildShortShareHref(activeShortShareId)
    : activeSharePayload
      ? buildShareHref(activeSharePayload)
      : '';
  const activeRecentHref = activeView === 'share' ? activeShareHref : '';
  const activeShareLink = activeShareHref && typeof window !== 'undefined'
    ? `${window.location.origin}${activeShareHref}`
    : '';

  const singleInput = useMemo(() => profileToInput(singleProfile), [singleProfile]);
  const canSubmit = getMissingRequiredProfileFields(singleProfile).length === 0 && !loading;
  const canMatch = (
    getMissingRequiredProfileFields(personA).length === 0
    && getMissingRequiredProfileFields(personB).length === 0
    && !matchLoading
  );
  const singleMissingRequiredText = getMissingRequiredProfileFields(singleProfile).join('、');
  const personAMissingRequiredText = getMissingRequiredProfileFields(personA).join('、');
  const personBMissingRequiredText = getMissingRequiredProfileFields(personB).join('、');
  const matchMissingRequiredText = [
    personAMissingRequiredText ? `${inviteView ? 'Ta' : '你'}：${personAMissingRequiredText}` : '',
    personBMissingRequiredText ? `${inviteView ? '你' : 'TA'}：${personBMissingRequiredText}` : '',
  ].filter(Boolean).join('；');
  const activeAgentStatuses = mode === 'single' ? singleAgentStatuses : matchAgentStatuses;
  const activeProgress = mode === 'single' ? singleProgress : matchProgress;
  const activeCompletedCount = Object.values(activeAgentStatuses).filter((item) => item.status === 'completed').length;
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
  const activeError = mode === 'single' ? error : matchError || inviteLoadError;
  const activeActionLabel = mode === 'single' ? 'soul-kline生成' : 'Who Know Us 共振生成';
  const activeInputTitle = mode === 'single' ? '生成我的 Who Know U' : '生成我和 TA 的 Who Know Us';
  const activeActionHint = mode === 'single'
    ? '填写你的真实社交样本，WKU 会先读懂你，再生成连接走势。'
    : '填写两个人的样本，WKU 会比较靠近路径和错频位置。';
  const activeHasResult = mode === 'single' ? Boolean(result) : Boolean(matchResult);
  const activeResultReady = activeHasResult && !activeLoading;
  const generateButtonLabel = activeLoading ? '生成中' : activeResultReady ? '重新生成 soul-kline' : '生成 soul-kline';
  const estimateSeed = mode === 'single'
    ? `${singleProfile.draft}${singleProfile.interestText}`
    : `${personA.draft}${personB.draft}${relationshipGoal}`;
  const activeGenerationEstimate = `${getConcreteEstimateSeconds(mode, estimateSeed)}s`;
  const showRunCard = !activeLoading;
  const performGenerationPreviewScroll = contextSafe(() => {
    const target = resultSectionRef.current?.querySelector<HTMLElement>('.wku-chart-card, .wku-chart-loading-card')
      || resultSectionRef.current;
    if (!target) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      target.scrollIntoView({ block: 'start' });
      return;
    }

    const note = target.querySelector<HTMLElement>('.wku-generation-scroll-note');

    gsap.killTweensOf([window, target, note].filter(Boolean));
    gsap.to(window, {
      duration: GENERATION_SCROLL_DURATION,
      ease: 'power3.out',
      scrollTo: { y: target, offsetY: 24 },
      overwrite: true,
    });
    gsap.fromTo(
      target,
      { y: 8, filter: 'brightness(1.015)' },
      {
        y: 0,
        filter: 'brightness(1)',
        duration: 0.24,
        delay: 0.02,
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
          duration: 0.2,
          delay: 0.02,
          ease: 'power3.out',
          overwrite: 'auto',
          clearProps: 'transform,opacity,visibility',
        }
      );
    }
  });

  const scrollToGenerationPreview = (runMode: Mode) => {
    setScrollIntent(runMode);
    requestAnimationFrame(performGenerationPreviewScroll);
  };

  const scrollToWorkbenchTop = () => {
    window.requestAnimationFrame(() => {
      const target = pageRef.current?.querySelector<HTMLElement>('.wku-workbench-page');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const handleModeChange = (nextMode: Mode) => {
    setMode(nextMode);
    setScrollIntent(null);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const syncHashRoute = () => setHashRoute(window.location.hash);
    window.addEventListener('hashchange', syncHashRoute);
    return () => window.removeEventListener('hashchange', syncHashRoute);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!activeShortShareId) {
      setRemoteSharePayload(null);
      setShareLoadError('');
      return undefined;
    }

    setRemoteSharePayload(null);
    setShareLoadError('');

    void fetchShortSharePayload(activeShortShareId)
      .then((payload) => {
        if (!cancelled) setRemoteSharePayload(payload);
      })
      .catch((err) => {
        if (!cancelled) {
          setShareLoadError(err instanceof Error ? err.message : '分享链接已失效或暂时无法读取');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeShortShareId]);

  useEffect(() => {
    let cancelled = false;

    if (!activeShortInviteId) {
      setRemoteInvitePayload(null);
      setInviteLoadError('');
      return undefined;
    }

    setMode('match');
    setPersonA(EMPTY_PROFILE);
    setPersonB(normalizeInviteProfile());
    setMatchProgress('正在读取 Ta 的邀请信息');
    setMatchError('');
    setRemoteInvitePayload(null);
    setInviteLoadError('');

    void fetchShortInvitePayload(activeShortInviteId)
      .then((payload) => {
        if (!cancelled) setRemoteInvitePayload(payload);
      })
      .catch((err) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : '邀请链接已失效或暂时无法读取';
          setInviteLoadError(message);
          setMatchError(message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeShortInviteId]);

  useEffect(() => {
    if (!activeInvitePayload) return;

    setMode('match');
    setPersonA(activeInvitePayload.personA);
    setPersonB(normalizeInviteProfile());
    setRelationshipGoal(activeInvitePayload.relationshipGoal);
    setMatchProgress('Ta 的信息已经填好，等待你填写自己的社交样本');
    setMatchError('');
  }, [activeInvitePayload]);

  const clearHashRoute = () => {
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.replaceState(null, document.title, `${window.location.pathname}${window.location.search}`);
      setHashRoute('');
    }
  };

  const openHome = () => {
    clearHashRoute();
    navigate('/');
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const openWorkbench = (nextMode: Mode = mode) => {
    clearHashRoute();
    navigate('/workbench');
    handleModeChange(nextMode);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const openSharePage = () => {
    if (!singleShareLink) return;

    openShareHref(singleShareLink);
  };

  const openShareHref = (href: string) => {
    const nextHref = normalizeRecentShareHref(href);
    const nextPathname = nextHref.split('#')[0] || '/';
    const nextHash = nextHref.includes('#') ? `#${nextHref.split('#')[1]}` : '';
    clearHashRoute();
    navigate({ pathname: nextPathname, hash: nextHash });
    setHashRoute(nextHash);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const startFreshSoulKline = () => {
    clearHashRoute();
    navigate('/workbench');
    setMode('single');
    setSingleProfile(EMPTY_PROFILE);
    setPersonA(EMPTY_PROFILE);
    setPersonB(EMPTY_PROFILE);
    setRelationshipGoal('');
    setResult(null);
    setMatchResult(null);
    setSingleShareLink('');
    setInviteLinkPending(false);
    setRemoteInvitePayload(null);
    setError('');
    setMatchError('');
    setScrollIntent(null);
    setSingleAgentStatuses(createInitialVibeLineAgentStatuses());
    setMatchAgentStatuses(createInitialVibeLineAgentStatuses());
    setSingleProgress('请重新填写必填项后生成新的 WKU soul-kline');
    setMatchProgress('等待生成你们的 Who Know Us');
    scrollToWorkbenchTop();
  };

  const goCreateNewSoulKline = () => startFreshSoulKline();

  const saveRecentRun = (record: RecentRunRecord) => {
    setRecentRuns((prev) => {
      const next = [record, ...prev.filter((item) => item.id !== record.id)].slice(0, 5);
      window.localStorage.setItem(RECENT_RUNS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const openRecentRun = (record: RecentRunRecord) => {
    if (record.href.startsWith('/share/') || record.href.startsWith('/#/share/') || record.href.startsWith('/#/s/')) {
      openShareHref(record.href);
      return;
    }

    handleModeChange(record.type);
    navigate('/workbench');
    requestAnimationFrame(() => resultSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const copyRecentRunLink = (record: RecentRunRecord) => {
    copyText(`recent-share-${record.id}`, getAbsoluteShareLink(record.href));
  };

  const publishSingleShareLink = async (finalResult: VibeLineResult) => {
    const payload = createSharePayload(finalResult);
    const fallbackHref = buildLegacyShareHref(payload);
    let shareHref = fallbackHref;

    try {
      shareHref = await createShortShareLink(payload);
    } catch {
      shareHref = fallbackHref;
    }

    if (shareHref) {
      setSingleShareLink(getAbsoluteShareLink(shareHref));
    }

    saveRecentRun({
      id: `single-${finalResult.meta.generatedAt}`,
      type: 'single',
      title: finalResult.marketType,
      detail: `连接分 ${finalResult.kline[finalResult.kline.length - 1]?.close ?? '-'}/100`,
      href: shareHref || '/',
      createdAt: finalResult.meta.generatedAt,
    });
  };

  const publishInviteLink = async () => {
    const payload: InvitePayload = {
      personA,
      relationshipGoal,
      createdAt: new Date().toISOString(),
    };
    const fallbackHref = buildLegacyInviteHref(payload);
    let inviteHref = fallbackHref;

    try {
      inviteHref = await createShortInviteLink(payload);
    } catch {
      inviteHref = fallbackHref;
    }

    const absoluteLink = inviteHref ? getAbsoluteShareLink(inviteHref) : '';
    return absoluteLink;
  };

  const copyInviteLink = () => {
    if (personA.draft.trim().length < 12 || inviteLinkPending) return;

    setInviteLinkPending(true);
    void publishInviteLink()
      .then((link) => copyText('match-invite-link', link))
      .finally(() => setInviteLinkPending(false));
  };

  const handleHeroModeSelect = (nextMode: Mode) => {
    handleModeChange(nextMode);
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
    const missingFields = getMissingRequiredProfileFields(singleProfile);
    if (missingFields.length > 0) {
      setError(`请先补全必填项：${missingFields.join('、')}`);
      scrollToWorkbenchTop();
      return;
    }
    if (loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    setSingleShareLink('');
    setSingleProgress('正在启动 Who Know U 连接引擎');
    scrollToGenerationPreview('single');
    setSingleAgentStatuses(() => {
      const next = createInitialVibeLineAgentStatuses();
      (Object.keys(next) as VibeLineAgentType[]).forEach((type) => {
        next[type] = { ...next[type], status: 'running' };
      });
      return next;
    });

    try {
      const finalResult = await analyzeVibeLine(singleInput, {
        onProgress: setSingleProgress,
        onPreview: setResult,
        onAgentUpdate: (agentType, status) => {
          setSingleAgentStatuses((prev) => ({
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
      setSingleAgentStatuses(createAgentStatusSnapshot(ALL_AGENT_COMPLETE_STATUSES));
      setSingleProgress('你的 Who Know U 已生成');
      await publishSingleShareLink(finalResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
      setSingleAgentStatuses((prev) => {
        const next = { ...prev };
        VIBE_AGENT_ORDER.forEach((type) => {
          if (next[type].status !== 'completed') {
            next[type] = { ...next[type], status: 'failed' };
          }
        });
        return next;
      });
      setSingleProgress('生成中断');
    } finally {
      setLoading(false);
      setScrollIntent(null);
    }
  };

  const runMatch = async () => {
    const personAMissing = getMissingRequiredProfileFields(personA);
    const personBMissing = getMissingRequiredProfileFields(personB);
    if (personAMissing.length > 0 || personBMissing.length > 0) {
      setMatchError(`请先补全必填项：${[
        personAMissing.length > 0 ? `${inviteView ? 'Ta' : '你'}：${personAMissing.join('、')}` : '',
        personBMissing.length > 0 ? `${inviteView ? '你' : 'TA'}：${personBMissing.join('、')}` : '',
      ].filter(Boolean).join('；')}`);
      scrollToWorkbenchTop();
      return;
    }
    if (matchLoading) return;
    setMatchLoading(true);
    setMatchError('');
    setMatchResult(null);
    setMatchProgress('正在启动 Who Know Us 共振引擎');
    scrollToGenerationPreview('match');
    setMatchAgentStatuses(createAgentStatusSnapshot(MATCH_AGENT_PHASES.start));

    try {
      const finalResult = await analyzeVibeMatch(
        {
          personA: profileToInput(personA),
          personB: profileToInput(personB),
          relationshipGoal,
        },
        {
          onProgress: (message) => {
            setMatchProgress(message);
            if (message.includes('计算') || message.includes('错频')) {
              setMatchAgentStatuses(createAgentStatusSnapshot(MATCH_AGENT_PHASES.match));
            }
          },
          onPreview: (preview) => {
            setMatchResult(preview);
            setMatchAgentStatuses(createAgentStatusSnapshot(MATCH_AGENT_PHASES.preview));
          },
          onAgentUpdate: (agentType, status) => {
            setMatchAgentStatuses((prev) => ({
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
      setMatchAgentStatuses(createAgentStatusSnapshot(ALL_AGENT_COMPLETE_STATUSES));
      setMatchProgress('你们的 Who Know Us 已生成');
      saveRecentRun({
        id: `match-${finalResult.meta.generatedAt}`,
        type: 'match',
        title: finalResult.marketType,
        detail: `共振分 ${finalResult.matchScore}/100`,
        href: '/',
        createdAt: finalResult.meta.generatedAt,
      });
    } catch (err) {
      setMatchError(err instanceof Error ? err.message : '生成失败');
      setMatchAgentStatuses((prev) => {
        const next = { ...prev };
        VIBE_AGENT_ORDER.forEach((type) => {
          if (next[type].status !== 'completed') {
            next[type] = { ...next[type], status: 'failed' };
          }
        });
        return next;
      });
      setMatchProgress('双人共振生成中断');
    } finally {
      setMatchLoading(false);
      setScrollIntent(null);
    }
  };

  const copyText = (id: string, text: string) => {
    if (!text) return;
    void writeClipboardText(text).then(() => {
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(''), 1400);
    });
  };

  const copyCard = (card: VibeLineVariant) => {
    copyText(card.id, card.text);
  };

  return (
    <div ref={pageRef} className="wku-page min-h-screen text-slate-950">
      {activeView === 'share' ? (
        <main className="wku-standalone-share-page relative mx-auto max-w-[1320px] px-4 py-5 sm:px-6">
          {sharedPayload ? (
            <SharedResultPage
              payload={sharedPayload}
              shareLink={activeShareLink}
              copied={copiedId === 'shared-result-link'}
              onCopyShare={() => copyText('shared-result-link', activeShareLink)}
              onStartOwn={goCreateNewSoulKline}
            />
          ) : (
            <ShareLoadingPage
              error={shareLoadError}
              onStartOwn={goCreateNewSoulKline}
            />
          )}
        </main>
      ) : (
        <WorkbenchShell
          activeView={activeView}
          mode={mode}
          collapsed={sidebarCollapsed}
          recentRuns={recentRuns}
          activeRecentHref={activeRecentHref}
          copiedId={copiedId}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
          onNavigateHome={openHome}
          onNavigateWorkbench={() => openWorkbench(mode)}
          onSelectMode={openWorkbench}
          onOpenRecent={openRecentRun}
          onCopyRecent={copyRecentRunLink}
        >
          {isHomeView ? (
          <HomePage
            modeMeta={modeMeta}
            onStart={openWorkbench}
          />
        ) : (
          <WorkbenchPage>
          <div className="wku-workbench wku-mode-bar">
            <div className="wku-workbench-header">
              <div>
                <p className="text-xs font-black text-teal-700">WKU 输入台</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">{activeInputTitle}</h2>
                <p className="mt-1 max-w-[68ch] text-sm font-semibold leading-6 text-slate-600">{activeLoading ? activeProgress : activeActionHint}</p>
              </div>
              <div className="wku-input-actions">
                <span className="wku-input-status">{activeResultReady ? '已生成' : activeLoading ? '生成中' : '待生成'}</span>
                <button
                  type="button"
                  onClick={mode === 'single' ? runAnalyze : runMatch}
                  disabled={!activeCanRun || activeLoading}
                  className="wku-start-button wku-clickable"
                  aria-label={`${generateButtonLabel}，预计 ${activeGenerationEstimate}`}
                >
                  {activeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {generateButtonLabel}
                </button>
              </div>
            </div>

            <div className="wku-workbench-body">
              <aside className="wku-lens-desk">
                <div className="wku-lens-summary">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-teal-700">当前分析对象</p>
                      <h3 className="mt-1 text-xl font-black text-slate-950">{modeMeta.name}</h3>
                      <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{modeMeta.description}</p>
                    </div>
                    <span className="wku-active-lens-badge">{modeMeta.short}</span>
                  </div>
                  <div className="wku-lens-summary-grid" aria-label="生成内容">
                    {previewDeliverables.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>

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
                    completedCount={activeCompletedCount}
                    progress={activeProgress}
                    mode={mode}
                    onJump={() => resultSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  />
                ) : (
                  <AgentConsole
                    statusMap={activeAgentStatuses}
                    completedCount={activeCompletedCount}
                    progress={activeProgress}
                    mode={mode}
                  />
                )}

                <WorkbenchActionsPanel
                  mode={mode}
                  result={result}
                  personA={personA}
                  personB={personB}
                  shareLink={singleShareLink}
                  inviteLinkPending={inviteLinkPending}
                  copiedId={copiedId}
                  inviteView={inviteView}
                  onCopyText={copyText}
                  onCopyInvite={copyInviteLink}
                  onOpenShare={openSharePage}
                />
              </aside>

              <section className="wku-input-deck">
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
                          title={inviteView ? 'Ta 的社交样本' : '你的社交样本'}
                          profile={personA}
                          compact
                          tone="self"
                          onChange={(key, value) => {
                            if (!inviteView) updateProfile(setPersonA, key, value);
                          }}
                        />
                        <ProfileForm
                          title={inviteView ? '你的社交样本' : 'TA 的社交样本'}
                          profile={personB}
                          compact
                          tone="partner"
                          onChange={(key, value) => updateProfile(setPersonB, key, value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {mode === 'single' && singleMissingRequiredText && (
                  <div className="wku-required-hint" role="status">
                    请重新填写：{singleMissingRequiredText}
                  </div>
                )}

                {mode === 'match' && matchMissingRequiredText && (
                  <div className="wku-required-hint" role="status">
                    请补全双人样本：{matchMissingRequiredText}
                  </div>
                )}

                {activeError && (
                  <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {activeError}
                  </div>
                )}

                {showRunCard && (
                  <div className="wku-command-ribbon wku-form-run-card">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-950">{activeActionLabel}</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                        {activeResultReady ? '可以修改样本后重新生成 soul-kline。' : '样本准备好后点击生成 soul-kline，系统会先读懂样本，再进入读盘。'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={mode === 'single' ? runAnalyze : runMatch}
                        disabled={!activeCanRun || activeLoading}
                        className="wku-start-button wku-clickable"
                        aria-label={`${generateButtonLabel}，预计 ${activeGenerationEstimate}`}
                      >
                        <Sparkles className="h-4 w-4" />
                        {generateButtonLabel}
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>

          <section
            ref={resultSectionRef}
            id="wku-results"
            className={`wku-output wku-result-block space-y-5 scroll-mt-5 ${activeLoading ? 'is-generating' : ''}`}
          >
            {activeLoading && (
              <div className="wku-generation-scroll-note" role="status" aria-live="polite">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{getGenerationScrollMessage(scrollIntent || mode)}</span>
              </div>
            )}
            {mode === 'single' ? (
              <>
                <VibeLineChart
                  data={result?.kline || []}
                  loading={loading}
                  loadingText={singleProgress}
                  modeLabel="Who Know U"
                  agentStatuses={singleAgentStatuses}
                  modelLabel={AI_MODEL_LABEL}
                  estimateText={activeGenerationEstimate}
                />

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

                    <ShareResultCard
                      title="我的 Who Know U 连接读盘"
                      eyebrow={result.marketType}
                      summary={result.summary}
                      badges={[
                        `连接分 ${result.kline[result.kline.length - 1]?.close ?? '-'}/100`,
                        result.input.zodiac || '兴趣社交',
                        result.input.mbti || '表达样本',
                      ]}
                      shareLink={singleShareLink}
                      copied={copiedId === 'single-result-share'}
                      onCopy={() => copyText('single-result-share', singleShareLink)}
                      onOpen={openSharePage}
                    />

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

                    <NewSoulKLineAction onClick={goCreateNewSoulKline} />
                    </>
                  ) : <ResultPreviewPanel mode="single" />
                )}
              </>
            ) : (
              <>
                  <VibeLineChart
                    data={matchResult?.resonanceKline || []}
                    loading={matchLoading}
                    loadingText={matchProgress}
                    modeLabel="Who Know Us"
                    agentStatuses={matchAgentStatuses}
                    modelLabel={AI_MODEL_LABEL}
                    estimateText={activeGenerationEstimate}
                  />

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

                    <ShareResultCard
                      title="我们的 Who Know Us 共振读盘"
                      eyebrow={`共振分 ${matchResult.matchScore}/100`}
                      summary={matchResult.summary}
                      badges={[
                        matchResult.marketType,
                        `${matchResult.stageAdvice.length} 个阶段建议`,
                        `${matchResult.conversationBridges.length} 条开场灵感`,
                      ]}
                      shareLink={buildMatchShareText(matchResult)}
                      copied={copiedId === 'match-result-share'}
                      onCopy={() => copyText('match-result-share', buildMatchShareText(matchResult))}
                      copyLabel="复制共振摘要"
                      linkDescription="这段摘要只用于你们自己复盘；邀请 Ta 请使用左侧的双人邀请链接。"
                    />

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

                    <NewSoulKLineAction onClick={goCreateNewSoulKline} />
                    </>
                  ) : <ResultPreviewPanel mode="match" />
                )}
              </>
            )}
          </section>
          </WorkbenchPage>
        )}
        </WorkbenchShell>
      )}
    </div>
  );
};

export default VibeLinePage;
