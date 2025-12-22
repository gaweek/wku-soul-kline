import React, { useState, useEffect, useRef } from 'react';
import {
  History,
  ChevronRight,
  ChevronDown,
  Plus,
  User,
  Trash2,
  MoreVertical,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  X,
  Save,
} from 'lucide-react';
import { LifeDestinyResult, UserInput } from '../types';

interface HistoryItem {
  id: string;
  createdAt: string;
  cost: number;
  input: UserInput;
  result: LifeDestinyResult;
  bookmarked?: boolean;
  note?: string;
}

interface HistorySidebarProps {
  onSelect: (result: LifeDestinyResult, input: UserInput) => void;
  onNewCalculation: () => void;
  isLoggedIn: boolean;
  selectedId?: string;
  className?: string;
}

const HISTORY_STORAGE_KEY = 'lifekline_history';

const getLocalHistory = (): HistoryItem[] => {
  try {
    const data = localStorage.getItem(HISTORY_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const deleteLocalHistoryItem = (id: string) => {
  try {
    const history = getLocalHistory();
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

const updateLocalHistoryItem = (id: string, updates: Partial<HistoryItem>) => {
  try {
    const history = getLocalHistory();
    const updated = history.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return getLocalHistory();
  }
};

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  onSelect,
  onNewCalculation,
  isLoggedIn,
  selectedId,
  className = '',
}) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [noteDialogId, setNoteDialogId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Default display count
  const defaultDisplayCount = 3;
  const displayHistory = expanded ? history : history.slice(0, defaultDisplayCount);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      if (isLoggedIn) {
        const response = await fetch('/api/history', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          const items = data.items || [];
          const fullHistory: HistoryItem[] = [];

          for (const item of items.slice(0, 10)) {
            try {
              const detailRes = await fetch(`/api/history/${item.id}`, { credentials: 'include' });
              if (detailRes.ok) {
                const detail = await detailRes.json();
                if (detail.item?.input && detail.item?.result) {
                  fullHistory.push(detail.item);
                }
              }
            } catch {
              // Skip failed items
            }
          }

          const localHistory = getLocalHistory();
          const mergedHistory = [...fullHistory, ...localHistory]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 20);
          setHistory(mergedHistory);
        } else {
          setHistory(getLocalHistory());
        }
      } else {
        setHistory(getLocalHistory());
      }
    } catch {
      setHistory(getLocalHistory());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [isLoggedIn]);

  // Refresh history when localStorage changes
  useEffect(() => {
    const handleStorage = () => {
      setHistory(getLocalHistory());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这条记录吗？')) {
      const updated = deleteLocalHistoryItem(id);
      setHistory(updated);
    }
    setContextMenuId(null);
  };

  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = history.find(h => h.id === id);
    if (item) {
      const updated = updateLocalHistoryItem(id, { bookmarked: !item.bookmarked });
      setHistory(updated);
    }
    setContextMenuId(null);
  };

  const handleOpenNoteDialog = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = history.find(h => h.id === id);
    setNoteText(item?.note || '');
    setNoteDialogId(id);
    setContextMenuId(null);
  };

  const handleSaveNote = () => {
    if (noteDialogId) {
      const updated = updateLocalHistoryItem(noteDialogId, { note: noteText.trim() });
      setHistory(updated);
      setNoteDialogId(null);
      setNoteText('');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;

    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">测算历史</h3>
            <p className="text-xs text-gray-400">{history.length} 条记录</p>
          </div>
        </div>
      </div>

      {/* New Calculation Button */}
      <div className="px-3 py-3">
        <button
          onClick={onNewCalculation}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all font-medium text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          新建测算
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-2">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="px-2 py-6 text-center">
            <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500">暂无历史记录</p>
          </div>
        ) : (
          <div className="space-y-1">
            {displayHistory.map((item) => {
              const isSelected = selectedId === item.id;

              return (
                <div
                  key={item.id}
                  className={`relative group rounded-lg transition-colors ${
                    isSelected ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <button
                    onClick={() => item.result && item.input && onSelect(item.result, item.input)}
                    className="w-full px-3 py-2.5 text-left flex items-center gap-2"
                  >
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gradient-to-br from-gray-100 to-gray-50'
                    }`}>
                      <User className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-medium text-sm truncate ${isSelected ? 'text-indigo-700' : 'text-gray-800'}`}>
                            {item.input?.name || '匿名'}
                          </span>
                          {item.bookmarked && (
                            <BookmarkCheck className="w-3 h-3 text-amber-500 flex-shrink-0" />
                          )}
                          {item.note && (
                            <MessageSquare className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-xs text-gray-400 ml-1">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {item.input?.yearPillar} {item.input?.monthPillar} {item.input?.dayPillar} {item.input?.hourPillar}
                      </p>
                      {item.note && (
                        <p className="text-xs text-indigo-500 truncate mt-0.5 italic">
                          "{item.note}"
                        </p>
                      )}
                    </div>

                    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-indigo-500' : 'text-gray-300'}`} />
                  </button>

                  {/* Context Menu Trigger */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenuId(contextMenuId === item.id ? null : item.id);
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all"
                  >
                    <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {/* Context Menu */}
                  {contextMenuId === item.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-28">
                      <button
                        onClick={(e) => handleToggleBookmark(item.id, e)}
                        className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                      >
                        {item.bookmarked ? (
                          <>
                            <BookmarkCheck className="w-3 h-3 text-amber-500" />
                            取消收藏
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3 h-3" />
                            收藏
                          </>
                        )}
                      </button>
                      <button
                        onClick={(e) => handleOpenNoteDialog(item.id, e)}
                        className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3 h-3" />
                        {item.note ? '编辑备注' : '添加备注'}
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3 h-3" />
                        删除
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expand/Collapse */}
      {history.length > defaultDisplayCount && (
        <div className="px-3 py-2 border-t border-gray-100">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-indigo-600 py-1"
          >
            {expanded ? '收起' : `查看全部 ${history.length} 条`}
            <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      {/* Note Dialog Modal */}
      {noteDialogId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            {/* Dialog Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-gray-800">添加备注</span>
              </div>
              <button
                onClick={() => {
                  setNoteDialogId(null);
                  setNoteText('');
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Dialog Content */}
            <div className="p-4">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="输入备注内容，如：张三的八字、需要重点关注健康..."
                className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-2">
                备注可帮助你快速识别和查找历史记录
              </p>
            </div>

            {/* Dialog Actions */}
            <div className="flex gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => {
                  setNoteDialogId(null);
                  setNoteText('');
                }}
                className="flex-1 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveNote}
                className="flex-1 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorySidebar;
