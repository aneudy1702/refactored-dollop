'use client';

import { Suspense, useState } from 'react';
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

function CompareContent() {
  const params = useSearchParams();
  const [url1, setUrl1] = useState(params.get('url1') || '');
  const [url2, setUrl2] = useState(params.get('url2') || '');
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CompareResult | null>(null);
  const [scenarioOpen, setScenarioOpen] = useState(false);

  const handleCompare = async () => {
    if (!url1 || !url2) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const [r1, r2] = await Promise.all([
        fetch('/api/screenshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url1, actions }),
        }).then(r => r.json()),
        fetch('/api/screenshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url2, actions }),
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

      setResult({
        screenshot1: r1.screenshot,
        screenshot2: r2.screenshot,
        ...compareRes,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Compare Sites</h1>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site 1 URL</label>
            <input
              type="url"
              value={url1}
              onChange={e => setUrl1(e.target.value)}
              placeholder="https://example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site 2 URL</label>
            <input
              type="url"
              value={url2}
              onChange={e => setUrl2(e.target.value)}
              placeholder="https://example.org"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <button
          onClick={handleCompare}
          disabled={!url1 || !url2 || loading}
          className="bg-indigo-600 text-white px-8 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </div>

      {/* Scenario section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <button
          onClick={() => setScenarioOpen(!scenarioOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-800">
            Scenario Actions {actions.length > 0 ? `(${actions.length})` : ''}
          </h2>
          <span className="text-gray-400 text-xl">{scenarioOpen ? '▲' : '▼'}</span>
        </button>
        {scenarioOpen && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-4">
              Actions are executed on both sites before taking screenshots.
            </p>
            <ActionList actions={actions} onChange={setActions} />
          </div>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Taking screenshots and comparing...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <ComparisonResult
          screenshot1={result.screenshot1}
          screenshot2={result.screenshot2}
          diff={result.diff}
          pixelCount={result.pixelCount}
          totalPixels={result.totalPixels}
          diffPercent={result.diffPercent}
        />
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-500">Loading...</div>}>
      <CompareContent />
    </Suspense>
  );
}
