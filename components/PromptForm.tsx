import React, { useState, useEffect } from 'react';
import { PromptData, PromptOption } from '../types';
import { MultiSelect } from './MultiSelect';
import { estimateTokens, calculateCost, formatCost, generateId, PRICING } from '../utils';
import { Plus, Trash2, Save, X, Coins, Zap, Brain, Smartphone } from 'lucide-react';

interface PromptFormProps {
  initialData?: PromptData;
  availableDashboardBlocks: string[];
  availableClients: string[];
  onSave: (data: PromptData) => void;
  onCancel: () => void;
  onManageBlocks: () => void;
  onManageClients: () => void;
}

export const PromptForm: React.FC<PromptFormProps> = ({
  initialData,
  availableDashboardBlocks,
  availableClients,
  onSave,
  onCancel,
  onManageBlocks,
  onManageClients
}) => {
  const [nameUA, setNameUA] = useState(initialData?.nameUA || '');
  const [nameEN, setNameEN] = useState(initialData?.nameEN || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [hint, setHint] = useState(initialData?.hint || '');
  const [dashboardBlocks, setDashboardBlocks] = useState<string[]>(initialData?.dashboardBlocks || []);
  const [clients, setClients] = useState<string[]>(initialData?.clients || []);
  const [options, setOptions] = useState<PromptOption[]>(initialData?.options || []);



  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Stats
  const [tokenCount, setTokenCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [cost, setCost] = useState(0);
  const [selectedModel, setSelectedModel] = useState<keyof typeof PRICING>('gemini-flash');

  useEffect(() => {
    // Calculate total text content for token estimation
    // Content + Options Labels + Options Values + Hint + Names (approximate full context usage)
    const optionsText = options.map(o => o.label + o.value).join(' ');
    const fullText = `${content} ${optionsText} ${hint} ${nameUA} ${nameEN}`;
    const tokens = estimateTokens(fullText);
    setTokenCount(tokens);
    setCharCount(fullText.length);
    setCost(calculateCost(tokens, selectedModel));
  }, [content, options, hint, nameUA, nameEN, selectedModel]);

  const validateNameEn = (value: string) => {
    if (!/^[a-z0-9_]*$/.test(value)) {
      setErrors(prev => ({ ...prev, nameEN: 'Must be in format name_name (lowercase, numbers, underscores only)' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.nameEN;
        return newErrors;
      });
    }
    setNameEN(value);
  };

  const handleSave = () => {
    // Final Validation
    const newErrors: Record<string, string> = {};
    if (!nameUA) newErrors.nameUA = 'Required';
    if (!nameEN) newErrors.nameEN = 'Required';
    if (!/^[a-z0-9_]+$/.test(nameEN)) newErrors.nameEN = 'Must be snake_case (e.g. my_prompt)';
    if (!content) newErrors.content = 'Required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const newPrompt: PromptData = {
        id: initialData?.id || generateId(),
        nameUA,
        nameEN,
        content,
        hint,
        dashboardBlocks,
        clients,
        options,
        createdAt: initialData?.createdAt || Date.now()
      };
      onSave(newPrompt);
    } catch (e) {
      console.error("Failed to save prompt:", e);
      alert("Failed to save prompt. Please check console for details.");
    }
  };

  const addOption = () => {
    setOptions([...options, { id: generateId(), label: '', value: '' }]);
  };

  const updateOption = (id: string, field: 'label' | 'value', value: string) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, [field]: value } : opt));
  };

  const removeOption = (id: string) => {
    setOptions(options.filter(opt => opt.id !== id));
  };



  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 animate-fade-in relative transition-colors">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
          {initialData ? 'Edit Prompt' : 'Create New Prompt'}
        </h2>

        {/* Token Counter Widget */}


        <button onClick={onCancel} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Names */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name (Ukrainian)</label>
            <input
              type="text"
              value={nameUA}
              onChange={(e) => setNameUA(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
              placeholder="Назва промпту"
            />
            {errors.nameUA && <p className="text-red-500 text-xs mt-1">{errors.nameUA}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name (English ID)</label>
            <input
              type="text"
              value={nameEN}
              onChange={(e) => validateNameEn(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 ${errors.nameEN ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800' : 'border-slate-300 dark:border-slate-600'}`}
              placeholder="my_prompt_name"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Format: snake_case only</p>
            {errors.nameEN && <p className="text-red-500 text-xs mt-1">{errors.nameEN}</p>}
          </div>
        </div>

        {/* Dashboard & Clients */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <MultiSelect
            label="Dashboard Blocks"
            options={availableDashboardBlocks}
            selected={dashboardBlocks}
            onChange={setDashboardBlocks}
            onManage={onManageBlocks}
          />
          <div className="mt-4">
            <MultiSelect
              label="Client Platforms"
              options={availableClients}
              selected={clients}
              onChange={setClients}
              onManage={onManageClients}
            />
          </div>
        </div>

        {/* Content Area with AI */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prompt Content</label>
          <div className="relative">
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm leading-relaxed text-slate-900 dark:text-slate-100 placeholder-slate-400"
              placeholder="Enter your system prompt here..."
            />
          </div>

          {/* Token & Cost Calculator */}
          <div className="flex flex-col gap-3 mt-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-md border border-slate-200 dark:border-slate-700 text-sm">

            {/* Model Selection */}
            <div className="flex gap-2 mb-1">
              <button
                type="button"
                onClick={() => setSelectedModel('gemini-flash')}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border transition-colors ${selectedModel === 'gemini-flash' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600'}`}
              >
                <Zap className="w-3 h-3" /> Gemini Flash
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel('gemini-thinking')}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border transition-colors ${selectedModel === 'gemini-thinking' ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600'}`}
              >
                <Brain className="w-3 h-3" /> Gemini Thinking
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel('gemini-nano')}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border transition-colors ${selectedModel === 'gemini-nano' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600'}`}
              >
                <Smartphone className="w-3 h-3" /> Gemini Nano
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="font-medium text-slate-700 dark:text-slate-300">Tokens: {tokenCount.toLocaleString()}</span>
              </div>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Chars: {charCount.toLocaleString()}</span>
              </div>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Cost/Run:</span>
                <span className="font-mono font-medium text-green-600 dark:text-green-400">{formatCost(cost)}</span>
              </div>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">1k Runs:</span>
                <span className="font-mono font-medium text-green-600 dark:text-green-400">{formatCost(cost * 1000)}</span>
              </div>
            </div>
          </div>
          {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
        </div>

        {/* Hint */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Usage Hint</label>
          <input
            type="text"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
            placeholder="Brief description of what this prompt does..."
          />
        </div>

        {/* Options */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Prompt Options / Mini-prompts</label>
            <button type="button" onClick={addOption} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Option
            </button>
          </div>
          <div className="space-y-2">
            {options.map((opt) => (
              <div key={opt.id} className="flex gap-2 items-start animate-fade-in">
                <input
                  type="text"
                  placeholder="Label (e.g. Tone: Formal)"
                  value={opt.label}
                  onChange={(e) => updateOption(opt.id, 'label', e.target.value)}
                  className="w-1/3 px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
                />
                <input
                  type="text"
                  placeholder="Mini-prompt value (e.g. Use a formal tone.)"
                  value={opt.value}
                  onChange={(e) => updateOption(opt.id, 'value', e.target.value)}
                  className="flex-1 px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => removeOption(opt.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {options.length === 0 && (
              <p className="text-sm text-slate-400 italic">No options added yet.</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm font-medium flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Prompt
          </button>
        </div>
      </div>
    </div>
  );
};
