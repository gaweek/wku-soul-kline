import React, { useState, useEffect } from 'react';
import { BookOpen, Loader2, Filter } from 'lucide-react';
import SearchBar from '../components/knowledge/SearchBar';
import ArticleCard from '../components/knowledge/ArticleCard';
import SEO from '../components/SEO';
import { getArticles, KnowledgeArticle, CATEGORY_MAP, getCategoryName } from '../services/contentService';

const CATEGORIES = [
  { key: '', label: '全部' },
  { key: 'quickstart', label: '快速入门' },
  { key: 'kline', label: 'K线逻辑' },
  { key: 'bazi', label: '八字基础' },
  { key: 'dayun', label: '大运流年' },
  { key: 'method', label: '方法误区' },
  { key: 'faq', label: '常见问题' },
];

const KnowledgeHub: React.FC = () => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadArticles();
  }, [selectedCategory]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await getArticles(selectedCategory || undefined, 50);
      setArticles(data);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="知识中心"
        description="学习八字命理与人生K线的核心知识，理解命运起伏的逻辑，掌握K线解读方法。"
        url="/knowledge"
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="starfield-bg text-white">
          <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
            <div className="flex flex-col items-center text-center">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl mb-6">
                <BookOpen className="w-12 h-12" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-serif-sc mb-4 bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-400 text-transparent bg-clip-text">
                知识殿堂
              </h1>
              <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mb-8">
                从入门到精通，系统学习八字命理与人生K线解读方法。
                用科学的视角理解命运的逻辑。
              </p>
              <SearchBar placeholder="搜索文章..." />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Category Filter */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.key
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300 hover:text-purple-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">暂无文章</h3>
              <p className="text-gray-500">
                {selectedCategory
                  ? `"${getCategoryName(selectedCategory)}" 分类下暂无文章`
                  : '知识中心内容即将上线，敬请期待'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default KnowledgeHub;
