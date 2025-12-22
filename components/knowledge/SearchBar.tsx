import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, BookOpen, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { searchContent, SearchResult, getCategoryName } from '../../services/contentService';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = '搜索文章、案例...'
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // 防抖搜索
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchContent(query);
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery('');
    setResults(null);
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query.trim());
      setIsOpen(false);
    }
  };

  const hasResults = results && (results.articles.length > 0 || results.cases.length > 0);

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results && setIsOpen(true)}
            placeholder={placeholder}
            className="glass-card w-full pl-12 pr-12 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
          />
          {loading && (
            <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 animate-spin" />
          )}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          {!hasResults && query.length >= 2 && !loading && (
            <div className="p-6 text-center text-gray-500">
              <p>没有找到 "{query}" 相关的内容</p>
            </div>
          )}

          {hasResults && (
            <>
              {/* Articles */}
              {results.articles.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      知识文章
                    </h4>
                  </div>
                  {results.articles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/knowledge/${article.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-gray-50"
                    >
                      <p className="font-medium text-gray-800 line-clamp-1">{article.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{article.summary}</p>
                      <span className="text-xs text-indigo-600 mt-1 inline-block">
                        {getCategoryName(article.category)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Cases */}
              {results.cases.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      案例库
                    </h4>
                  </div>
                  {results.cases.map((caseItem) => (
                    <Link
                      key={caseItem.id}
                      to={`/cases/${caseItem.id}`}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-gray-50"
                    >
                      <p className="font-medium text-gray-800">{caseItem.title}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          {caseItem.persona}
                        </span>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                          {caseItem.curveType}型
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
