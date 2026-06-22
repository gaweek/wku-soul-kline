const FORBIDDEN_TERMS = [
  '\u516b\u5b57',
  '\u547d\u7406',
  '\u7b97\u547d',
  '\u8fd0\u52bf',
  '\u5927\u8fd0',
  '\u6d41\u5e74',
  '\u98ce\u6c34',
  '\u5f00\u8fd0',
  '\u5409\u51f6',
  '\u547d\u4e3b',
  '\u8d22\u8fd0',
  '\u66b4\u5bcc',
  '\u5a5a\u59fb\u9884\u6d4b',
  '\u5065\u5eb7\u9884\u6d4b',
  '\u7384\u5b66',
];

const FORBIDDEN_PATTERNS = FORBIDDEN_TERMS.map((term) => new RegExp(term, 'g'));

const DEFAULT_INTERESTS = ['音乐', '电影', '游戏', '散步'];
const VALID_MBTI = new Set([
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
]);

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export const calculateZodiacSign = (birthday = '') => {
  const match = String(birthday || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';

  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return '';
  const dateCode = month * 100 + day;

  if (dateCode >= 321 && dateCode <= 419) return '白羊座';
  if (dateCode >= 420 && dateCode <= 520) return '金牛座';
  if (dateCode >= 521 && dateCode <= 621) return '双子座';
  if (dateCode >= 622 && dateCode <= 722) return '巨蟹座';
  if (dateCode >= 723 && dateCode <= 822) return '狮子座';
  if (dateCode >= 823 && dateCode <= 922) return '处女座';
  if (dateCode >= 923 && dateCode <= 1023) return '天秤座';
  if (dateCode >= 1024 && dateCode <= 1122) return '天蝎座';
  if (dateCode >= 1123 && dateCode <= 1221) return '射手座';
  if (dateCode >= 1222 || dateCode <= 119) return '摩羯座';
  if (dateCode >= 120 && dateCode <= 218) return '水瓶座';
  if (dateCode >= 219 && dateCode <= 320) return '双鱼座';
  return '';
};

const stripSensitiveTerms = (text = '') => {
  let cleaned = String(text || '').trim();
  for (const pattern of FORBIDDEN_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }
  return cleaned.replace(/\s+/g, ' ').trim();
};

const containsSensitiveTerm = (text = '') => {
  return FORBIDDEN_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(String(text || ''));
  });
};

const normalizeBirthday = (value = '') => {
  const birthday = String(value || '').trim().slice(0, 10);
  return calculateZodiacSign(birthday) ? birthday : '';
};

const normalizeMbti = (value = '') => {
  const mbti = stripSensitiveTerms(value).toUpperCase();
  return VALID_MBTI.has(mbti) ? mbti : '';
};

const normalizeGender = (value = '') => {
  const gender = stripSensitiveTerms(value).trim();
  return ['女', '男', '非二元', '暂不透露'].includes(gender) ? gender : '';
};

export const sanitizeVibeInput = (raw = {}) => {
  const draft = stripSensitiveTerms(raw.draft || raw.message || raw.text || '');
  const mood = stripSensitiveTerms(raw.mood || '');
  const platform = stripSensitiveTerms(raw.platform || 'Soul') || 'Soul';
  const birthday = normalizeBirthday(raw.birthday || '');
  const zodiac = birthday ? calculateZodiacSign(birthday) : stripSensitiveTerms(raw.zodiac || '');
  const gender = normalizeGender(raw.gender || '');
  const mbti = normalizeMbti(raw.mbti || '');
  const sbti = stripSensitiveTerms(raw.sbti || raw.socialStyle || '').slice(0, 24);
  const socialProblem = stripSensitiveTerms(raw.socialProblem || raw.problem || '').slice(0, 180);
  const interests = Array.isArray(raw.interests)
    ? raw.interests
        .map((item) => stripSensitiveTerms(item))
        .filter((item) => item && !containsSensitiveTerm(item))
        .slice(0, 8)
    : [];

  return {
    draft: draft || '最近想表达一点真实的状态，但还没想好怎么说。',
    mood: mood || '想被理解，也想更自然地表达',
    platform,
    interests: interests.length > 0 ? interests : DEFAULT_INTERESTS,
    birthday,
    zodiac,
    gender,
    mbti,
    sbti,
    socialProblem,
    tone: stripSensitiveTerms(raw.tone || '真诚松弛'),
    boundary: stripSensitiveTerms(raw.boundary || '保持舒服边界，不制造压力'),
  };
};

