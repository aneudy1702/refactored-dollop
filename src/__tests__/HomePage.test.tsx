import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

import { useRouter } from 'next/navigation';

import HomePage from '@/app/page';

describe('HomePage', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    pushMock.mockClear();
  });

  it('renders the SiteCompare heading', () => {
    render(<HomePage />);
    expect(screen.getByText('SiteCompare')).toBeInTheDocument();
  });

  it('renders the Quick Compare section', () => {
    render(<HomePage />);
    expect(screen.getByText('Quick Compare')).toBeInTheDocument();
  });

  it('renders Site 1 and Site 2 URL inputs', () => {
    render(<HomePage />);
    expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://example.org')).toBeInTheDocument();
  });

  it('disables Compare button when inputs are empty', () => {
    render(<HomePage />);
    const button = screen.getByText('Compare Sites →');
    expect(button).toBeDisabled();
  });

  it('enables Compare button when both URLs are filled', () => {
    render(<HomePage />);
    fireEvent.change(screen.getByPlaceholderText('https://example.com'), { target: { value: 'https://example.com' } });
    fireEvent.change(screen.getByPlaceholderText('https://example.org'), { target: { value: 'https://example.org' } });
    expect(screen.getByText('Compare Sites →')).not.toBeDisabled();
  });

  it('navigates to compare page with encoded URLs on button click', () => {
    render(<HomePage />);
    fireEvent.change(screen.getByPlaceholderText('https://example.com'), { target: { value: 'https://example.com' } });
    fireEvent.change(screen.getByPlaceholderText('https://example.org'), { target: { value: 'https://example.org' } });
    fireEvent.click(screen.getByText('Compare Sites →'));
    expect(pushMock).toHaveBeenCalledWith(
      '/compare?url1=https%3A%2F%2Fexample.com&url2=https%3A%2F%2Fexample.org'
    );
  });

  it('does not navigate when only one URL is provided', () => {
    render(<HomePage />);
    fireEvent.change(screen.getByPlaceholderText('https://example.com'), { target: { value: 'https://example.com' } });
    fireEvent.click(screen.getByText('Compare Sites →'));
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('renders links to Batch Compare, Scenario Builder, and Element Inspector', () => {
    render(<HomePage />);
    expect(screen.getByText('Batch Compare →')).toBeInTheDocument();
    expect(screen.getByText('Manage Scenarios →')).toBeInTheDocument();
    expect(screen.getByText('Open Inspector →')).toBeInTheDocument();
  });
});
