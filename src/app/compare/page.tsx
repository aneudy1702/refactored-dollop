'use client';

import { Suspense, useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ActionList from '@/components/ActionList';
import ComparisonResult from '@/components/ComparisonResult';

type Action = {
  type: 'click' | 'type' | 'wait';
  selector?: string;
  value?: string;
  delay?: number;
};

interface CompareResult {
  screenshot1: string;
  screenshot2: string;
  diff: string;
  pixelCount: number;
  totalPixels: number;
  diffPercent: number;
}

const BREAKPOINTS = [
  { id: 'mobile' as const, label: 'Mobile', width: 375, icon: '📱' },
  { id: 'tablet' as const, label: 'Tablet', width: 768, icon: '📋' },
  { id: 'desktop' as const, label: 'Desktop', width: 1280, icon: '🖥️' },
];

type BreakpointId = typeof BREAKPOINTS[number]['id'];

interface BreakpointState {
  loading: boolean;
  result: CompareResult | null;
  error: string | null;
}

const initialBreakpointStates = (): Record<BreakpointId, BreakpointState> => ({
  mobile: { loading: false, result: null, error: null },
  tablet: { loading: false, result: null, error: null },
  desktop: { loading: false, result: null, error: null },
});

function CompareContent() {
  const params = useSearchParams();
  const [url1, setUrl1] = useState(params.get('url1') || '');
  const [url2, setUrl2] = useState(params.get('url2') || '');
  const [actions, setActions] = useState<Action[]>(() => {
    const encoded = params.get('actions');
    if (!encoded) return [];
    try { return JSON.parse(atob(encoded)); } catch { return []; }
  });
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [activeBreakpoint, setActiveBreakpoint] = useState<BreakpointId>('desktop');
  const [bpStates, setBpStates] = useState<Record<BreakpointId, BreakpointState>>(initialBreakpointStates);

  const loadBreakpoint = useCallback(async (
    bpId: BreakpointId,
    width: number,
    currentUrl1: string,
    currentUrl2: string,
    currentActions: Action[],
  ) => {
    setBpStates(prev => ({ ...prev, [bpId]: { loading: true, result: null, error: null } }));
    try {
      const [r1, r2] = await Promise.all([
        fetch('/api/screenshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: currentUrl1, actions: currentActions, width }),
        }).then(r => r.json()),
        fetch('/api/screenshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: currentUrl2, actions: currentActions, width }),
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

      setBpStates(prev => ({
        ...prev,
        [bpId]: {
          loading: false,
          result: { screenshot1: r1.screenshot, screenshot2: r2.screenshot, ...compareRes },
          error: null,
        },
      }));
    } catch (e: unknown) {
      setBpStates(prev => ({
        ...prev,
        [bpId]: { loading: false, result: null, error: e instanceof Error ? e.message : 'Comparison failed' },
      }));
    }
  }, []);

  const handleCompare = () => {
    if (!url1 || !url2) return;
    setHasStarted(true);
    setBpStates(initialBreakpointStates());
    for (const bp of BREAKPOINTS) {
      loadBreakpoint(bp.id, bp.width, url1, url2, actions);
    }
  };

  // Auto-run comparison when navigated from a scenario with URL params
  useEffect(() => {
    const p1 = params.get('url1');
    const p2 = params.get('url2');
    if (!p1 || !p2) return;
    const encoded = params.get('actions');
    const initialActions: Action[] = (() => {
      if (!encoded) return [];
      try { return JSON.parse(atob(encoded)); } catch { return []; }
    })();
    setHasStarted(true);
    for (const bp of BREAKPOINTS) {
      loadBreakpoint(bp.id, bp.width, p1, p2, initialActions);
    }
  // loadBreakpoint and params are stable on mount; run once to auto-start scenario
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadBreakpoint, params]);

  const anyLoading = BREAKPOINTS.some(bp => bpStates[bp.id].loading);
  const activeBp = bpStates[activeBreakpoint];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">Compare Sites</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site 1 URL</label>
            <input
              type="url"
              value={url1}
              onChange={e => setUrl1(e.target.value)}
              placeholder="https://example.com"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site 2 URL</label>
            <input
              type="url"
              value={url2}
              onChange={e => setUrl2(e.target.value)}
              placeholder="https://example.org"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <button
          onClick={handleCompare}
          disabled={!url1 || !url2 || anyLoading}
          className="bg-indigo-600 text-white px-8 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {anyLoading ? 'Comparing…' : 'Compare'}
        </button>
      </div>

      {/* Scenario section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <button
          onClick={() => setScenarioOpen(!scenarioOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Scenario Actions {actions.length > 0 ? `(${actions.length})` : ''}
          </h2>
          <span className="text-gray-400 dark:text-gray-500 text-xl">{scenarioOpen ? '▲' : '▼'}</span>
        </button>
        {scenarioOpen && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Actions are executed on both sites before taking screenshots.
            </p>
            <ActionList actions={actions} onChange={setActions} />
          </div>
        )}
      </div>

      {hasStarted && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          {/* Breakpoint selector */}
          <div className="flex gap-2 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            {BREAKPOINTS.map(bp => {
              const state = bpStates[bp.id];
              const isActive = activeBreakpoint === bp.id;
              return (
                <button
                  key={bp.id}
                  onClick={() => setActiveBreakpoint(bp.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <span>{bp.icon}</span>
                  <span>{bp.label}</span>
                  <span className="ml-1">
                    {state.loading ? (
                      <span className={`inline-block w-3 h-3 border-2 ${isActive ? 'border-white border-t-transparent' : 'border-indigo-500 border-t-transparent'} rounded-full animate-spin`} />
                    ) : state.error ? (
                      <span className="text-red-400">✕</span>
                    ) : state.result ? (
                      <span className={state.result.diffPercent > 5 ? 'text-red-400' : 'text-green-400'}>
                        {state.result.diffPercent > 5 ? '!' : '✓'}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active breakpoint content */}
          <div className="p-4">
            {activeBp.loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Taking screenshots at {BREAKPOINTS.find(b => b.id === activeBreakpoint)?.width}px width…</p>
              </div>
            )}
            {activeBp.error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-400">{activeBp.error}</p>
              </div>
            )}
            {activeBp.result && (
              <ComparisonResult
                screenshot1={activeBp.result.screenshot1}
                screenshot2={activeBp.result.screenshot2}
                diff={activeBp.result.diff}
                pixelCount={activeBp.result.pixelCount}
                totalPixels={activeBp.result.totalPixels}
                diffPercent={activeBp.result.diffPercent}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-500 dark:text-gray-400">Loading...</div>}>
      <CompareContent />
    </Suspense>
  );
}
