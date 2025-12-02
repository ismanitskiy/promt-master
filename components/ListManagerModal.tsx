import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Trash2 } from 'lucide-react';

interface ListManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: string[];
  onSave: (items: string[]) => void;
}

export const ListManagerModal: React.FC<ListManagerModalProps> = ({
  isOpen,
  onClose,
  title,
  items,
  onSave,
}) => {
  const [currentItems, setCurrentItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCurrentItems([...items]);
    }
  }, [isOpen, items]);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newItem.trim() && !currentItems.includes(newItem.trim())) {
      setCurrentItems([...currentItems, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemove = (itemToRemove: string) => {
    setCurrentItems(currentItems.filter((item) => item !== itemToRemove));
  };

  const handleSave = () => {
    onSave(currentItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="Add new item..."
            />
            <button
              onClick={handleAdd}
              disabled={!newItem.trim()}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 mb-4">
            {currentItems.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-4">No items yet.</p>
            ) : (
              currentItems.map((item) => (
                <div key={item} className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-100 group">
                  <span className="text-sm text-slate-700">{item}</span>
                  <button
                    onClick={() => handleRemove(item)}
                    className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};