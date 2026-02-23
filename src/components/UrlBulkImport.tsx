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

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Import URLs
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-5 mb-4">
      <h2 className="text-base font-semibold text-gray-700 mb-3">Bulk Import URL Pairs</h2>
      <p className="text-sm text-gray-500 mb-3">
        Paste or upload a plain-text file with one URL per line. Consecutive lines are paired
        together: odd lines become <strong>Site 1</strong> and even lines become{' '}
        <strong>Site 2</strong>.
      </p>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={`https://example.com/page?flag=false\nhttps://example.com/page?flag=true\nhttps://example.com/other?flag=false\nhttps://example.com/other?flag=true`}
        rows={8}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
        aria-label="URL pairs text area"
      />

      <div className="flex items-center justify-between mt-3">
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
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-300 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition-colors"
          >
            Upload file…
          </button>
          {parsedCount > 0 && (
            <span className="text-sm text-gray-500">
              {parsedCount} pair{parsedCount !== 1 ? 's' : ''} detected
              {unpaired === 1 && ' (1 unpaired URL ignored)'}
            </span>
          )}
          {fileError && (
            <span className="text-sm text-red-600">{fileError}</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium px-4 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
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
  );
}