const scoreProfile = (input) => {
  const draftLength = input.draft.length;
  const interestBonus = Math.min(input.interests.length * 4, 20);
  const combinedText = `${input.draft} ${input.mood} ${input.socialProblem || ''}`;
  const vulnerabilityBonus = /孤独|尴尬|慢热|焦虑|害怕|想认识|想连接|同频|不会|不知道|困扰/.test(combinedText) ? 12 : 4;
  const selfLabelBonus = (input.mbti ? 3 : 0) + (input.sbti ? 3 : 0) + (input.zodiac ? 2 : 0) + (input.gender && input.gender !== '暂不透露' ? 1 : 0);
  const clarityPenalty = draftLength > 120 ? 10 : draftLength < 16 ? 8 : 0;
  const base = 46 + interestBonus + vulnerabilityBonus + selfLabelBonus - clarityPenalty;

  return clamp(base);
};

const makePoint = ({ id, stage, label, style, open, close, risk, volume, reason }) => {
  const high = clamp(Math.max(open, close) + 8 + Math.round(volume / 12));
  const low = clamp(Math.min(open, close) - risk);

  return {
    id,
    stage,
    label,
    style,
    open,
    close,
    high,
    low,
    score: close,
    volume: clamp(volume),
    volatility: clamp(risk * 4),
    riskLevel: risk >= 13 ? 'medium' : 'low',
    reason,
  };
};

const buildLifecycleKLine = (input, baseScore) => {
  const primaryInterest = input.interests[0] || '兴趣';
  const secondaryInterest = input.interests[1] || primaryInterest;
  const lifecycleNodes = [
    {
      stage: '眼缘停留',
      label: '第一眼亮点',
      style: '别人愿不愿意多看一秒',
      closeDelta: -14,
      risk: 13,
      volume: 38,
      reason: '第一眼不需要强刺激，但需要一个清晰、具体的兴趣信号，让别人知道为什么值得停一下。',
    },
    {
      stage: '眼缘停留',
      label: '可接近感',
      style: '看起来是否好接话',
      closeDelta: -10,
      risk: 12,
      volume: 44,
      reason: '慢热不等于冷淡，表达里保留一点真实状态，会降低别人理解你的成本。',
    },
    {
      stage: '眼缘停留',
      label: '停留理由',
      style: '为什么继续看',
      closeDelta: -6,
      risk: 10,
      volume: 50,
      reason: `把${primaryInterest}放在开头，会让同频者更快找到停留理由。`,
    },
    {
      stage: '想再看看',
      label: '可聊入口',
      style: '能不能看出聊什么',
      closeDelta: 2,
      risk: 8,
      volume: 66,
      reason: '具体兴趣越像真实生活片段，别人越容易从“看过”变成“想继续了解”。',
    },
    {
      stage: '想再看看',
      label: '真实样本',
      style: '不是标签堆叠',
      closeDelta: 6,
      risk: 8,
      volume: 70,
      reason: '动态样本能证明你不是标签堆叠，而是真的有可聊的生活细节。',
    },
    {
      stage: '想再看看',
      label: '舒服边界',
      style: '靠近时有没有压力',
      closeDelta: 4,
      risk: 7,
      volume: 60,
      reason: '清楚表达“慢慢聊”的节奏，会筛掉不匹配的人，也会提高同频者的安全感。',
    },
    {
      stage: '第一句话',
      label: '接话钩子',
      style: '评论是否自然发生',
      closeDelta: 1,
      risk: 11,
      volume: 56,
      reason: '别人需要一个能轻松评论的入口，只有情绪表达时容易让第一句话卡住。',
    },
    {
      stage: '第一句话',
      label: '私聊门槛',
      style: '私信会不会冒昧',
      closeDelta: -3,
      risk: 14,
      volume: 46,
      reason: '如果没有具体话题，私信会显得冒昧，连接分会短暂下探。',
    },
    {
      stage: '第一句话',
      label: '接话入口',
      style: '第三句空间',
      closeDelta: 5,
      risk: 10,
      volume: 62,
      reason: `从${secondaryInterest}或一个具体问题切入，能让对话更自然地走到第三句。`,
    },
    {
      stage: '同频点亮',
      label: '共同上头点',
      style: '共同话题被点亮',
      closeDelta: 12,
      risk: 7,
      volume: 78,
      reason: '一旦共同兴趣被点亮，聊天不再依赖硬找话题，连接会自然变顺。',
    },
    {
      stage: '同频点亮',
      label: '被懂瞬间',
      style: '被懂瞬间',
      closeDelta: 18,
      risk: 6,
      volume: 82,
      reason: '真实的慢热和细腻观察会变成优势，让懂你的人更快识别你的频道。',
    },
    {
      stage: '同频点亮',
      label: '相处想象',
      style: '相处想象',
      closeDelta: 20,
      risk: 7,
      volume: 76,
      reason: '生活节奏被看见后，别人更容易判断你们是否适合长期保持联系。',
    },
    {
      stage: '慢慢深聊',
      label: '愿意多说',
      style: '内容是否有厚度',
      closeDelta: 25,
      risk: 7,
      volume: 84,
      reason: '你不是速配型表达，优势在越聊越有层次，慢慢深聊时连接分会更高。',
    },
    {
      stage: '慢慢深聊',
      label: '回应稳定',
      style: '持续交流',
      closeDelta: 23,
      risk: 8,
      volume: 80,
      reason: '认真听和稳定回应会让关系不只停在兴趣交换，而能进入连续交流。',
    },
    {
      stage: '慢慢深聊',
      label: '不消耗感',
      style: '不消耗感',
      closeDelta: 22,
      risk: 8,
      volume: 72,
      reason: '不制造压力的边界感，会让深聊更舒服，也减少误解和过度投入。',
    },
    {
      stage: '再次想起',
      label: '记住你的点',
      style: '过后还能想起什么',
      closeDelta: 21,
      risk: 8,
      volume: 68,
      reason: `稳定保留${primaryInterest}这样的记忆符号，会让别人更容易再次想起你。`,
    },
    {
      stage: '再次想起',
      label: '下次话头',
      style: '下一次聊什么',
      closeDelta: 24,
      risk: 7,
      volume: 74,
      reason: '留下一个未完待续的话题，比一次性讲完所有自己更容易让对方下次再来找你。',
    },
    {
      stage: '再次想起',
      label: '想起余温',
      style: '轻松的回想感',
      closeDelta: 19,
      risk: 10,
      volume: 64,
      reason: '再次想起取决于稳定记忆点和轻松感，你适合成为越回想越想聊的人。',
    },
  ];

  let previousClose = clamp(baseScore - 18);
  return lifecycleNodes.map((node, index) => {
    const close = clamp(baseScore + node.closeDelta);
    const open = index === 0 ? clamp(baseScore - 20) : clamp(previousClose + (index % 3 === 0 ? 1 : 0));
    previousClose = close;

    return makePoint({
      id: `${node.stage}_${node.label}`.replace(/\s+/g, '_'),
      stage: node.stage,
      label: node.label,
      style: node.style,
      open,
      close,
      risk: node.risk,
      volume: node.volume,
      reason: node.reason,
    });
  });
};

