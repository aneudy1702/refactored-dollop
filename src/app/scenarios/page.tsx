'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ActionList from '@/components/ActionList';

type Action = {
  type: 'click' | 'type' | 'wait';
  selector?: string;
  value?: string;
  delay?: number;
};

interface Scenario {
  id: string;
  name: string;
  url1: string;
  url2: string;
  actions: Action[];
}

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Scenario, 'id'>>({ name: '', url1: '', url2: '', actions: [] });
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('sitecompare_scenarios');
    if (saved) setScenarios(JSON.parse(saved));
  }, []);

  const save = (updated: Scenario[]) => {
    setScenarios(updated);
    localStorage.setItem('sitecompare_scenarios', JSON.stringify(updated));
  };

  const handleSave = () => {
    if (!form.name) return;
    if (editingId) {
      save(scenarios.map(s => s.id === editingId ? { ...form, id: editingId } : s));
    } else {
      save([...scenarios, { ...form, id: Date.now().toString() }]);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ name: '', url1: '', url2: '', actions: [] });
  };

  const handleEdit = (s: Scenario) => {
    setForm({ name: s.name, url1: s.url1, url2: s.url2, actions: s.actions });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    save(scenarios.filter(s => s.id !== id));
  };

  const handleRun = (s: Scenario) => {
    const params = new URLSearchParams({ url1: s.url1, url2: s.url2 });
    if (s.actions.length > 0) {
      params.set('actions', btoa(JSON.stringify(s.actions)));
    }
    router.push(`/compare?${params}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Scenarios</h1>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', url1: '', url2: '', actions: [] }); }}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          + New Scenario
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit' : 'New'} Scenario</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="My scenario"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site 1 URL</label>
                <input
                  type="url"
                  value={form.url1}
                  onChange={e => setForm({ ...form, url1: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site 2 URL</label>
                <input
                  type="url"
                  value={form.url2}
                  onChange={e => setForm({ ...form, url2: e.target.value })}
                  placeholder="https://example.org"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
              <ActionList actions={form.actions} onChange={a => setForm({ ...form, actions: a })} />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {scenarios.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-xl">No scenarios yet.</p>
          <p className="text-sm mt-2">Create one to save URL pairs and action sequences.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {scenarios.map(s => (
            <div key={s.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{s.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{s.url1}</p>
                  <p className="text-sm text-gray-500">{s.url2}</p>
                  {s.actions.length > 0 && (
                    <p className="text-xs text-indigo-600 mt-1">{s.actions.length} action(s)</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRun(s)}
                    className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Run
                  </button>
                  <button
                    onClick={() => handleEdit(s)}
                    className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="bg-red-50 text-red-600 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
