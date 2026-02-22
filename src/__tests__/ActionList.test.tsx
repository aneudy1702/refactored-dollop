import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ActionList from '@/components/ActionList';

describe('ActionList', () => {
  it('renders empty list with an Add Action button', () => {
    const onChange = jest.fn();
    render(<ActionList actions={[]} onChange={onChange} />);
    expect(screen.getByText('+ Add Action')).toBeInTheDocument();
  });

  it('adds an action when Add Action is clicked', () => {
    const onChange = jest.fn();
    render(<ActionList actions={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText('+ Add Action'));
    expect(onChange).toHaveBeenCalledWith([{ type: 'click', selector: '' }]);
  });

  it('renders a click action with selector input', () => {
    const onChange = jest.fn();
    const actions = [{ type: 'click' as const, selector: '#btn' }];
    render(<ActionList actions={actions} onChange={onChange} />);
    expect(screen.getByDisplayValue('#btn')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Click')).toBeInTheDocument();
  });

  it('renders a type action with selector and value inputs', () => {
    const onChange = jest.fn();
    const actions = [{ type: 'type' as const, selector: '#input', value: 'hello' }];
    render(<ActionList actions={actions} onChange={onChange} />);
    expect(screen.getByDisplayValue('#input')).toBeInTheDocument();
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument();
  });

  it('renders a wait action with delay input', () => {
    const onChange = jest.fn();
    const actions = [{ type: 'wait' as const, delay: 1000 }];
    render(<ActionList actions={actions} onChange={onChange} />);
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
  });

  it('removes an action when × is clicked', () => {
    const onChange = jest.fn();
    const actions = [{ type: 'click' as const, selector: '#btn' }];
    render(<ActionList actions={actions} onChange={onChange} />);
    fireEvent.click(screen.getByText('×'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('updates action type when select changes', () => {
    const onChange = jest.fn();
    const actions = [{ type: 'click' as const, selector: '' }];
    render(<ActionList actions={actions} onChange={onChange} />);
    fireEvent.change(screen.getByDisplayValue('Click'), { target: { value: 'type' } });
    expect(onChange).toHaveBeenCalledWith([{ type: 'type', selector: '' }]);
  });

  it('updates selector when input changes', () => {
    const onChange = jest.fn();
    const actions = [{ type: 'click' as const, selector: '' }];
    render(<ActionList actions={actions} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText('CSS selector'), { target: { value: '.my-class' } });
    expect(onChange).toHaveBeenCalledWith([{ type: 'click', selector: '.my-class' }]);
  });
});