const buildShareCards = (input) => {
  const interestText = input.interests.slice(0, 3).join('、');

  return [
    {
      id: 'market',
      title: '连接短评',
      tone: '可分享',
      text: `我的 WKU soul-kline：不是第一眼很吵的人，是越聊越容易被懂的慢热回声型。兴趣入口：${interestText}。`,
      bestFor: '适合生成分享卡或社交平台动态',
    },
    {
      id: 'intro',
      title: '自我介绍微调',
      tone: '更易被接住',
      text: `慢热，但对${interestText}有稳定热情。比起速聊，更喜欢从一个具体兴趣慢慢聊到真实生活。`,
      bestFor: '适合个人简介或置顶动态',
    },
    {
      id: 'signal',
      title: '同频信号',
      tone: '轻钩子',
      text: `如果你也喜欢${input.interests[0]}，又刚好不太喜欢硬聊，我们可能会在第三句之后开始变熟。`,
      bestFor: '适合引出评论或私信',
    },
  ];
};

const buildSoulmateSignals = (input) => {
  return [
    {
      type: '慢热共情型',
      resonance: 88,
      why: '他们不会用第一眼的热闹程度判断你，反而会被稳定、细腻和边界感吸引。',
      likelyReply: '我也是慢热的人，但看到你写的兴趣点会觉得可以慢慢聊。',
    },
    {
    type: `${input.interests[0]}同好型`,
    resonance: 84,
    why: '你的连接入口不是强社交，而是能被自然接住的具体兴趣。',
      likelyReply: `你也喜欢${input.interests[0]}？那我们可能有很多能交换的东西。`,
    },
    {
    type: '深夜长聊型',
    resonance: 79,
    why: '他们对“越聊越有内容”的人更敏感，第一眼不一定秒回，但慢慢深聊时容易升温。',
      likelyReply: '感觉你不是那种只适合寒暄的人，可能适合慢慢聊深一点。',
    },
  ];
};

const buildReplies = (input) => {
  return [
    `我懂你这种${input.interests[0]}入口的慢热感，熟起来之后反而会很稳定。`,
    '你的第一眼不一定很吵，但越看越有东西。',
    `如果从${input.interests[1] || input.interests[0]}聊起，感觉会比尬聊自然很多。`,
    '你像是那种不适合速配，但很适合被慢慢发现的人。',
    '你的 soul-kline 看起来是安静开场，但聊深之后回声很强。',
  ];
};

const buildRisingFactors = (input) => [
  {
    title: '兴趣入口具体',
    impact: 18,
    evidence: input.interests.slice(0, 3).join('、'),
    suggestion: '把兴趣放在第一段表达里，会提升“想再看看”和“第一句话”阶段。',
  },
  {
    title: '慢热边界清晰',
    impact: 14,
    evidence: input.mood,
    suggestion: '直接承认慢热，不会减分，反而能筛出更尊重节奏的人。',
  },
  {
    title: '适合深聊型关系',
    impact: 20,
    evidence: input.draft,
    suggestion: '不用追求第一眼高刺激，你的优势在“同频点亮”和“慢慢深聊”阶段。',
  },
];

