import React, { useState, useEffect } from 'react';
import { MoonIcon, SunIcon, SparklesIcon, CopyIcon, TrashIcon, CheckIcon, HistoryIcon, CogIcon, XMarkIcon } from './components/Icons';
import HistorySidebar from './components/HistorySidebar';
import SettingsModal from './components/SettingsModal';
import { optimizePromptService } from './services/apiService';
import { HistoryItem, ApiSettings } from './types';

const DEFAULT_SETTINGS: ApiSettings = {
  apiUrl: 'https://api.laozhang.ai/v1/chat/completions',
  apiKey: 'sk-8NQS7zi4iDbFD9p3269cFc20387d46Dc97594c495fD2E623',
  model: 'gpt-3.5-turbo'
};

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [inputPrompt, setInputPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [apiSettings, setApiSettings] = useState<ApiSettings>(DEFAULT_SETTINGS);

  // Initialize Theme, History, and Settings
  useEffect(() => {
    // Theme
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }

    // History
    const savedHistory = localStorage.getItem('promptHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }

    // Settings
    const savedSettings = localStorage.getItem('apiSettings');
    if (savedSettings) {
      try {
        setApiSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const saveSettings = (newSettings: ApiSettings) => {
    setApiSettings(newSettings);
    localStorage.setItem('apiSettings', JSON.stringify(newSettings));
  };

  const handleOptimize = async () => {
    if (!inputPrompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setOptimizedPrompt('');

    try {
      const result = await optimizePromptService(inputPrompt, apiSettings);
      setOptimizedPrompt(result);

      // Save to history
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        original: inputPrompt,
        optimized: result,
        timestamp: Date.now()
      };
      
      const newHistory = [newItem, ...history].slice(0, 50); // Keep last 50
      setHistory(newHistory);
      localStorage.setItem('promptHistory', JSON.stringify(newHistory));
      
    } catch (err: any) {
      setError(err.message || '优化过程中发生未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!optimizedPrompt) return;
    navigator.clipboard.writeText(optimizedPrompt);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const clearInput = () => {
    setInputPrompt('');
    setOptimizedPrompt('');
    setError(null);
  };

  const clearHistory = () => {
    if (confirm('确定要清空所有历史记录吗？')) {
      setHistory([]);
      localStorage.removeItem('promptHistory');
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setInputPrompt(item.original);
    setOptimizedPrompt(item.optimized);
    setError(null);
    setShowHistoryMobile(false);
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200">
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        onSave={saveSettings} 
        currentSettings={apiSettings} 
      />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary to-blue-600 text-white p-2 rounded-lg">
                <SparklesIcon />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:from-blue-400 dark:to-blue-200 hidden sm:block">
              提示词优化大师
            </h1>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:hidden">
              Prompt大师
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
             <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
              aria-label="Settings"
            >
              <CogIcon />
            </button>
            <button
              onClick={() => setShowHistoryMobile(!showHistoryMobile)}
              className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
            >
              <HistoryIcon />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Input & Output Column */}
          <div className="flex-grow space-y-8">
            
            {/* Intro Section */}
            <div className="text-center lg:text-left space-y-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                让您的AI更懂你
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
                输入简单的想法，立即获得结构清晰、逻辑严密的专业提示词。适用于 GPT-4, Claude, Midjourney 等各类大模型。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Input */}
              <div className="space-y-4 flex flex-col h-full">
                <div className="flex justify-between items-center">
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    原始提示词
                    <span className="ml-2 text-xs text-gray-400 font-normal">({inputPrompt.length} 字符)</span>
                  </label>
                  {inputPrompt && (
                    <button onClick={clearInput} className="text-xs text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 flex items-center gap-1">
                      <TrashIcon /> 清空
                    </button>
                  )}
                </div>
                
                <div className="relative flex-grow group">
                  <textarea
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    placeholder="例如：帮我写一篇关于人工智能的博客文章..."
                    className="w-full h-64 md:h-96 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-shadow shadow-sm group-hover:shadow-md outline-none"
                  ></textarea>
                </div>

                <button
                  onClick={handleOptimize}
                  disabled={isLoading || !inputPrompt.trim()}
                  className={`w-full py-3 px-6 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 
                    ${isLoading || !inputPrompt.trim() 
                      ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                      : 'bg-gradient-to-r from-primary to-blue-600 hover:shadow-blue-500/30'
                    }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      正在优化中...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <SparklesIcon /> 立即优化
                    </span>
                  )}
                </button>
              </div>

              {/* Right Column: Output */}
              <div className="space-y-4 flex flex-col h-full">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    优化结果
                  </label>
                  {optimizedPrompt && (
                    <button 
                      onClick={handleCopy} 
                      className={`text-xs flex items-center gap-1 transition-colors px-2 py-1 rounded
                        ${copySuccess ? 'text-success bg-green-50 dark:bg-green-900/20' : 'text-primary hover:text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'}
                      `}
                    >
                      {copySuccess ? <CheckIcon /> : <CopyIcon />}
                      {copySuccess ? '已复制' : '复制结果'}
                    </button>
                  )}
                </div>

                <div className="relative flex-grow">
                  {error ? (
                    <div className="w-full h-full p-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400">
                      <p className="text-center">{error}</p>
                    </div>
                  ) : (
                    <div className={`w-full h-64 md:h-96 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 overflow-y-auto whitespace-pre-wrap leading-relaxed ${!optimizedPrompt ? 'flex items-center justify-center text-gray-400' : ''}`}>
                      {optimizedPrompt || (
                        <div className="text-center space-y-2">
                           <p className="text-sm">优化后的提示词将显示在这里</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Optimization Tips / Placeholder logic */}
                 <div className="h-[48px] hidden md:block">
                     {/* Spacer to align buttons visually if needed, or place secondary actions here */}
                 </div>
              </div>

            </div>
          </div>

          {/* Sidebar (Desktop) */}
          <div className="hidden lg:block w-80 flex-shrink-0 border-l border-gray-200 dark:border-gray-800 pl-8">
            <div className="sticky top-24">
              <HistorySidebar history={history} onSelect={loadHistoryItem} onClear={clearHistory} />
            </div>
          </div>

        </div>
      </main>

      {/* Mobile History Drawer/Modal */}
      {showHistoryMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowHistoryMobile(false)}></div>
          <div className="absolute right-0 top-0 bottom-0 w-3/4 max-w-sm bg-white dark:bg-gray-900 p-4 shadow-xl overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">历史记录</h2>
                <button onClick={() => setShowHistoryMobile(false)} className="text-gray-500">
                  <XMarkIcon />
                </button>
             </div>
             <HistorySidebar history={history} onSelect={loadHistoryItem} onClear={clearHistory} />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2025 提示词优化大师. All rights reserved. 
            <span className="hidden sm:inline"> | 此工具仅供学习与研究使用。</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;