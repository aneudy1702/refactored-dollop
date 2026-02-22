import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from '@/components/Navbar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

import { usePathname } from 'next/navigation';

describe('Navbar', () => {
  it('renders all navigation links', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    render(<Navbar />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Compare')).toBeInTheDocument();
    expect(screen.getByText('Batch')).toBeInTheDocument();
    expect(screen.getByText('Scenarios')).toBeInTheDocument();
    expect(screen.getByText('Inspector')).toBeInTheDocument();
  });

  it('renders the brand name', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    render(<Navbar />);
    expect(screen.getByText('SiteCompare')).toBeInTheDocument();
  });

  it('applies active style to the current path link', () => {
    (usePathname as jest.Mock).mockReturnValue('/compare');
    render(<Navbar />);
    const compareLink = screen.getByText('Compare');
    expect(compareLink).toHaveClass('text-white');
    expect(compareLink).toHaveClass('border-b-2');
  });

  it('applies inactive style to non-current path links', () => {
    (usePathname as jest.Mock).mockReturnValue('/compare');
    render(<Navbar />);
    const homeLink = screen.getByText('Home');
    expect(homeLink).toHaveClass('text-indigo-200');
  });
});