const buildFallingFactors = (input) => [
  {
    title: '第一眼信号偏安静',
    risk: 12,
    evidence: input.draft.length > 80 ? '表达信息较长，第一眼需要更多阅读成本' : '表达较内收，第一眼刺激度不高',
    suggestion: `用一个具体入口开头，比如“${input.interests[0]}最近让我很上头”。`,
  },
  {
    title: '第一句话不够好接',
    risk: 10,
    evidence: /尴尬|不太会|怕|犹豫/.test(input.draft) ? '输入里出现了第一句话顾虑' : '缺少一个别人可以立刻接的话题钩子',
    suggestion: '给别人一个低压力问题，而不是只表达“想认识人”。',
  },
];

const buildRebalanceSuggestions = (input) => [
  `把“我想认识人”换成“有没有也喜欢${input.interests[0]}的人”，第一句话会更容易自然发生。`,
  '保留 2-3 个具体兴趣样本，比堆很多标签更容易让同频者停留。',
  '不要把慢热包装成缺点，它是你的筛选机制，也是慢慢深聊时的被懂信号。',
];

export const buildFallbackVibeLineResult = (raw = {}) => {
  const input = sanitizeVibeInput(raw);
  const baseScore = scoreProfile(input);
  const variants = buildShareCards(input);

  const kline = buildLifecycleKLine(input, baseScore);

  const risingFactors = buildRisingFactors(input);
  const fallingFactors = buildFallingFactors(input);
  const soulmateSignals = buildSoulmateSignals(input);
  const rebalanceSuggestions = buildRebalanceSuggestions(input);

  return {
    productName: 'WKU soul-kline',
    tagline: 'Who Know U? 谁懂你？谁是你的灵魂伴侣，想看看你的灵魂连接曲线？',
    input,
    marketType: '慢热回声型连接曲线',
    summary: '你的连接曲线不是“第一眼强刺激”，而是越进入具体兴趣和真实交流，越容易被懂。眼缘停留和第一句话阶段偏安静，但同频点亮、慢慢深聊、再次想起阶段具备更强留存力。',
    kline,
    variants,
    risingFactors,
    fallingFactors,
    soulmateSignals,
    rebalanceSuggestions,
    audienceLenses: soulmateSignals,
    simulatedReplies: buildReplies(input),
    expressionTips: [
      ...rebalanceSuggestions,
    ],
    safety: {
      status: 'passed',
      flags: [],
      note: '结果仅用于兴趣社交中的自我表达参考，不进行命运、医疗、金融或心理诊断判断。',
    },
    meta: {
      mode: 'fallback',
      generatedAt: new Date().toISOString(),
    },
  };
};

const unique = (items) => [...new Set(items.filter(Boolean))];

const getSharedInterests = (personA, personB) => {
  const a = personA.interests.map((item) => item.toLowerCase());
  return personB.interests.filter((item) => a.includes(item.toLowerCase()));
};

const buildPairSignals = (personA, personB, sharedInterests) => {
  const combinedInterests = unique([...sharedInterests, personA.interests[0], personB.interests[0], personA.interests[1], personB.interests[1]]).slice(0, 5);
  const labels = unique([personA.gender, personB.gender, personA.mbti, personB.mbti, personA.sbti, personB.sbti, personA.zodiac, personB.zodiac]).slice(0, 5);

  return [
    {
      title: sharedInterests.length > 0 ? '共同兴趣可以直接点亮' : '兴趣池有互补空间',
      impact: sharedInterests.length > 0 ? 18 : 10,
      evidence: combinedInterests.join('、'),
      suggestion: sharedInterests.length > 0
        ? `先从${sharedInterests[0]}聊起，第一句话会更自然。`
        : `可以用${personA.interests[0]}和${personB.interests[0]}互相交换推荐，先建立轻连接。`,
    },
    {
      title: '自我标签提供低成本理解入口',
      impact: labels.length > 0 ? 12 : 6,
      evidence: labels.length > 0 ? labels.join('、') : '双方没有填写太多标签，适合从真实动态判断',
      suggestion: '这些标签只作为表达偏好，不用拿来定型对方，真正的共振仍看具体聊天样本。',
    },
    {
      title: '当前社交诉求可被对齐',
      impact: 14,
      evidence: `${personA.mood} / ${personB.mood}`,
      suggestion: '把“想要怎样的交流节奏”说清楚，比猜测对方态度更容易进入深聊。',
    },
  ];
};

