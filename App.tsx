import React, { useState, useEffect } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { PromptData, DEFAULT_DASHBOARD_BLOCKS, DEFAULT_CLIENT_PLATFORMS } from './types';
import { PromptList } from './components/PromptList';
import { PromptForm } from './components/PromptForm';
import { ListManagerModal } from './components/ListManagerModal';
import { Layers, Plus, Database, Github, Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'prompt_master_data';
const STORAGE_BLOCKS_KEY = 'prompt_master_blocks';
const STORAGE_CLIENTS_KEY = 'prompt_master_clients';

// Mock Initial Data if storage is empty
const MOCK_DATA: PromptData[] = [
  {
    id: '1',
    nameUA: 'Генератор SEO опису',
    nameEN: 'seo_desc_generator',
    content: 'You are an SEO expert. Write a meta description for a blog post about the following topic. Keep it under 160 characters.',
    hint: 'Use for blog posts',
    dashboardBlocks: ['Main Content'],
    clients: ['Web'],
    options: [
      { id: 'opt1', label: 'Tone: Professional', value: 'Maintain a highly professional and corporate tone.' },
      { id: 'opt2', label: 'Tone: Fun', value: 'Make it sound fun and engaging.' }
    ],
    createdAt: Date.now()
  },
  {
    id: '2',
    nameUA: 'Перекладач JSON',
    nameEN: 'json_translator',
    content: 'Translate the values in the following JSON object to Spanish. Do not change keys.',
    hint: 'Technical translation tool',
    dashboardBlocks: ['Sidebar', 'Toolbar'],
    clients: ['API', 'Desktop'],
    options: [],
    createdAt: Date.now() - 100000
  }
];

export default function App() {
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [availableBlocks, setAvailableBlocks] = useState<string[]>(DEFAULT_DASHBOARD_BLOCKS);
  const [availableClients, setAvailableClients] = useState<string[]>(DEFAULT_CLIENT_PLATFORMS);

  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingPrompt, setEditingPrompt] = useState<PromptData | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Modal State
  const [managerModal, setManagerModal] = useState<{
    isOpen: boolean;
    type: 'blocks' | 'clients';
  }>({ isOpen: false, type: 'blocks' });

  // Load data on mount
  useEffect(() => {
    // Load Prompts
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPrompts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse storage", e);
        setPrompts(MOCK_DATA);
      }
    } else {
      setPrompts(MOCK_DATA);
    }

    // Load Configs
    const savedBlocks = localStorage.getItem(STORAGE_BLOCKS_KEY);
    if (savedBlocks) {
      try { setAvailableBlocks(JSON.parse(savedBlocks)); } catch (e) { }
    }

    const savedClients = localStorage.getItem(STORAGE_CLIENTS_KEY);
    if (savedClients) {
      try { setAvailableClients(JSON.parse(savedClients)); } catch (e) { }
    }

    setIsLoaded(true);
  }, []);

  // Save data on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
      localStorage.setItem(STORAGE_BLOCKS_KEY, JSON.stringify(availableBlocks));
      localStorage.setItem(STORAGE_CLIENTS_KEY, JSON.stringify(availableClients));
    }
  }, [prompts, availableBlocks, availableClients, isLoaded]);

  const handleCreate = () => {
    setEditingPrompt(undefined);
    setView('create');
  };

  const handleEdit = (prompt: PromptData) => {
    setEditingPrompt(prompt);
    setView('edit');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      setPrompts(prompts.filter(p => p.id !== id));
    }
  };

  const handleSavePrompt = (data: PromptData) => {
    if (view === 'edit') {
      setPrompts(prompts.map(p => p.id === data.id ? data : p));
    } else {
      setPrompts([data, ...prompts]);
    }
    setView('list');
  };

  const handleListSave = (items: string[]) => {
    if (managerModal.type === 'blocks') {
      setAvailableBlocks(items);
    } else {
      setAvailableClients(items);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-200">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setDarkMode(!darkMode)}>
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Closia.ai prompts collection</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {view === 'list' && (
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center px-3 py-2 sm:px-4 bg-indigo-600 border border-transparent rounded-lg font-medium text-sm text-white hover:bg-indigo-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">New Prompt</span>
                  <span className="sm:hidden">New</span>
                </button>
              )}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors sm:hidden"
                title="Toggle Dark Mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumbs / Header */}
        <div className="mb-6 flex items-center text-sm text-slate-500">
          {view !== 'list' && (
            <button onClick={() => setView('list')} className="hover:text-indigo-600 flex items-center gap-1">
              <span className="text-slate-400">&larr;</span> Back to List
            </button>
          )}
        </div>

        {view === 'list' ? (
          <div className="animate-fade-in">
            <PromptList
              prompts={prompts}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <PromptForm
              initialData={editingPrompt}
              availableDashboardBlocks={availableBlocks}
              availableClients={availableClients}
              onSave={handleSavePrompt}
              onCancel={() => setView('list')}
              onManageBlocks={() => setManagerModal({ isOpen: true, type: 'blocks' })}
              onManageClients={() => setManagerModal({ isOpen: true, type: 'clients' })}
            />
          </div>
        )}
      </main>

      <ListManagerModal
        isOpen={managerModal.isOpen}
        onClose={() => setManagerModal(prev => ({ ...prev, isOpen: false }))}
        title={managerModal.type === 'blocks' ? 'Manage Dashboard Blocks' : 'Manage Client Platforms'}
        items={managerModal.type === 'blocks' ? availableBlocks : availableClients}
        onSave={handleListSave}
      />
      <Analytics />
    </div>
  );
}