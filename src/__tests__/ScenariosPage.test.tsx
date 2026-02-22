import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

import { useRouter } from 'next/navigation';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

import ScenariosPage from '@/app/scenarios/page';

describe('ScenariosPage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
  });

  it('renders the Scenarios heading', () => {
    render(<ScenariosPage />);
    expect(screen.getByText('Scenarios')).toBeInTheDocument();
  });

  it('renders New Scenario button', () => {
    render(<ScenariosPage />);
    expect(screen.getByText('+ New Scenario')).toBeInTheDocument();
  });

  it('shows empty state message when no scenarios exist', () => {
    render(<ScenariosPage />);
    expect(screen.getByText('No scenarios yet.')).toBeInTheDocument();
  });

  it('shows the form when New Scenario is clicked', () => {
    render(<ScenariosPage />);
    fireEvent.click(screen.getByText('+ New Scenario'));
    expect(screen.getByText('New Scenario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('My scenario')).toBeInTheDocument();
  });

  it('saves a new scenario on Save click', () => {
    render(<ScenariosPage />);
    fireEvent.click(screen.getByText('+ New Scenario'));
    fireEvent.change(screen.getByPlaceholderText('My scenario'), { target: { value: 'Test Scenario' } });
    fireEvent.click(screen.getByText('Save'));
    expect(screen.getByText('Test Scenario')).toBeInTheDocument();
  });

  it('does not save scenario when name is empty', () => {
    render(<ScenariosPage />);
    fireEvent.click(screen.getByText('+ New Scenario'));
    fireEvent.click(screen.getByText('Save'));
    expect(screen.getByText('No scenarios yet.')).toBeInTheDocument();
  });

  it('hides form when Cancel is clicked', () => {
    render(<ScenariosPage />);
    fireEvent.click(screen.getByText('+ New Scenario'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByPlaceholderText('My scenario')).not.toBeInTheDocument();
  });

  it('deletes a scenario when Delete is clicked', () => {
    render(<ScenariosPage />);
    fireEvent.click(screen.getByText('+ New Scenario'));
    fireEvent.change(screen.getByPlaceholderText('My scenario'), { target: { value: 'To Delete' } });
    fireEvent.click(screen.getByText('Save'));
    expect(screen.getByText('To Delete')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Delete'));
    expect(screen.queryByText('To Delete')).not.toBeInTheDocument();
  });

  it('navigates to compare page when Run is clicked', () => {
    const pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    render(<ScenariosPage />);
    fireEvent.click(screen.getByText('+ New Scenario'));
    fireEvent.change(screen.getByPlaceholderText('My scenario'), { target: { value: 'Run Test' } });
    const urlInputs = screen.getAllByPlaceholderText('https://example.com');
    fireEvent.change(urlInputs[0], { target: { value: 'https://a.com' } });
    fireEvent.change(screen.getByPlaceholderText('https://example.org'), { target: { value: 'https://b.com' } });
    fireEvent.click(screen.getByText('Save'));
    fireEvent.click(screen.getByText('Run'));
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining('/compare?url1=https%3A%2F%2Fa.com&url2=https%3A%2F%2Fb.com')
    );
  });

  it('populates form with scenario data when Edit is clicked', () => {
    render(<ScenariosPage />);
    fireEvent.click(screen.getByText('+ New Scenario'));
    fireEvent.change(screen.getByPlaceholderText('My scenario'), { target: { value: 'Edit Me' } });
    fireEvent.click(screen.getByText('Save'));
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByDisplayValue('Edit Me')).toBeInTheDocument();
  });
});