const buildPairRisks = (personA, personB) => [
  {
    title: '主动节奏可能错频',
    risk: /主动|第一句|第一句话|紧张|不知道|怕/.test(`${personA.socialProblem} ${personB.socialProblem}`) ? 16 : 10,
    evidence: `${personA.socialProblem || 'A 未填写具体困扰'} / ${personB.socialProblem || 'B 未填写具体困扰'}`,
    suggestion: '不要一开始就追问关系结论，先用低压力话题把第一句话成本降下来。',
  },
  {
    title: '标签理解可能过度简化',
    risk: 9,
    evidence: unique([personA.mbti, personB.mbti, personA.sbti, personB.sbti]).join('、') || '双方标签信息较少',
    suggestion: 'MBTI、SBTI 和星座只作为破冰材料，不要替代真实观察。',
  },
];

const buildConversationBridges = (personA, personB, sharedInterests) => {
  const firstShared = sharedInterests[0] || personA.interests[0];
  const secondTopic = sharedInterests[1] || personB.interests[0];

  return [
    `从“你最近在${firstShared}里最上头的一个点是什么？”开始，既具体又不冒犯。`,
    `用交换式破冰：“我最近被${personA.interests[0]}击中，你有没有一个类似的兴趣瞬间？”`,
    `如果聊到${secondTopic}，可以问“这件事对你来说是放松、表达，还是逃离现实的一小段？”`,
    '当对话开始变长时，留一个下一次继续聊的小尾巴，而不是一次性把所有问题问完。',
  ];
};

const MATCH_STAGE_FLOW = [
  {
    stage: '互相注意',
    nodes: [
      { label: '相互停留', style: '两个人是否都愿意多看一眼' },
      { label: '印象差值', style: '第一眼理解是否接近' },
      { label: '共同好奇', style: '彼此有没有继续看的理由' },
    ],
  },
  {
    stage: '靠近意愿',
    nodes: [
      { label: '想继续了解', style: '看完之后是否愿意靠近' },
      { label: '安全节奏', style: '靠近时有没有压力感' },
      { label: '下一次入口', style: '是否能自然进入下一段交流' },
    ],
  },
  {
    stage: '破冰默契',
    nodes: [
      { label: '第一句自然度', style: '第一句话能不能轻松发生' },
      { label: '接话空间', style: '回应是否有余地继续展开' },
      { label: '沉默缓冲', style: '短暂停顿会不会变成误会' },
    ],
  },
  {
    stage: '共振点亮',
    nodes: [
      { label: '共同兴趣亮起', style: '共同点是否真的被点亮' },
      { label: '情绪接住', style: '表达能不能被对方接住' },
      { label: '节奏对齐', style: '聊天速度是否让双方舒服' },
    ],
  },
  {
    stage: '信任升温',
    nodes: [
      { label: '愿意透露更多', style: '是否愿意多打开一层' },
      { label: '边界互认', style: '靠近时是否尊重彼此边界' },
      { label: '深聊承接', style: '话题能不能进入更具体的原因' },
    ],
  },
  {
    stage: '余温回访',
    nodes: [
      { label: '聊天余温', style: '聊完后是否还留有余味' },
      { label: '下次钩子', style: '有没有下次继续聊的入口' },
      { label: '再次靠近', style: '之后还会不会想起彼此' },
    ],
  },
];

const getMatchStageNode = (index) => {
  const stage = MATCH_STAGE_FLOW[Math.floor(index / 3)] || MATCH_STAGE_FLOW[MATCH_STAGE_FLOW.length - 1];
  const node = stage.nodes[index % 3] || stage.nodes[0];
  return {
    stage: stage.stage,
    label: node.label,
    style: node.style,
  };
};

const buildResonanceKLine = (personAResult, personBResult, sharedInterests) => {
  const overlapBonus = Math.min(sharedInterests.length * 4, 10);
  return personAResult.kline.map((pointA, index) => {
    const pointB = personBResult.kline[index] || pointA;
    const matchNode = getMatchStageNode(index);
    const close = clamp(Math.round((pointA.close + pointB.close) / 2 + overlapBonus - Math.abs(pointA.close - pointB.close) * 0.18));
    const open = clamp(Math.round((pointA.open + pointB.open) / 2 + overlapBonus - Math.abs(pointA.open - pointB.open) * 0.14));
    const volume = clamp(Math.round((pointA.volume + pointB.volume) / 2 + overlapBonus * 2));
    const risk = clamp(Math.round(Math.abs(pointA.close - pointB.close) * 0.28 + (sharedInterests.length > 0 ? 6 : 11)), 5, 24);

    return makePoint({
      id: `match_${pointA.id}`,
      stage: matchNode.stage,
      label: matchNode.label,
      style: matchNode.style,
      open,
      close,
      risk,
      volume,
      reason: `${matchNode.stage}/${matchNode.label}：A 的连接分 ${pointA.close}，B 的连接分 ${pointB.close}。${sharedInterests.length > 0 ? `共同兴趣 ${sharedInterests.join('、')} 会提高话题流动性。` : '双方兴趣互补，但需要更明确的桥梁话题。'}`,
    });
  });
};

