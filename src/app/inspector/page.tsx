'use client';

import { useState, useRef } from 'react';

interface InspectorResult {
  selector: string;
  tagName: string;
  innerText: string;
}

export default function InspectorPage() {
  const [url, setUrl] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [loading, setLoading] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [result, setResult] = useState<InspectorResult | null>(null);
  const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    setScreenshot('');
    setResult(null);
    setCrosshair(null);
    try {
      const res = await fetch('/api/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, width: 1280, height: 800 }),
      }).then(r => r.json());
      if (res.error) throw new Error(res.error);
      setScreenshot(res.screenshot);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = async (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current || !screenshot) return;
    const rect = imgRef.current.getBoundingClientRect();
    const scaleX = 1280 / rect.width;
    const scaleY = 800 / rect.height;
    const relX = (e.clientX - rect.left) * scaleX;
    const relY = (e.clientY - rect.top) * scaleY;

    const displayX = e.clientX - rect.left;
    const displayY = e.clientY - rect.top;
    setCrosshair({ x: displayX, y: displayY });

    setInspecting(true);
    setResult(null);
    setError('');
    try {
      const res = await fetch('/api/inspector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, x: Math.round(relX), y: Math.round(relY), width: 1280, height: 800 }),
      }).then(r => r.json());
      if (res.error) throw new Error(res.error);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Inspection failed');
    } finally {
      setInspecting(false);
    }
  };

  const handleCopy = () => {
    if (result?.selector) {
      navigator.clipboard.writeText(result.selector);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Element Inspector</h1>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyDown={e => e.key === 'Enter' && handleLoad()}
          />
          <button
            onClick={handleLoad}
            disabled={!url || loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            {loading ? 'Loading...' : 'Load'}
          </button>
        </div>
        {screenshot && (
          <p className="text-sm text-gray-500 mt-2">Click anywhere on the screenshot to inspect that element.</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading screenshot...</p>
        </div>
      )}

      {screenshot && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden relative">
              <div className="relative" style={{ cursor: inspecting ? 'wait' : 'crosshair' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={`data:image/png;base64,${screenshot}`}
                  alt="Screenshot"
                  className="w-full"
                  onClick={handleImageClick}
                  draggable={false}
                />
                {crosshair && (
                  <div
                    className="pointer-events-none absolute"
                    style={{ left: crosshair.x - 12, top: crosshair.y - 12 }}
                  >
                    <div className="w-6 h-6 border-2 border-red-500 rounded-full bg-red-500 bg-opacity-20" />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Inspector</h2>
              {inspecting && (
                <div className="flex items-center gap-2 text-indigo-600">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Inspecting...</span>
                </div>
              )}
              {result && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tag</label>
                    <p className="text-gray-800 font-mono text-sm mt-1">{result.tagName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">CSS Selector</label>
                    <div className="flex items-start gap-2 mt-1">
                      <code className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1.5 break-all font-mono text-indigo-700">
                        {result.selector}
                      </code>
                      <button
                        onClick={handleCopy}
                        className="shrink-0 text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded hover:bg-indigo-200 transition-colors"
                      >
                        {copied ? '✓' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  {result.innerText && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Text</label>
                      <p className="text-gray-700 text-sm mt-1 line-clamp-3">{result.innerText}</p>
                    </div>
                  )}
                </div>
              )}
              {!result && !inspecting && (
                <p className="text-gray-400 text-sm">Click on the screenshot to inspect an element.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
