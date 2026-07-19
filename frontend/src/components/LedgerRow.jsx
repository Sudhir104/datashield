import { Check } from 'lucide-react';

const PRIORITY_DOT = {
  high: 'var(--color-rust)',
  medium: 'var(--color-brass)',
  low: 'var(--color-slate)',
};

export default function LedgerRow({ item, onToggle }) {
  return (
    <div className="ledger-row flex items-start gap-3 py-4">
      <button
        onClick={() => onToggle(item)}
        aria-label={item.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        className="mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors"
        style={{
          borderColor: item.isCompleted ? 'var(--color-moss)' : 'var(--color-line)',
          backgroundColor: item.isCompleted ? 'var(--color-moss)' : 'transparent',
        }}
      >
        {item.isCompleted && <Check size={13} color="white" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: PRIORITY_DOT[item.priority] }}
            title={`${item.priority} priority`}
          />
          <p
            className="text-sm font-medium"
            style={{
              color: item.isCompleted ? 'var(--color-slate)' : 'var(--color-ink)',
              textDecoration: item.isCompleted ? 'line-through' : 'none',
            }}
          >
            {item.title}
          </p>
        </div>
        <p className="text-xs mt-0.5 ml-3.5" style={{ color: 'var(--color-slate)' }}>
          {item.description}
        </p>
      </div>
    </div>
  );
}