const getPairTopic = (personA = {}, personB = {}, sharedInterests = []) => {
  return sharedInterests[0]
    || personA.interests?.[0]
    || personB.interests?.[0]
    || '一个轻话题';
};

const getStageAdviceCopy = ({
  stage,
  avg,
  highest,
  lowest,
  avgVolume,
  avgVolatility,
  personA,
  personB,
  sharedInterests = [],
  relationshipGoal,
}) => {
  const topic = getPairTopic(personA, personB, sharedInterests);
  const hasSharedInterest = sharedInterests.length > 0;
  const aProblem = personA.socialProblem || 'A 的第一句话压力';
  const bProblem = personB.socialProblem || 'B 的表达顾虑';
  const pressureNote = avgVolatility >= 55 ? '这一段理解成本偏高，先把表达放轻。' : '这一段理解成本可控，可以多给一点真实细节。';

  const copyByStage = {
    互相注意: {
      highlight: `${highest.label} 是两个人最先愿意停下来的信号`,
      risk: `${lowest.label} 如果差值过大，容易只看见标签而不是具体的人`,
      suggestion: `先用${topic}做轻量停留，不急着判断关系。目标是让双方都觉得“可以再看一眼”。`,
    },
    靠近意愿: {
      highlight: `${highest.label} 能把“看见彼此”推进到“愿意靠近一点”`,
      risk: `${lowest.label} 如果压力太强，会让靠近变成被迫回应`,
      suggestion: `这一段适合说清楚交流节奏，例如“可以慢慢聊”。围绕${topic}留下一个下次还能继续的小入口。`,
    },
    破冰默契: {
      highlight: `${highest.label} 是两个人把沉默变成第一句的关键`,
      risk: `${lowest.label} 会放大 ${aProblem} / ${bProblem} 这类顾虑`,
      suggestion: `第一句不要问关系结论。围绕${topic}交换一个最近喜欢的片段，让对方有低压力回应空间。`,
    },
    共振点亮: {
      highlight: `${highest.label} 是当前最容易让两个人确认同频的节点`,
      risk: `${lowest.label} 如果推进太快，会把共鸣误读成必须马上升温`,
      suggestion: hasSharedInterest
        ? `共同兴趣已经出现，可以围绕${sharedInterests.slice(0, 2).join('、')}聊“为什么喜欢”，让共同标签变成共同感受。`
        : `这里适合做兴趣交换，而不是强找共同点。让 A 分享一个${personA.interests?.[0] || '兴趣'}瞬间，B 接一个${personB.interests?.[0] || '生活片段'}瞬间。`,
    },
    信任升温: {
      highlight: `${highest.label} 说明你们有机会把话题聊到更具体的内在原因`,
      risk: `${lowest.label} 如果没有边界，会让深聊变成情绪压力`,
      suggestion: `这一段可以回应“为什么这件事对我重要”，但每次只打开一层。围绕${relationshipGoal || '慢慢靠近'}保持节奏，别一次性把结论问完。`,
    },
    余温回访: {
      highlight: `${highest.label} 是聊完后还想再次靠近的关键记忆点`,
      risk: `${lowest.label} 如果没有下次入口，关系容易停在一次高分聊天`,
      suggestion: `收尾时留一个能自然回来的小尾巴，例如“下次我想听你讲${topic}里另一个片段”。再次靠近靠余温，不靠追问。`,
    },
    眼缘停留: {
      highlight: `${highest.label} 是第一眼最值得露出的连接信号`,
      risk: `${lowest.label} 如果太含糊，会让对方不知道为什么停留`,
      suggestion: `先抛一个和${topic}有关的轻量信号，不急着解释自己，也不急着判断对方。目标是让对方有一个自然停下来的理由。`,
    },
    想再看看: {
      highlight: `${highest.label} 能把“看过你”推进到“想继续了解你”`,
      risk: `${lowest.label} 如果只剩标签，容易被当成普通资料页划走`,
      suggestion: `这一段要放真实样本：一条和${topic}有关的具体动态，比堆 MBTI、SBTI 或星座更能让人判断你们是否同频。`,
    },
    第一句话: {
      highlight: `${highest.label} 是最适合把沉默变成第一句的入口`,
      risk: `${lowest.label} 会放大 ${aProblem} / ${bProblem} 这类压力`,
      suggestion: `把第一句设计成可轻松回答的小问题，例如围绕${topic}交换一个最近喜欢的片段，避免一上来确认关系目标。`,
    },
    同频点亮: {
      highlight: `${highest.label} 是当前最容易确认同频的节点`,
      risk: `${lowest.label} 如果推进太快，会把共鸣误读成必须立刻升温`,
      suggestion: hasSharedInterest
        ? `共同兴趣已经出现，可以围绕${sharedInterests.slice(0, 2).join('、')}聊“为什么喜欢”，让共鸣从共同标签进入共同感受。`
        : `这里适合做兴趣交换，而不是强找共同点。让 A 分享一个${personA.interests?.[0] || '兴趣'}瞬间，B 接一个${personB.interests?.[0] || '生活片段'}瞬间。`,
    },
    慢慢深聊: {
      highlight: `${highest.label} 说明你们有机会聊到更具体的内在原因`,
      risk: `${lowest.label} 如果没有边界，会让深聊变成情绪压力`,
      suggestion: `深聊阶段可以回应“为什么这件事对你重要”，但每次只打开一层。围绕${relationshipGoal || '慢慢深聊'}保持节奏，别一次性把结论问完。`,
    },
    再次想起: {
      highlight: `${highest.label} 是让对方之后还会想起你的关键记忆点`,
      risk: `${lowest.label} 如果没有下一次钩子，聊天容易在高分处自然散掉`,
      suggestion: `收尾时留一个下次还能接上的小尾巴，例如“下次我想听你讲${topic}里另一个片段”。再次想起靠余温，不靠追问。`,
    },
  };

  return copyByStage[stage] || {
    highlight: `${highest.label} 是这一段的主要共振节点`,
    risk: `${lowest.label} 是这一段更需要照顾的错频点`,
    suggestion: avg >= 76
      ? `${pressureNote} 继续围绕${topic}推进，但保持可退出的轻松感。`
      : avg >= 62
        ? `${pressureNote} 先搭一个具体话题桥梁，让双方都能轻松接话。`
        : `${pressureNote} 先降低表达压力，用开放式小问题替代强推进。`,
  };
};

