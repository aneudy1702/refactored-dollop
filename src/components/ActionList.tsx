'use client';

type Action = {
  type: 'click' | 'type' | 'wait';
  selector?: string;
  value?: string;
  delay?: number;
};

interface ActionListProps {
  actions: Action[];
  onChange: (actions: Action[]) => void;
}

export default function ActionList({ actions, onChange }: ActionListProps) {
  const addAction = () => {
    onChange([...actions, { type: 'click', selector: '' }]);
  };

  const removeAction = (index: number) => {
    onChange(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, partial: Partial<Action>) => {
    onChange(actions.map((a, i) => (i === index ? { ...a, ...partial } : a)));
  };

  return (
    <div className="space-y-2">
      {actions.map((action, i) => (
        <div key={i} className="flex gap-2 items-center bg-gray-50 dark:bg-gray-700/50 rounded p-2">
          <select
            value={action.type}
            onChange={e => updateAction(i, { type: e.target.value as Action['type'] })}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="click">Click</option>
            <option value="type">Type</option>
            <option value="wait">Wait</option>
          </select>
          {action.type !== 'wait' ? (
            <input
              placeholder="CSS selector"
              value={action.selector || ''}
              onChange={e => updateAction(i, { selector: e.target.value })}
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          ) : (
            <input
              placeholder="Selector (optional)"
              value={action.selector || ''}
              onChange={e => updateAction(i, { selector: e.target.value })}
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          )}
          {action.type === 'type' && (
            <input
              placeholder="Text to type"
              value={action.value || ''}
              onChange={e => updateAction(i, { value: e.target.value })}
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          )}
          {action.type === 'wait' && (
            <input
              placeholder="Delay (ms)"
              type="number"
              value={action.delay || ''}
              onChange={e => updateAction(i, { delay: parseInt(e.target.value) || 0 })}
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm w-28 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          )}
          <button
            onClick={() => removeAction(i)}
            className="text-red-500 hover:text-red-700 text-lg font-bold px-1"
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={addAction}
        className="mt-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
      >
        + Add Action
      </button>
    </div>
  );
}
