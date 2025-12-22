import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Loader2, BookOpen, FolderOpen, X, TrendingUp } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'article' | 'case';
  title: string;
  description: string;
  slug?: string;
  tags?: string[];
  category?: string;
}

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Search handler
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/content/search?q=${encodeURIComponent(searchQuery.trim())}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('搜索出错，请稍后重试');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Clear search
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">搜索</h1>
          <p className="text-gray-600">搜索知识文章和命理案例</p>
        </div>

        {/* Search Input */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <SearchIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索知识、案例..."
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 placeholder-gray-400"
              autoFocus
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Popular searches or hints */}
          {!hasSearched && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">热门搜索：</p>
              <div className="flex flex-wrap gap-2">
                {['八字', '大运', '流年', '事业', '婚姻', '财运'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1 bg-gray-100 hover:bg-indigo-100 hover:text-indigo-600 text-gray-600 rounded-full text-sm transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {!loading && hasSearched && (
          <>
            <div className="mb-4">
              <p className="text-gray-600">
                找到 <span className="font-bold text-gray-900">{results.length}</span> 条结果
              </p>
            </div>

            {results.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-2">未找到相关结果</p>
                <p className="text-sm text-gray-500">尝试使用其他关键词搜索</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <Link
                    key={result.id}
                    to={
                      result.type === 'article'
                        ? `/knowledge/${result.slug}`
                        : `/cases/${result.id}`
                    }
                    className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-200 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          result.type === 'article'
                            ? 'bg-indigo-100'
                            : 'bg-purple-100'
                        }`}
                      >
                        {result.type === 'article' ? (
                          <BookOpen
                            className={`w-6 h-6 ${
                              result.type === 'article'
                                ? 'text-indigo-600'
                                : 'text-purple-600'
                            }`}
                          />
                        ) : (
                          <FolderOpen
                            className={`w-6 h-6 ${
                              result.type === 'case'
                                ? 'text-purple-600'
                                : 'text-indigo-600'
                            }`}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${
                              result.type === 'article'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {result.type === 'article' ? '知识' : '案例'}
                          </span>
                          {result.category && (
                            <span className="text-xs text-gray-500">
                              {result.category}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                          {result.title}
                        </h3>

                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {result.description}
                        </p>

                        {/* Tags */}
                        {result.tags && result.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {result.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Quick Links (when no search) */}
        {!hasSearched && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <Link
              to="/knowledge"
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">知识库</h3>
                  <p className="text-sm text-gray-600">浏览全部命理知识</p>
                </div>
              </div>
            </Link>

            <Link
              to="/cases"
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-purple-200 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">案例库</h3>
                  <p className="text-sm text-gray-600">查看真实案例分析</p>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