const buildStageAdvice = (resonanceKline, context = {}) => {
  const grouped = resonanceKline.reduce((acc, point) => {
    const stage = point.stage || point.label;
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(point);
    return acc;
  }, {});

  return Object.entries(grouped).map(([stage, points]) => {
    const avg = Math.round(points.reduce((sum, point) => sum + point.close, 0) / points.length);
    const avgVolume = Math.round(points.reduce((sum, point) => sum + point.volume, 0) / points.length);
    const avgVolatility = Math.round(points.reduce((sum, point) => sum + point.volatility, 0) / points.length);
    const lowest = points.reduce((worst, point) => (point.close < worst.close ? point : worst), points[0]);
    const highest = points.reduce((best, point) => (point.close > best.close ? point : best), points[0]);
    const copy = getStageAdviceCopy({
      stage,
      avg,
      highest,
      lowest,
      avgVolume,
      avgVolatility,
      ...context,
    });

    return {
      stage,
      score: avg,
      highlight: copy.highlight,
      risk: copy.risk,
      suggestion: `${copy.suggestion}${avgVolume >= 72 ? ' 这一段话题流动性高，可以多留一个可延展的问题。' : ''}`,
    };
  });
};

export const buildFallbackVibeMatchResult = (raw = {}) => {
  const personA = sanitizeVibeInput(raw.personA || raw.a || {});
  const personB = sanitizeVibeInput(raw.personB || raw.b || {});
  const relationshipGoal = stripSensitiveTerms(raw.relationshipGoal || raw.goal || '想知道两个人是否适合自然聊起来');
  const personAResult = buildFallbackVibeLineResult(personA);
  const personBResult = buildFallbackVibeLineResult(personB);
  const sharedInterests = getSharedInterests(personA, personB);
  const resonanceKline = buildResonanceKLine(personAResult, personBResult, sharedInterests);
  const averageClose = Math.round(resonanceKline.reduce((sum, point) => sum + point.close, 0) / resonanceKline.length);
  const matchScore = clamp(averageClose + Math.min(sharedInterests.length * 3, 8));
  const overlapSignals = buildPairSignals(personA, personB, sharedInterests);
  const mismatchRisks = buildPairRisks(personA, personB);
  const conversationBridges = buildConversationBridges(personA, personB, sharedInterests);
  const stageAdvice = buildStageAdvice(resonanceKline, {
    personA,
    personB,
    sharedInterests,
    relationshipGoal,
  });

  return {
    productName: 'WKU soul-kline',
    mode: 'Who Know Us',
    tagline: 'Who Know Us? 看见两个人怎么靠近，而不是给关系下结论。',
    input: {
      personA,
      personB,
      relationshipGoal,
    },
    personA: personAResult,
    personB: personBResult,
    matchScore,
    marketType: matchScore >= 78 ? '高共振慢热靠近曲线' : matchScore >= 64 ? '可培养同频观察曲线' : '需要桥梁话题的观察曲线',
    summary: `这不是判断两个人“配不配”，而是看你们在兴趣社交里的连接走势。当前共振分 ${matchScore}，${sharedInterests.length > 0 ? `共同兴趣 ${sharedInterests.join('、')} 是主要靠近信号` : '兴趣互补但需要更明确的第一句话桥梁'}，目标是：${relationshipGoal}。`,
    resonanceKline,
    overlapSignals,
    mismatchRisks,
    stageAdvice,
    conversationBridges,
    safety: {
      status: 'passed',
      flags: [],
      note: '双人结果仅用于兴趣社交中的表达参考，不承诺关系结果，不进行人格定型或情感操控。',
    },
    meta: {
      mode: 'fallback',
      generatedAt: new Date().toISOString(),
    },
  };
};

