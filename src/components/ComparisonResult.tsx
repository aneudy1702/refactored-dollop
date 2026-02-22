'use client';

import { useState } from 'react';

interface ComparisonResultProps {
  screenshot1: string;
  screenshot2: string;
  diff: string;
  pixelCount: number;
  totalPixels: number;
  diffPercent: number;
}

type Tab = 'site1' | 'site2' | 'diff';

const DIFF_THRESHOLD_PERCENT = 5;

export default function ComparisonResult({
  screenshot1,
  screenshot2,
  diff,
  pixelCount,
  totalPixels,
  diffPercent,
}: ComparisonResultProps) {
  const [activeTab, setActiveTab] = useState<Tab>('site1');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'site1', label: 'Site 1' },
    { id: 'site2', label: 'Site 2' },
    { id: 'diff', label: 'Diff' },
  ];

  const imgSrc =
    activeTab === 'site1'
      ? `data:image/png;base64,${screenshot1}`
      : activeTab === 'site2'
      ? `data:image/png;base64,${screenshot2}`
      : `data:image/png;base64,${diff}`;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex gap-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-600 space-x-4">
          <span>
            Diff:{' '}
            <span className={diffPercent > DIFF_THRESHOLD_PERCENT ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
              {diffPercent}%
            </span>
          </span>
          <span className="text-gray-400">
            {pixelCount.toLocaleString()} / {totalPixels.toLocaleString()} pixels
          </span>
        </div>
      </div>
      <div className="overflow-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgSrc} alt={activeTab} className="w-full" />
      </div>
    </div>
  );
}
