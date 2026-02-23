'use client';

import { useState, useRef } from 'react';

interface UrlPairInput {
  label: string;
  url1: string;
  url2: string;
}

interface UrlBulkImportProps {
  onImport: (pairs: UrlPairInput[]) => void;
  disabled?: boolean;
}

function parseUrlPairs(text: string): { pairs: UrlPairInput[]; unpaired: number } {
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const pairs: UrlPairInput[] = [];
  for (let i = 0; i + 1 < lines.length; i += 2) {
    pairs.push({ label: '', url1: lines[i], url2: lines[i + 1] });
  }
  return { pairs, unpaired: lines.length % 2 };
}

export default function UrlBulkImport({ onImport, disabled }: UrlBulkImportProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { pairs: parsedPairs, unpaired } = parseUrlPairs(text);
  const parsedCount = parsedPairs.length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError('');
    const reader = new FileReader();
    reader.onload = evt => {
      setText((evt.target?.result as string) ?? '');
    };
    reader.onerror = () => {
      setFileError('Failed to read file. Please try again.');
    };
    reader.readAsText(file);
    // Reset file input so the same file can be re-selected
    e.target.value = '';
  };

  const handleImport = () => {
    if (parsedCount === 0) return;
    onImport(parsedPairs);
    setText('');
    setOpen(false);
  };

  const handleCancel = () => {
    setText('');
    setFileError('');
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 px-5 py-2 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Import URLs
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          role="dialog"
          aria-modal="true"
          aria-label="Bulk Import URL Pairs"
          onClick={e => { if (e.target === e.currentTarget) handleCancel(); }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl mx-4 p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Bulk Import URL Pairs
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Paste or upload a plain-text file with one URL per line. Consecutive lines are paired
              together: odd lines become{' '}
              <strong className="text-gray-700 dark:text-gray-300">Site 1</strong> and even lines become{' '}
              <strong className="text-gray-700 dark:text-gray-300">Site 2</strong>.
            </p>

            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={`https://example.com/page?flag=false\nhttps://example.com/page?flag=true\nhttps://example.com/other?flag=false\nhttps://example.com/other?flag=true`}
              rows={8}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
              aria-label="URL pairs text area"
            />

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,text/plain"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Upload URL pairs file"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium border border-indigo-300 dark:border-indigo-600 rounded-lg px-3 py-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                >
                  Upload file…
                </button>
                {parsedCount > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {parsedCount} pair{parsedCount !== 1 ? 's' : ''} detected
                    {unpaired === 1 && ' (1 unpaired URL ignored)'}
                  </span>
                )}
                {fileError && (
                  <span className="text-sm text-red-600 dark:text-red-400">{fileError}</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium px-4 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={parsedCount === 0}
                  className="text-sm bg-indigo-600 text-white font-medium px-4 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Import {parsedCount > 0 ? `${parsedCount} pair${parsedCount !== 1 ? 's' : ''}` : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