const normalizeKLine = (points, fallbackPoints) => {
  if (!Array.isArray(points) || points.length < 12) return fallbackPoints;

  return points.map((point, index) => {
    const fallback = fallbackPoints[index] || fallbackPoints[0];
    const open = clamp(Number(point.open ?? fallback.open));
    const close = clamp(Number(point.close ?? fallback.close));
    const high = clamp(Number(point.high ?? Math.max(open, close) + 8));
    const low = clamp(Number(point.low ?? Math.min(open, close) - 8));

    return {
      id: String(point.id || fallback.id || `point_${index}`),
      stage: String(point.stage || fallback.stage || point.label || fallback.label || `阶段${index + 1}`),
      label: String(point.label || fallback.label || `阶段${index + 1}`),
      style: String(point.style || fallback.style || '连接阶段'),
      open,
      close,
      high: Math.max(high, open, close),
      low: Math.min(low, open, close),
      score: clamp(Number(point.score ?? close)),
      volume: clamp(Number(point.volume ?? fallback.volume ?? 60)),
      volatility: clamp(Number(point.volatility ?? fallback.volatility ?? 30)),
      riskLevel: point.riskLevel === 'medium' || point.riskLevel === 'high' ? point.riskLevel : 'low',
      reason: String(point.reason || fallback.reason || '基于兴趣锚点、表达边界和连接阶段推进力生成。'),
    };
  });
};

export const mergeVibeLineAgentResults = (rawInput = {}, agentResults = {}) => {
  const input = sanitizeVibeInput(rawInput);
  const fallback = buildFallbackVibeLineResult(input);
  const safety = agentResults.safety_authenticity?.safety || fallback.safety;

  return {
    ...fallback,
    input,
    marketType: agentResults.narrative_packaging?.marketType || agentResults.persona_asset?.marketType || fallback.marketType,
    summary: agentResults.narrative_packaging?.summary || agentResults.persona_asset?.summary
      ? (agentResults.narrative_packaging?.summary || agentResults.persona_asset?.summary)
      : fallback.summary,
    kline: normalizeKLine(agentResults.lifecycle_kline?.kline, fallback.kline),
    variants: Array.isArray(agentResults.narrative_packaging?.shareCards) && agentResults.narrative_packaging.shareCards.length > 0
      ? agentResults.narrative_packaging.shareCards
      : fallback.variants,
    risingFactors: Array.isArray(agentResults.resonance_factor?.risingFactors) && agentResults.resonance_factor.risingFactors.length > 0
      ? agentResults.resonance_factor.risingFactors
      : fallback.risingFactors,
    fallingFactors: Array.isArray(agentResults.resonance_factor?.fallingFactors) && agentResults.resonance_factor.fallingFactors.length > 0
      ? agentResults.resonance_factor.fallingFactors
      : fallback.fallingFactors,
    soulmateSignals: Array.isArray(agentResults.audience_market?.soulmateSignals) && agentResults.audience_market.soulmateSignals.length > 0
      ? agentResults.audience_market.soulmateSignals
      : fallback.soulmateSignals,
    audienceLenses: Array.isArray(agentResults.audience_market?.soulmateSignals) && agentResults.audience_market.soulmateSignals.length > 0
      ? agentResults.audience_market.soulmateSignals
      : fallback.audienceLenses,
    rebalanceSuggestions: Array.isArray(agentResults.resonance_factor?.rebalanceSuggestions) && agentResults.resonance_factor.rebalanceSuggestions.length > 0
      ? agentResults.resonance_factor.rebalanceSuggestions
      : fallback.rebalanceSuggestions,
    simulatedReplies: Array.isArray(agentResults.narrative_packaging?.marketQuestions) && agentResults.narrative_packaging.marketQuestions.length > 0
      ? agentResults.narrative_packaging.marketQuestions
      : fallback.simulatedReplies,
    expressionTips: [
      ...(Array.isArray(agentResults.resonance_factor?.rebalanceSuggestions) ? agentResults.resonance_factor.rebalanceSuggestions : []),
      ...(Array.isArray(agentResults.safety_authenticity?.authenticityTips) ? agentResults.safety_authenticity.authenticityTips : []),
      ...fallback.expressionTips,
    ].slice(0, 6),
    safety: {
      status: safety.status || 'passed',
      flags: Array.isArray(safety.flags) ? safety.flags : [],
      note: safety.note || fallback.safety.note,
    },
    meta: {
      mode: Object.keys(agentResults).length > 0 ? 'agent' : 'fallback',
      completedAgents: Object.keys(agentResults),
      generatedAt: new Date().toISOString(),
    },
  };
};
