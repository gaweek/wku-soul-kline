import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Eye, Clock, Loader2, Share2 } from 'lucide-react';
import SEO from '../components/SEO';
import { getArticleBySlug, getArticles, KnowledgeArticle as Article, getCategoryName } from '../services/contentService';
import ArticleCard from '../components/knowledge/ArticleCard';

const KnowledgeArticle: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      loadArticle(slug);
    }
  }, [slug]);

  const loadArticle = async (articleSlug: string) => {
    setLoading(true);
    setNotFound(false);
    try {
      const data = await getArticleBySlug(articleSlug);
      if (!data) {
        setNotFound(true);
        return;
      }
      setArticle(data);

      // Load related articles from same category
      const related = await getArticles(data.category, 4);
      setRelatedArticles(related.filter(a => a.slug !== articleSlug).slice(0, 3));
    } catch (error) {
      console.error('Failed to load article:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <BookOpen className="w-16 h-16 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-700">文章不存在</h1>
        <p className="text-gray-500">您访问的文章可能已被删除或不存在</p>
        <Link
          to="/knowledge"
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          返回知识中心
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={article.title}
        description={article.summary}
        url={`/knowledge/${article.slug}`}
        type="article"
      />

      <div className="min-h-screen bg-gray-50">
        {/* Article Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Link to="/knowledge" className="hover:text-indigo-600 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                知识中心
              </Link>
              <span>/</span>
              <span>{getCategoryName(article.category)}</span>
            </div>

            {/* Category Tag */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                <BookOpen className="w-4 h-4" />
                {getCategoryName(article.category)}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif-sc mb-4">
              {article.title}
            </h1>

            {/* Summary */}
            <p className="text-lg text-gray-600 mb-6">
              {article.summary}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(article.createdAt).toLocaleDateString('zh-CN')}
              </span>
              {article.viewCount > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {article.viewCount} 次阅读
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
            {/* Render Markdown content */}
            <div className="prose prose-lg prose-indigo max-w-none">
              {article.content?.split('\n').map((paragraph, index) => {
                // Handle headers
                if (paragraph.startsWith('## ')) {
                  return <h2 key={index} className="text-2xl font-bold text-gray-800 mt-8 mb-4">{paragraph.slice(3)}</h2>;
                }
                if (paragraph.startsWith('### ')) {
                  return <h3 key={index} className="text-xl font-bold text-gray-800 mt-6 mb-3">{paragraph.slice(4)}</h3>;
                }
                // Handle lists
                if (paragraph.startsWith('- ')) {
                  return <li key={index} className="text-gray-700 ml-4">{paragraph.slice(2)}</li>;
                }
                if (paragraph.match(/^\d+\. /)) {
                  return <li key={index} className="text-gray-700 ml-4 list-decimal">{paragraph.replace(/^\d+\. /, '')}</li>;
                }
                // Handle bold text
                if (paragraph.includes('**')) {
                  const parts = paragraph.split(/\*\*(.*?)\*\*/g);
                  return (
                    <p key={index} className="text-gray-700 leading-relaxed mb-4">
                      {parts.map((part, i) =>
                        i % 2 === 1 ? <strong key={i} className="font-bold text-gray-900">{part}</strong> : part
                      )}
                    </p>
                  );
                }
                // Regular paragraphs
                if (paragraph.trim()) {
                  return <p key={index} className="text-gray-700 leading-relaxed mb-4">{paragraph}</p>;
                }
                return null;
              })}
            </div>
          </article>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-6 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">标签：</span>
              {article.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-3">想要看看自己的人生K线？</h3>
            <p className="text-indigo-100 mb-6">结合传统命理与金融可视化，洞悉命运起伏</p>
            <Link
              to="/"
              className="inline-block px-8 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              立即生成我的K线
            </Link>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">相关文章</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((related) => (
                  <ArticleCard key={related.id} article={related} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default KnowledgeArticle;
