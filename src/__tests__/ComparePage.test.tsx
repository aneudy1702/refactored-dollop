import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

import { useSearchParams } from 'next/navigation';

// Mock fetch
const fetchMock = jest.fn();
global.fetch = fetchMock;

beforeEach(() => {
  fetchMock.mockReset();
});

import ComparePage from '@/app/compare/page';

describe('ComparePage auto-run', () => {
  it('renders the Compare Sites heading without URL params', () => {
    (useSearchParams as jest.Mock).mockReturnValue({ get: () => null });
    render(<ComparePage />);
    expect(screen.getByText('Compare Sites')).toBeInTheDocument();
  });

  it('does not auto-start comparison when no URL params are present', () => {
    (useSearchParams as jest.Mock).mockReturnValue({ get: () => null });
    render(<ComparePage />);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('auto-starts comparison when url1 and url2 params are present', async () => {
    fetchMock.mockResolvedValue({
      json: async () => ({ screenshot: 'data:image/png;base64,abc' }),
      ok: true,
    });

    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => {
        if (key === 'url1') return 'https://a.com';
        if (key === 'url2') return 'https://b.com';
        return null;
      },
    });

    render(<ComparePage />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/screenshot', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('https://a.com'),
      }));
    });
  });

  it('pre-fills URL inputs from query params', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => {
        if (key === 'url1') return 'https://a.com';
        if (key === 'url2') return 'https://b.com';
        return null;
      },
    });

    render(<ComparePage />);

    expect(screen.getByDisplayValue('https://a.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://b.com')).toBeInTheDocument();
  });
});
