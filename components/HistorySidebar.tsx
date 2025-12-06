import React from 'react';
import { HistoryItem } from '../types';
import { TrashIcon, ClockIcon } from './Icons';

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p className="text-sm">暂无历史记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">最近优化</h3>
        <button 
          onClick={onClear}
          className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 flex items-center gap-1 transition-colors"
        >
          <TrashIcon /> 清空
        </button>
      </div>
      
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {history.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelect(item)}
            className="group relative bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary cursor-pointer transition-all shadow-sm hover:shadow-md"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <ClockIcon />
                {new Date(item.timestamp).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
              {item.original}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistorySidebar;