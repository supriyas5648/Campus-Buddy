import { useEffect, useId, useMemo, useRef, useState } from 'react';

/**
 * Accessible autocomplete combobox.
 *
 * Matching is done on the building name *and* its aliases, and results are
 * ranked so that prefix matches come before substring matches — typing "adm"
 * puts "Admin Building" at the top.
 *
 * Keyboard: ↑/↓ move, Enter selects, Escape closes, Tab commits the highlight.
 *
 * @param {{
 *   label: string,
 *   value: string,
 *   onChange: (value: string) => void,
 *   options: Array<{name: string, category?: string, description?: string, aliases?: string[]}>,
 *   placeholder?: string,
 *   icon?: React.ReactNode,
 *   disabled?: boolean,
 *   emptyMessage?: string
 * }} props
 */
export default function SearchableSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Search…',
  icon,
  disabled = false,
  emptyMessage = 'No matching locations',
}) {
  const [query, setQuery] = useState(value ?? '');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const wrapperRef = useRef(null);
  const listRef = useRef(null);
  const inputId = useId();
  const listId = `${inputId}-listbox`;

  // Keep the visible text in sync when the parent resets or swaps the value.
  useEffect(() => setQuery(value ?? ''), [value]);

  // Close on outside click.
  useEffect(() => {
    function onPointerDown(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const matches = useMemo(() => rank(options, query), [options, query]);

  // Keep the highlighted option scrolled into view.
  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.children?.[highlight];
    node?.scrollIntoView({ block: 'nearest' });
  }, [highlight, open]);

  function commit(name) {
    onChange(name);
    setQuery(name);
    setOpen(false);
  }

  function onKeyDown(event) {
    if (!open && ['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) {
      setOpen(true);
      setHighlight(0);
      return;
    }
    if (!open) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlight((index) => (matches.length ? (index + 1) % matches.length : 0));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlight((index) => (matches.length ? (index - 1 + matches.length) % matches.length : 0));
        break;
      case 'Enter':
        event.preventDefault();
        if (matches[highlight]) commit(matches[highlight].name);
        break;
      case 'Tab':
        if (matches[highlight]) commit(matches[highlight].name);
        break;
      case 'Escape':
        event.preventDefault();
        setOpen(false);
        break;
      default:
        break;
    }
  }

  const showClear = query.length > 0 && !disabled;

  return (
    <div ref={wrapperRef} className="relative">
      <label htmlFor={inputId} className="field-label">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base">
            {icon}
          </span>
        )}

        <input
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && matches[highlight] ? `${listId}-${highlight}` : undefined}
          disabled={disabled}
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            onChange(event.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={`input ${icon ? 'pl-11' : ''} ${showClear ? 'pr-11' : 'pr-10'}`}
        />

        {showClear ? (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setQuery('');
              setOpen(false);
            }}
            className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-white/10 hover:text-slate-200"
            aria-label={`Clear ${label}`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        ) : (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>

      {open && (
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          aria-label={label}
          className="glass-strong absolute z-40 mt-2 max-h-64 w-full animate-scale-in overflow-y-auto p-1.5"
        >
          {matches.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-slate-500">{emptyMessage}</li>
          ) : (
            matches.map((option, index) => (
              <li
                key={option.name}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === highlight}
                onMouseEnter={() => setHighlight(index)}
                onMouseDown={(event) => {
                  // Fire before the input's blur so the click always registers.
                  event.preventDefault();
                  commit(option.name);
                }}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                  index === highlight ? 'bg-brand-500/20 ring-1 ring-brand-400/40' : 'hover:bg-white/5'
                }`}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-sm">
                  {CATEGORY_ICONS[option.category] || '📍'}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-100">
                    {option.name}
                  </span>
                  {option.description && (
                    <span className="block truncate text-xs text-slate-500">{option.description}</span>
                  )}
                </span>
                {value === option.name && <span className="text-xs text-brand-300">✓</span>}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

const CATEGORY_ICONS = {
  academic: '🏛',
  administrative: '🏢',
  residential: '🏠',
  amenity: '🌳',
  landmark: '📌',
  sports: '🏏',
  parking: '🅿️',
};

/**
 * Filters and ranks options against the typed query.
 * Rank 0 = exact, 1 = name prefix, 2 = alias prefix, 3 = substring anywhere.
 */
function rank(options, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return options;

  return options
    .map((option) => {
      const name = option.name.toLowerCase();
      const aliases = (option.aliases || []).map((alias) => alias.toLowerCase());

      if (name === needle) return { option, score: 0 };
      if (name.startsWith(needle)) return { option, score: 1 };
      if (aliases.some((alias) => alias.startsWith(needle))) return { option, score: 2 };
      if (name.includes(needle) || aliases.some((alias) => alias.includes(needle))) {
        return { option, score: 3 };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score || a.option.name.localeCompare(b.option.name))
    .map((entry) => entry.option);
}
