'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const [url1, setUrl1] = useState('');
  const [url2, setUrl2] = useState('');
  const router = useRouter();

  const handleCompare = () => {
    if (url1 && url2) {
      router.push(`/compare?url1=${encodeURIComponent(url1)}&url2=${encodeURIComponent(url2)}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-indigo-700 dark:text-indigo-400 mb-4">SiteCompare</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Visual side-by-side comparison tool for websites</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Quick Compare */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Quick Compare</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              Enter two URLs to take screenshots and compare them side-by-side with a pixel diff overlay.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site 1 URL</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={url1}
                  onChange={e => setUrl1(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site 2 URL</label>
                <input
                  type="url"
                  placeholder="https://example.org"
                  value={url2}
                  onChange={e => setUrl2(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={handleCompare}
                disabled={!url1 || !url2}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Compare Sites →
              </button>
            </div>
          </div>

          {/* Other tools */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Batch Compare</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                Compare many URL pairs at once and see a diff summary for each.
              </p>
              <Link
                href="/batch"
                className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Batch Compare →
              </Link>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Scenario Builder</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                Define sequences of click/type actions and run them on both sites before comparing.
              </p>
              <Link
                href="/scenarios"
                className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Manage Scenarios →
              </Link>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Element Inspector</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                Click on any element in a screenshot to get its CSS selector instantly.
              </p>
              <Link
                href="/inspector"
                className="inline-block bg-indigo-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-600 transition-colors"
              >
                Open Inspector →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
