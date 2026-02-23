import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UrlBulkImport from '@/components/UrlBulkImport';

describe('UrlBulkImport', () => {
  it('renders Import URLs button when closed', () => {
    const onImport = jest.fn();
    render(<UrlBulkImport onImport={onImport} />);
    expect(screen.getByText('Import URLs')).toBeInTheDocument();
  });

  it('opens the import panel when Import URLs is clicked', () => {
    const onImport = jest.fn();
    render(<UrlBulkImport onImport={onImport} />);
    fireEvent.click(screen.getByText('Import URLs'));
    expect(screen.getByText('Bulk Import URL Pairs')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /url pairs text area/i })).toBeInTheDocument();
  });

  it('closes the panel when Cancel is clicked', () => {
    const onImport = jest.fn();
    render(<UrlBulkImport onImport={onImport} />);
    fireEvent.click(screen.getByText('Import URLs'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.getByText('Import URLs')).toBeInTheDocument();
    expect(screen.queryByText('Bulk Import URL Pairs')).not.toBeInTheDocument();
  });

  it('detects the correct number of pairs from pasted text', () => {
    const onImport = jest.fn();
    render(<UrlBulkImport onImport={onImport} />);
    fireEvent.click(screen.getByText('Import URLs'));
    const textarea = screen.getByRole('textbox', { name: /url pairs text area/i });
    fireEvent.change(textarea, {
      target: {
        value:
          'https://example.com/a?flag=false\nhttps://example.com/a?flag=true\nhttps://example.com/b?flag=false\nhttps://example.com/b?flag=true',
      },
    });
    expect(screen.getByText('2 pairs detected')).toBeInTheDocument();
  });

  it('calls onImport with correctly parsed pairs', () => {
    const onImport = jest.fn();
    render(<UrlBulkImport onImport={onImport} />);
    fireEvent.click(screen.getByText('Import URLs'));
    const textarea = screen.getByRole('textbox', { name: /url pairs text area/i });
    fireEvent.change(textarea, {
      target: {
        value:
          'https://example.com/a?flag=false\nhttps://example.com/a?flag=true\nhttps://example.com/b?flag=false\nhttps://example.com/b?flag=true',
      },
    });
    fireEvent.click(screen.getByText('Import 2 pairs'));
    expect(onImport).toHaveBeenCalledWith([
      { label: '', url1: 'https://example.com/a?flag=false', url2: 'https://example.com/a?flag=true' },
      { label: '', url1: 'https://example.com/b?flag=false', url2: 'https://example.com/b?flag=true' },
    ]);
  });

  it('closes the panel after a successful import', () => {
    const onImport = jest.fn();
    render(<UrlBulkImport onImport={onImport} />);
    fireEvent.click(screen.getByText('Import URLs'));
    const textarea = screen.getByRole('textbox', { name: /url pairs text area/i });
    fireEvent.change(textarea, {
      target: { value: 'https://a.com\nhttps://b.com' },
    });
    fireEvent.click(screen.getByText('Import 1 pair'));
    expect(screen.getByText('Import URLs')).toBeInTheDocument();
    expect(screen.queryByText('Bulk Import URL Pairs')).not.toBeInTheDocument();
  });

  it('ignores blank lines when parsing', () => {
    const onImport = jest.fn();
    render(<UrlBulkImport onImport={onImport} />);
    fireEvent.click(screen.getByText('Import URLs'));
    const textarea = screen.getByRole('textbox', { name: /url pairs text area/i });
    fireEvent.change(textarea, {
      target: { value: '\nhttps://a.com\n\nhttps://b.com\n' },
    });
    expect(screen.getByText('1 pair detected')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Import 1 pair'));
    expect(onImport).toHaveBeenCalledWith([
      { label: '', url1: 'https://a.com', url2: 'https://b.com' },
    ]);
  });

  it('shows unpaired URL notice when odd number of URLs provided', () => {
    const onImport = jest.fn();
    render(<UrlBulkImport onImport={onImport} />);
    fireEvent.click(screen.getByText('Import URLs'));
    const textarea = screen.getByRole('textbox', { name: /url pairs text area/i });
    fireEvent.change(textarea, {
      target: { value: 'https://a.com\nhttps://b.com\nhttps://c.com' },
    });
    expect(screen.getByText('1 pair detected (1 unpaired URL ignored)')).toBeInTheDocument();
  });

  it('disables Import URLs button when disabled prop is true', () => {
    const onImport = jest.fn();
    render(<UrlBulkImport onImport={onImport} disabled />);
    expect(screen.getByText('Import URLs')).toBeDisabled();
  });

  it('import button is disabled when textarea is empty', () => {
    const onImport = jest.fn();
    render(<UrlBulkImport onImport={onImport} />);
    fireEvent.click(screen.getByText('Import URLs'));
    // Import button should be disabled - text shows no pairs
    const importBtn = screen.getByRole('button', { name: /^Import$/ });
    expect(importBtn).toBeDisabled();
  });
});
