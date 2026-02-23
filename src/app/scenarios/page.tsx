'use client';

import { useState, useEffect, useCallback } from 'react';
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
  collectionId: string;
  createdAt: string;
}

interface ScenarioCollection {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

type ScenarioForm = { name: string; url1: string; url2: string; actions: Action[]; collectionId: string };
type CollectionForm = { name: string; description: string };

const EMPTY_SCENARIO_FORM: ScenarioForm = { name: '', url1: '', url2: '', actions: [], collectionId: '' };
const EMPTY_COLLECTION_FORM: CollectionForm = { name: '', description: '' };

export default function ScenariosPage() {
  const [collections, setCollections] = useState<ScenarioCollection[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const [editingScenarioId, setEditingScenarioId] = useState<string | null>(null);
  const [scenarioForm, setScenarioForm] = useState<ScenarioForm>(EMPTY_SCENARIO_FORM);
  const [showScenarioForm, setShowScenarioForm] = useState(false);

  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [collectionForm, setCollectionForm] = useState<CollectionForm>(EMPTY_COLLECTION_FORM);
  const [showCollectionForm, setShowCollectionForm] = useState(false);

  const router = useRouter();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [colRes, scRes] = await Promise.all([
        fetch('/api/scenarios/collections'),
        fetch('/api/scenarios'),
      ]);
      const cols: ScenarioCollection[] = colRes.ok ? await colRes.json() : [];
      const scs: Scenario[] = scRes.ok ? await scRes.json() : [];
      setCollections(Array.isArray(cols) ? cols : []);
      setScenarios(Array.isArray(scs) ? scs : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // --- Collections ---
  const handleSaveCollection = async () => {
    if (!collectionForm.name) return;
    const res = editingCollectionId
      ? await fetch(`/api/scenarios/collections/${editingCollectionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(collectionForm),
        })
      : await fetch('/api/scenarios/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(collectionForm),
        });
    if (!res.ok) return;
    setShowCollectionForm(false);
    setEditingCollectionId(null);
    setCollectionForm(EMPTY_COLLECTION_FORM);
    await loadData();
  };

  const handleEditCollection = (c: ScenarioCollection) => {
    setCollectionForm({ name: c.name, description: c.description || '' });
    setEditingCollectionId(c.id);
    setShowCollectionForm(true);
  };

  const handleDeleteCollection = async (id: string) => {
    const res = await fetch(`/api/scenarios/collections/${id}`, { method: 'DELETE' });
    if (!res.ok) return;
    if (activeCollectionId === id) setActiveCollectionId('');
    await loadData();
  };

  // --- Scenarios ---
  const handleSaveScenario = async () => {
    if (!scenarioForm.name) return;
    const res = editingScenarioId
      ? await fetch(`/api/scenarios/${editingScenarioId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scenarioForm),
        })
      : await fetch('/api/scenarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scenarioForm),
        });
    if (!res.ok) return;
    setShowScenarioForm(false);
    setEditingScenarioId(null);
    setScenarioForm(EMPTY_SCENARIO_FORM);
    await loadData();
  };

  const handleEditScenario = (s: Scenario) => {
    setScenarioForm({ name: s.name, url1: s.url1, url2: s.url2, actions: s.actions, collectionId: s.collectionId });
    setEditingScenarioId(s.id);
    setShowScenarioForm(true);
  };

  const handleDeleteScenario = async (id: string) => {
    const res = await fetch(`/api/scenarios/${id}`, { method: 'DELETE' });
    if (!res.ok) return;
    await loadData();
  };

  const handleRunScenario = (s: Scenario) => {
    const params = new URLSearchParams({ url1: s.url1, url2: s.url2 });
    if (s.actions.length > 0) {
      params.set('actions', btoa(JSON.stringify(s.actions)));
    }
    router.push(`/compare?${params}`);
  };

  const openNewScenario = () => {
    setScenarioForm({ ...EMPTY_SCENARIO_FORM, collectionId: activeCollectionId });
    setEditingScenarioId(null);
    setShowScenarioForm(true);
  };

  const visibleScenarios = activeCollectionId
    ? scenarios.filter(s => s.collectionId === activeCollectionId)
    : scenarios;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Scenarios</h1>
        <div className="flex gap-3">
          <button
            onClick={() => { setShowCollectionForm(true); setEditingCollectionId(null); setCollectionForm(EMPTY_COLLECTION_FORM); }}
            className="bg-purple-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            + New Collection
          </button>
          <button
            onClick={openNewScenario}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            + New Scenario
          </button>
        </div>
      </div>

      {/* Collection form */}
      {showCollectionForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border-l-4 border-purple-500">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">{editingCollectionId ? 'Edit' : 'New'} Collection</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                value={collectionForm.name}
                onChange={e => setCollectionForm({ ...collectionForm, name: e.target.value })}
                placeholder="Regression Suite"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <input
                value={collectionForm.description}
                onChange={e => setCollectionForm({ ...collectionForm, description: e.target.value })}
                placeholder="Optional description"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSaveCollection} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors">Save</button>
              <button onClick={() => { setShowCollectionForm(false); setEditingCollectionId(null); }} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Scenario form */}
      {showScenarioForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border-l-4 border-indigo-500">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">{editingScenarioId ? 'Edit' : 'New'} Scenario</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                value={scenarioForm.name}
                onChange={e => setScenarioForm({ ...scenarioForm, name: e.target.value })}
                placeholder="My scenario"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Collection</label>
              <select
                value={scenarioForm.collectionId}
                onChange={e => setScenarioForm({ ...scenarioForm, collectionId: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">— No collection —</option>
                {collections.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site 1 URL</label>
                <input
                  type="url"
                  value={scenarioForm.url1}
                  onChange={e => setScenarioForm({ ...scenarioForm, url1: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site 2 URL</label>
                <input
                  type="url"
                  value={scenarioForm.url2}
                  onChange={e => setScenarioForm({ ...scenarioForm, url2: e.target.value })}
                  placeholder="https://example.org"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Actions</label>
              <ActionList actions={scenarioForm.actions} onChange={a => setScenarioForm({ ...scenarioForm, actions: a })} />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSaveScenario} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">Save</button>
              <button onClick={() => { setShowScenarioForm(false); setEditingScenarioId(null); }} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">Loading…</div>
      ) : (
        <div className="flex gap-6">
          {/* Collections sidebar */}
          <div className="w-56 flex-shrink-0">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Collections</h2>
            <div className="space-y-1">
              <button
                onClick={() => setActiveCollectionId('')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeCollectionId === '' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
              >
                All Scenarios
                <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">({scenarios.length})</span>
              </button>
              {collections.map(c => (
                <div key={c.id} className="group relative">
                  <button
                    onClick={() => setActiveCollectionId(c.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors pr-16 ${activeCollectionId === c.id ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                  >
                    {c.name}
                    <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">({scenarios.filter(s => s.collectionId === c.id).length})</span>
                  </button>
                  <div className="absolute right-1 top-1.5 hidden group-hover:flex gap-1">
                    <button onClick={() => handleEditCollection(c)} className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5 text-xs" title="Edit">✏️</button>
                    <button onClick={() => handleDeleteCollection(c.id)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-0.5 text-xs" title="Delete">🗑️</button>
                  </div>
                </div>
              ))}
              {collections.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 px-3 py-2">No collections yet.</p>
              )}
            </div>
          </div>

          {/* Scenarios list */}
          <div className="flex-1">
            {visibleScenarios.length === 0 ? (
              <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                <p className="text-xl">No scenarios yet.</p>
                <p className="text-sm mt-2">Create one to save URL pairs and action sequences.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleScenarios.map(s => {
                  const col = collections.find(c => c.id === s.collectionId);
                  return (
                    <div key={s.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{s.name}</h3>
                          {col && (
                            <span className="inline-block text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium mt-1 mb-1">{col.name}</span>
                          )}
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.url1}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{s.url2}</p>
                          {s.actions.length > 0 && (
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">{s.actions.length} action(s)</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleRunScenario(s)} className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">Run</button>
                          <button onClick={() => handleEditScenario(s)} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Edit</button>
                          <button onClick={() => handleDeleteScenario(s.id)} className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors">Delete</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
