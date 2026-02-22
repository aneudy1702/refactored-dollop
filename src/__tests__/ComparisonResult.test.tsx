import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ComparisonResult from '@/components/ComparisonResult';

const props = {
  screenshot1: 'abc123',
  screenshot2: 'def456',
  diff: 'ghi789',
  pixelCount: 500,
  totalPixels: 10000,
  diffPercent: 5.0,
};

describe('ComparisonResult', () => {
  it('renders Site 1, Site 2, and Diff tabs', () => {
    render(<ComparisonResult {...props} />);
    expect(screen.getByText('Site 1')).toBeInTheDocument();
    expect(screen.getByText('Site 2')).toBeInTheDocument();
    expect(screen.getByText('Diff')).toBeInTheDocument();
  });

  it('shows Site 1 screenshot by default', () => {
    render(<ComparisonResult {...props} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'data:image/png;base64,abc123');
  });

  it('switches to Site 2 screenshot when Site 2 tab is clicked', () => {
    render(<ComparisonResult {...props} />);
    fireEvent.click(screen.getByText('Site 2'));
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'data:image/png;base64,def456');
  });

  it('switches to diff image when Diff tab is clicked', () => {
    render(<ComparisonResult {...props} />);
    fireEvent.click(screen.getByText('Diff'));
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'data:image/png;base64,ghi789');
  });

  it('displays the diff percentage', () => {
    render(<ComparisonResult {...props} />);
    expect(screen.getByText('5%')).toBeInTheDocument();
  });

  it('displays pixel counts', () => {
    render(<ComparisonResult {...props} />);
    expect(screen.getByText(/500/)).toBeInTheDocument();
    expect(screen.getByText(/10,000/)).toBeInTheDocument();
  });

  it('highlights diff in green when diffPercent is at threshold', () => {
    render(<ComparisonResult {...props} diffPercent={5.0} />);
    const diffSpan = screen.getByText('5%');
    expect(diffSpan).toHaveClass('text-green-600');
  });

  it('highlights diff in red when diffPercent exceeds threshold', () => {
    render(<ComparisonResult {...props} diffPercent={6.0} />);
    const diffSpan = screen.getByText('6%');
    expect(diffSpan).toHaveClass('text-red-600');
  });
});
