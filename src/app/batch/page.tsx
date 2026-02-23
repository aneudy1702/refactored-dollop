'use client';

import { useState, useCallback } from 'react';
import ComparisonResult from '@/components/ComparisonResult';
import UrlBulkImport from '@/components/UrlBulkImport';

interface UrlPair {
  id: string;
  label: string;
  url1: string;
  url2: string;
}

interface PairResult {
  screenshot1: string;
  screenshot2: string;
  diff: string;
  pixelCount: number;
  totalPixels: number;
  diffPercent: number;
}

type PairStatus = 'idle' | 'loading' | 'done' | 'error';

interface PairState {
  status: PairStatus;
  result: PairResult | null;
  error: string | null;
  expanded: boolean;
}

const DEFAULT_VIEWPORT_WIDTH = 1280;
const DIFF_THRESHOLD_PERCENT = 5;
const MAX_PAIRS = 20;

const emptyPair = (): UrlPair => ({
  id: crypto.randomUUID(),
  label: '',
  url1: '',
  url2: '',
});

export default function BatchComparePage() {
  const [pairs, setPairs] = useState<UrlPair[]>([emptyPair()]);
  const [states, setStates] = useState<Record<string, PairState>>({});
  const [running, setRunning] = useState(false);

  const addPair = () => setPairs(prev => [...prev, emptyPair()]);

  const removePair = (id: string) => {
    setPairs(prev => prev.filter(p => p.id !== id));
    setStates(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updatePair = (id: string, field: keyof Omit<UrlPair, 'id'>, value: string) => {
    setPairs(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const toggleExpanded = (id: string) => {
    setStates(prev => ({
      ...prev,
      [id]: { ...(prev[id] ?? { status: 'idle', result: null, error: null, expanded: false }), expanded: !prev[id]?.expanded },
    }));
  };

  const comparePair = useCallback(async (pair: UrlPair) => {
    setStates(prev => ({
      ...prev,
      [pair.id]: { status: 'loading', result: null, error: null, expanded: false },
    }));
    try {
      const [r1, r2] = await Promise.all([
        fetch('/api/screenshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: pair.url1, width: DEFAULT_VIEWPORT_WIDTH }),
        }).then(r => r.json()),
        fetch('/api/screenshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: pair.url2, width: DEFAULT_VIEWPORT_WIDTH }),
        }).then(r => r.json()),
      ]);

      if (r1.error) throw new Error(`Site 1: ${r1.error}`);
      if (r2.error) throw new Error(`Site 2: ${r2.error}`);

      const compareRes = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenshot1: r1.screenshot, screenshot2: r2.screenshot }),
      }).then(r => r.json());

      if (compareRes.error) throw new Error(compareRes.error);

      setStates(prev => ({
        ...prev,
        [pair.id]: {
          status: 'done',
          result: { screenshot1: r1.screenshot, screenshot2: r2.screenshot, ...compareRes },
          error: null,
          expanded: false,
        },
      }));
    } catch (e: unknown) {
      setStates(prev => ({
        ...prev,
        [pair.id]: {
          status: 'error',
          result: null,
          error: e instanceof Error ? e.message : 'Comparison failed',
          expanded: false,
        },
      }));
    }
  }, []);

  const handleRunAll = async () => {
    const validPairs = pairs.filter(p => p.url1 && p.url2);
    if (validPairs.length === 0) return;
    setRunning(true);
    await Promise.all(validPairs.map(p => comparePair(p)));
    setRunning(false);
  };

  const handleBulkImport = (imported: { label: string; url1: string; url2: string }[]) => {
    const newPairs = imported.map(p => ({ ...emptyPair(), ...p }));
    setPairs(prev => {
      // Replace the single empty default pair if it's the only one and still empty
      const isDefaultEmpty =
        prev.length === 1 && !prev[0].label && !prev[0].url1 && !prev[0].url2;
      return isDefaultEmpty ? newPairs : [...prev, ...newPairs];
    });
  };

  const validCount = pairs.filter(p => p.url1 && p.url2).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Batch Compare</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Add multiple URL pairs and compare them all at once.
          </p>
        </div>
        <div className="flex gap-3">
          <UrlBulkImport onImport={handleBulkImport} disabled={running} />
          <button
            onClick={addPair}
            disabled={running}
            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-5 py-2 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            + Add Pair
          </button>
          <button
            onClick={handleRunAll}
            disabled={running || validCount === 0}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {running ? 'Running…' : `Run All (${validCount})`}
          </button>
        </div>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 rounded-xl px-5 py-4 mb-6 text-sm text-indigo-800 dark:text-indigo-200">
        <p className="font-semibold mb-1">How to add URL pairs</p>
        <ul className="list-disc list-inside space-y-1 text-indigo-700 dark:text-indigo-300">
          <li>
            <strong>Manually:</strong> click <strong>+ Add Pair</strong> to enter one pair at a time.
          </li>
          <li>
            <strong>Bulk import:</strong> click <strong>Import URLs</strong> to paste a list or upload a{' '}
            <code className="bg-indigo-100 dark:bg-indigo-900 px-1 rounded">.txt</code> file. Put one URL per line —
            consecutive lines form a pair (line 1 → Site 1, line 2 → Site 2, and so on).
          </li>
        </ul>
      </div>

      <div className="space-y-4">
        {pairs.map((pair, idx) => {
          const state = states[pair.id];
          const status = state?.status ?? 'idle';
          const expanded = state?.expanded ?? false;

          return (
            <div key={pair.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              {/* Pair header / inputs */}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 w-6">{idx + 1}.</span>
                  <input
                    value={pair.label}
                    onChange={e => updatePair(pair.id, 'label', e.target.value)}
                    placeholder="Label (optional)"
                    disabled={running}
                    className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
                  />
                  {pairs.length > 1 && (
                    <button
                      onClick={() => removePair(pair.id)}
                      disabled={running}
                      className="text-red-400 hover:text-red-600 disabled:opacity-40 text-lg leading-none"
                      title="Remove pair"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Site 1 URL</label>
                    <input
                      type="url"
                      value={pair.url1}
                      onChange={e => updatePair(pair.id, 'url1', e.target.value)}
                      placeholder="https://example.com"
                      disabled={running}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Site 2 URL</label>
                    <input
                      type="url"
                      value={pair.url2}
                      onChange={e => updatePair(pair.id, 'url2', e.target.value)}
                      placeholder="https://example.org"
                      disabled={running}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Status bar */}
              {status !== 'idle' && (
                <div
                  className={`px-5 py-3 flex items-center justify-between border-t ${
                    status === 'loading'
                      ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900'
                      : status === 'error'
                      ? 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900'
                      : 'bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    {status === 'loading' && (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-indigo-700 dark:text-indigo-300">Comparing…</span>
                      </>
                    )}
                    {status === 'error' && (
                      <span className="text-red-700 dark:text-red-400">{state.error}</span>
                    )}
                    {status === 'done' && state.result && (
                      <>
                        <span className="text-green-700 dark:text-green-400 font-medium">
                          Diff:{' '}
                          <span className={state.result.diffPercent > DIFF_THRESHOLD_PERCENT ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'}>
                            {state.result.diffPercent}%
                          </span>
                        </span>
                        <span className="text-gray-400 dark:text-gray-500 text-xs">
                          ({state.result.pixelCount.toLocaleString()} / {state.result.totalPixels.toLocaleString()} px)
                        </span>
                      </>
                    )}
                  </div>
                  {status === 'done' && (
                    <button
                      onClick={() => toggleExpanded(pair.id)}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
                    >
                      {expanded ? 'Hide ▲' : 'View ▼'}
                    </button>
                  )}
                </div>
              )}

              {/* Expanded comparison result */}
              {status === 'done' && expanded && state.result && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <ComparisonResult
                    screenshot1={state.result.screenshot1}
                    screenshot2={state.result.screenshot2}
                    diff={state.result.diff}
                    pixelCount={state.result.pixelCount}
                    totalPixels={state.result.totalPixels}
                    diffPercent={state.result.diffPercent}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {pairs.length < MAX_PAIRS && (
        <button
          onClick={addPair}
          disabled={running}
          className="mt-4 w-full border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400 rounded-xl py-3 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Add another URL pair
        </button>
      )}
    </div>
  );
}
