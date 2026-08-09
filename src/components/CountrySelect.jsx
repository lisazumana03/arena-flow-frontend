import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { COUNTRIES } from '../utils/countries';

// A self-contained, dependency-free searchable country combobox. Stores/returns the
// country's display name (e.g. "South Africa") as a plain string, matching the plain
// String nationality/country fields on the backend (playerNationality, ownerNationality, etc).
export default function CountrySelect({ value, onChange, placeholder = 'Select a country…', required = false, id }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const autoId = useId();
  const inputId = id || autoId;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectCountry = (country) => {
    onChange?.(country.name);
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlight]) selectCountry(filtered[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="position-relative" ref={rootRef}>
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        className="form-control"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={value ? undefined : placeholder}
        value={open ? query : (value || '')}
        required={required}
        onFocus={() => { setOpen(true); setQuery(''); setHighlight(0); }}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlight(0); }}
        onKeyDown={handleKeyDown}
      />
      {open && (
        <ul
          className="list-group position-absolute w-100 shadow-sm"
          style={{ zIndex: 1050, maxHeight: 260, overflowY: 'auto', top: '100%' }}
        >
          {filtered.length === 0 ? (
            <li className="list-group-item text-muted small">No matches</li>
          ) : (
            filtered.map((c, idx) => (
              <li
                key={c.code}
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${idx === highlight ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
                onMouseDown={(e) => { e.preventDefault(); selectCountry(c); }}
                onMouseEnter={() => setHighlight(idx)}
              >
                <span aria-hidden="true">{c.flag}</span>
                <span>{c.name}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
