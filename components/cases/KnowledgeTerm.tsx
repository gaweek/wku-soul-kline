import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface KnowledgeTermProps {
  term: string;
  children: React.ReactNode;
}

// Glossary of numerology terms with explanations
const glossary: Record<string, { title: string; description: string; category?: string }> = {
  // Basic concepts
  '八字': {
    title: '八字',
    description: '根据一个人出生的年、月、日、时，用天干地支表示，共八个字，故称八字。又称四柱，是中国传统命理学的基础。',
    category: '基础概念',
  },
  '天干': {
    title: '天干',
    description: '甲、乙、丙、丁、戊、己、庚、辛、壬、癸，共十个天干。分别对应五行木、火、土、金、水，又分阴阳。',
    category: '基础概念',
  },
  '地支': {
    title: '地支',
    description: '子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥，共十二地支，对应十二生肖和十二时辰。',
    category: '基础概念',
  },
  '五行': {
    title: '五行',
    description: '金、木、水、火、土五种元素，相生相克。木生火、火生土、土生金、金生水、水生木；木克土、土克水、水克火、火克金、金克木。',
    category: '基础概念',
  },
  '日主': {
    title: '日主',
    description: '日柱的天干，代表命主本人，是八字分析的核心。日主的强弱决定了命局的喜忌和用神的选择。',
    category: '基础概念',
  },
  '子午相冲': {
    title: '子午相冲',
    description: '地支相冲的一种，子（鼠）和午（马）相冲，代表方位、时间或能量上的对立冲突，可能带来变动、不稳定或挑战。',
    category: '地支关系',
  },
  '天克地冲': {
    title: '天克地冲',
    description: '天干相克且地支相冲的组合，是八字中最强烈的冲克关系，通常预示重大变动、冲突或转折点。',
    category: '干支关系',
  },
  '食神制杀': {
    title: '食神制杀',
    description: '食神克制七杀的格局，食神代表温和的表达力，能够化解七杀的凶性，将压力转化为动力，属于吉利的组合。',
    category: '十神关系',
  },
  '七杀攻身': {
    title: '七杀攻身',
    description: '七杀直接攻克日主的情况，代表强大的压力、挑战或竞争，需要有印星或食神来化解，否则容易遭遇困境。',
    category: '十神关系',
  },
  '比劫夺财': {
    title: '比劫夺财',
    description: '比肩或劫财过多，争夺财星的现象，可能代表竞争激烈、财运不稳或需要提防小人、合作风险。',
    category: '十神关系',
  },
  '伤官见官': {
    title: '伤官见官',
    description: '伤官和正官同时出现的格局，两者相克，容易导致是非口舌、官非诉讼或职场冲突，需要谨慎处理。',
    category: '十神关系',
  },
  '财多身弱': {
    title: '财多身弱',
    description: '财星过多而日主能量不足，虽有财运但难以驾驭，可能出现财来财去、操劳辛苦或健康问题。',
    category: '格局',
  },
  '身旺财旺': {
    title: '身旺财旺',
    description: '日主强旺且财星有力的理想格局，既有能力又有财运，能够把握机会创造财富，属于富贵之命。',
    category: '格局',
  },
  '印绶护身': {
    title: '印绶护身',
    description: '印星生助日主，提供保护和支持，代表贵人相助、学识提升或母亲的关爱，能化解凶煞。',
    category: '十神关系',
  },
  '官印相生': {
    title: '官印相生',
    description: '正官生印星的循环，代表权力与学识结合，事业顺遂且受人尊重，是文贵之命的标志。',
    category: '十神关系',
  },
  '财官双美': {
    title: '财官双美',
    description: '财星和官星都配置良好的格局，财生官，代表既有财富又有地位，事业财运两得意。',
    category: '格局',
  },
  '羊刃驾杀': {
    title: '羊刃驾杀',
    description: '羊刃与七杀配合的格局，刚强果决，能够在困境中突破，适合军警武职或需要魄力的行业。',
    category: '格局',
  },
  '日贵格': {
    title: '日贵格',
    description: '日柱坐贵人的格局，天生气质高雅，易得贵人相助，一生较为顺遂，受人尊重。',
    category: '格局',
  },
  '金水伤官': {
    title: '金水伤官',
    description: '金生水的伤官格，聪明机智，善于表达和创作，但需要见官星来成格，否则恐流于放纵。',
    category: '格局',
  },
  '木火通明': {
    title: '木火通明',
    description: '木生火的相生格局，文采斐然，思维活跃，适合文化艺术或需要创意的工作。',
    category: '格局',
  },
  '稼穑格': {
    title: '稼穑格',
    description: '土势强旺的格局，务实稳重，善于积累财富，但需要木来疏通，否则过于固执。',
    category: '格局',
  },
  '从格': {
    title: '从格',
    description: '日主太弱，顺从其他五行的格局，需要顺势而为，不可逆势而行，人生道路需要灵活变通。',
    category: '特殊格局',
  },
  '化气格': {
    title: '化气格',
    description: '天干合化成功的格局，五行转化，命运有特殊的转折和机遇，需要特定的条件才能成格。',
    category: '特殊格局',
  },
  '驿马星': {
    title: '驿马星',
    description: '代表动态、迁移、变动的神煞，命带驿马者多奔波走动，适合外出发展或经常出差的工作。',
    category: '神煞',
  },
  '桃花星': {
    title: '桃花星',
    description: '代表异性缘、魅力、感情的神煞，可能带来良好的人际关系，但也需要注意感情纠葛。',
    category: '神煞',
  },
  '华盖星': {
    title: '华盖星',
    description: '代表艺术、宗教、孤独的神煞，有华盖者多具艺术天赋或宗教缘分，但可能性格孤高。',
    category: '神煞',
  },
  '文昌星': {
    title: '文昌星',
    description: '代表学识、文采、考试运的吉星，有文昌者读书考试较有利，适合从事文化教育工作。',
    category: '神煞',
  },
  '天乙贵人': {
    title: '天乙贵人',
    description: '最重要的吉星之一，代表贵人相助，遇事能逢凶化吉，一生多得他人帮助。',
    category: '神煞',
  },
  '天德贵人': {
    title: '天德贵人',
    description: '德性之星，心地善良，能化解灾厄，一生较为平安顺遂。',
    category: '神煞',
  },
  '月德贵人': {
    title: '月德贵人',
    description: '与天德贵人类似，主贵人相助和德行，能够逢凶化吉。',
    category: '神煞',
  },
  '将星': {
    title: '将星',
    description: '领导能力的象征，有将星者多具管理才能，适合担任领导职位。',
    category: '神煞',
  },
  '金舆': {
    title: '金舆',
    description: '代表车马、富贵的神煞，古代指贵族的车辆，现代可引申为交通工具或物质享受。',
    category: '神煞',
  },
  '空亡': {
    title: '空亡',
    description: '代表空虚、落空的神煞，所在宫位的事物可能比较虚无或难以如愿，需要务实努力。',
    category: '神煞',
  },
  '孤辰寡宿': {
    title: '孤辰寡宿',
    description: '代表孤独的神煞，可能在感情或人际关系上较为孤单，但也可能独立性强。',
    category: '神煞',
  },
  '刑冲破害': {
    title: '刑冲破害',
    description: '地支之间不和谐关系的总称，包括相刑、相冲、相破、相害，代表矛盾冲突或不顺。',
    category: '地支关系',
  },
  '三合局': {
    title: '三合局',
    description: '三个地支合成一个五行局，力量强大，代表团队合作或能量的聚集。',
    category: '地支关系',
  },
  '三会局': {
    title: '三会局',
    description: '三个地支会合成一个方位的能量，比三合局更强，代表强大的五行力量。',
    category: '地支关系',
  },
  '六合': {
    title: '六合',
    description: '地支相合的关系，代表和谐、帮助、合作，是吉利的组合。',
    category: '地支关系',
  },
  '暗合': {
    title: '暗合',
    description: '地支之间的暗中相合关系，不如明合明显，但仍有助益作用。',
    category: '地支关系',
  },
  '拱合': {
    title: '拱合',
    description: '两个地支拱合另一个地支，代表隐藏的支持或潜在的机会。',
    category: '地支关系',
  },
};

export const KnowledgeTerm: React.FC<KnowledgeTermProps> = ({ term, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const termInfo = glossary[term];

  if (!termInfo) {
    // If term not in glossary, just return the children without tooltip
    return <>{children}</>;
  }

  return (
    <span className="relative inline-block">
      <span
        className="border-b-2 border-dotted border-indigo-400 cursor-help text-indigo-700 font-medium hover:text-indigo-900 hover:border-indigo-600 transition-colors"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        {children}
      </span>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 animate-fade-in">
          <div className="bg-gray-900 text-white rounded-lg shadow-2xl p-4 max-w-xs w-64">
            {/* Arrow pointing down */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-8 border-transparent border-t-gray-900"></div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-white">{termInfo.title}</h4>
                {termInfo.category && (
                  <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                    {termInfo.category}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-200 leading-relaxed">
                {termInfo.description}
              </p>

              <div className="flex items-center gap-1 text-[10px] text-gray-400 pt-1 border-t border-gray-700">
                <HelpCircle className="w-3 h-3" />
                <span>点击或悬停查看</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </span>
  );
};

export default KnowledgeTerm;
