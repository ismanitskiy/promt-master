import React, { useState, useMemo } from 'react';
import { PromptData } from '../types';
import { estimateTokens, calculateFlashCost, formatCost } from '../utils';
import { Search, Edit2, Copy, Trash2, CheckSquare, Square, Smartphone, LayoutTemplate, Coins } from 'lucide-react';

interface PromptListProps {
  prompts: PromptData[];
  onEdit: (prompt: PromptData) => void;
  onDelete: (id: string) => void;
}

export const PromptList: React.FC<PromptListProps> = ({ prompts, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMassCopied, setIsMassCopied] = useState(false);

  // Filter Logic
  const filteredPrompts = useMemo(() => {
    if (!searchTerm) return prompts;
    const lower = searchTerm.toLowerCase();
    return prompts.filter(p =>
      p.nameUA.toLowerCase().includes(lower) ||
      p.nameEN.toLowerCase().includes(lower) ||
      p.content.toLowerCase().includes(lower) ||
      p.hint.toLowerCase().includes(lower) ||
      p.dashboardBlocks.some(b => b.toLowerCase().includes(lower)) ||
      p.clients.some(c => c.toLowerCase().includes(lower)) ||
      p.options.some(o => o.label.toLowerCase().includes(lower) || o.value.toLowerCase().includes(lower))
    );
  }, [prompts, searchTerm]);

  // Selection Logic
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPrompts.length && filteredPrompts.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPrompts.map(p => p.id)));
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleMassCopy = () => {
    const selectedPrompts = prompts.filter(p => selectedIds.has(p.id));
    const textToCopy = selectedPrompts.map(p => `### ${p.nameEN}\n${p.content}`).join('\n\n');
    navigator.clipboard.writeText(textToCopy);
    setIsMassCopied(true);
    setTimeout(() => {
      setIsMassCopied(false);
      setSelectedIds(new Set());
    }, 2000);
  };

  const isAllSelected = filteredPrompts.length > 0 && selectedIds.size === filteredPrompts.length;

  // Calculate Totals for Selected
  const selectedStats = useMemo(() => {
    const selected = prompts.filter(p => selectedIds.has(p.id));
    let totalTokens = 0;
    selected.forEach(p => {
      const fullText = `${p.content} ${p.options.map(o => o.label + o.value).join(' ')} ${p.hint}`;
      totalTokens += estimateTokens(fullText);
    });
    return {
      count: selected.length,
      tokens: totalTokens,
      cost: calculateFlashCost(totalTokens)
    };
  }, [selectedIds, prompts]);

  return (
    <div className="space-y-4">
      {/* Search Bar & Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 items-center transition-colors">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search prompts by name, content, tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        {/* Bulk Actions & Stats */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-4 animate-fade-in w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wide">Total ({selectedStats.count})</span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-300">{selectedStats.tokens.toLocaleString()} tok</span>
                  <span className="w-px h-3 bg-indigo-200 dark:bg-indigo-700"></span>
                  <span className="font-mono text-green-700 dark:text-green-400 font-semibold">{formatCost(selectedStats.cost)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleMassCopy}
              className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-sm transition-all text-sm font-medium whitespace-nowrap ${isMassCopied ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isMassCopied ? <CheckSquare className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {isMassCopied ? 'Copied!' : 'Copy All'}
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">
                <th className="p-4 w-12 text-center">
                  <button onClick={toggleSelectAll} className="hover:text-indigo-600">
                    {isAllSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </button>
                </th>
                <th className="p-4">Prompt Name</th>
                <th className="p-4">Tags</th>
                <th className="p-4 w-1/3">Preview</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
              {filteredPrompts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No prompts found matching your search.
                  </td>
                </tr>
              ) : (
                filteredPrompts.map((prompt) => (
                  <tr key={prompt.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedIds.has(prompt.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleSelect(prompt.id)}
                        className={`text-slate-400 hover:text-indigo-600 ${selectedIds.has(prompt.id) ? 'text-indigo-600' : ''}`}
                      >
                        {selectedIds.has(prompt.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="p-4 align-top">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{prompt.nameUA}</div>
                      <div className="font-mono text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 inline-block px-1.5 py-0.5 rounded mt-1 border border-indigo-100 dark:border-indigo-800/50">
                        {prompt.nameEN}
                      </div>
                      {prompt.hint && <div className="text-slate-500 dark:text-slate-400 text-xs mt-1 italic">{prompt.hint}</div>}
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {prompt.dashboardBlocks.map(b => (
                          <span key={b} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50">
                            <LayoutTemplate className="w-3 h-3 mr-1" /> {b}
                          </span>
                        ))}
                        {prompt.clients.map(c => (
                          <span key={c} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-800/50">
                            <Smartphone className="w-3 h-3 mr-1" /> {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <p className="text-slate-600 dark:text-slate-300 line-clamp-2" title={prompt.content}>
                        {prompt.content}
                      </p>
                      {prompt.options.length > 0 && (
                        <div className="mt-2 flex gap-1 flex-wrap">
                          {prompt.options.slice(0, 3).map(o => (
                            <span key={o.id} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-1 rounded border border-slate-200 dark:border-slate-600">
                              {o.label}
                            </span>
                          ))}
                          {prompt.options.length > 3 && <span className="text-[10px] text-slate-400">+{prompt.options.length - 3}</span>}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right align-top">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleCopy(prompt.content, prompt.id)}
                          className={`p-1.5 rounded transition-all ${copiedId === prompt.id ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'}`}
                          title="Copy Prompt"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(prompt)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(prompt.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
          <span>Total Prompts: {prompts.length}</span>
          <span>Showing: {filteredPrompts.length}</span>
        </div>
      </div>
    </div>
  );
};