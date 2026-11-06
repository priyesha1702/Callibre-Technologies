import { AnimatePresence, motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { ReactNode, useEffect, useRef, useState } from 'react';

export function Dropdown({ label, trigger, children, align = 'right' }: {
  label: string;
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return <div className="dropdown-root" ref={root}>
    <button className="dropdown-trigger" aria-label={label} aria-expanded={open} onClick={() => setOpen(value => !value)}>{trigger}</button>
    <AnimatePresence>
      {open && <motion.div className={`dropdown-menu dropdown-${align}`} role="menu" initial={{ opacity: 0, y: -7, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: .98 }} transition={{ duration: .16 }} onClick={event => {
        if ((event.target as HTMLElement).closest('[data-close-dropdown]')) setOpen(false);
      }}>{children}</motion.div>}
    </AnimatePresence>
  </div>;
}

export function Modal({ open, onClose, title, children, className = '' }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('modal-open');
    };
  }, [open, onClose]);

  return <AnimatePresence>
    {open && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <motion.section className={`modal-card ${className}`} role="dialog" aria-modal="true" aria-label={title} initial={{ opacity: 0, scale: .94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .96, y: 8 }} transition={{ type: 'spring', stiffness: 310, damping: 27 }}>
        <header className="modal-header"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={17} /></button></header>
        {children}
      </motion.section>
    </motion.div>}
  </AnimatePresence>;
}

export function SkeletonPage() {
  return <main className="skeleton-page" aria-label="Loading dashboard">
    <div className="skeleton-top"><span className="skeleton shimmer-logo" /><span className="skeleton shimmer-search" /></div>
    <div className="skeleton-heading"><span className="skeleton shimmer-line short" /><span className="skeleton shimmer-line wide" /><span className="skeleton shimmer-line medium" /></div>
    <div className="skeleton-stats">{[1, 2, 3, 4].map(item => <span className="skeleton shimmer-stat" key={item} />)}</div>
    <div className="skeleton-content"><span className="skeleton shimmer-panel" /><span className="skeleton shimmer-panel" /></div>
    <div className="skeleton shimmer-table" />
  </main>;
}

export function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0 }: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, current => Number(current.toFixed(decimals)));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: .9, ease: [0.22, 1, 0.36, 1] });
    const unsubscribe = rounded.on('change', setDisplay);
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [motionValue, rounded, value]);

  return <>{prefix}{display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>;
}

export type TableColumn<T> = {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
};

export function DataTable<T extends object>({ rows, columns, search, searchFields, filterKey, filters = [], onRowClick, rowId, pageSize = 6, emptyMessage = 'No matching results.' }: {
  rows: T[];
  columns: TableColumn<T>[];
  search: string;
  searchFields?: (keyof T)[];
  filterKey?: keyof T;
  filters?: string[];
  onRowClick?: (row: T) => void;
  rowId: (row: T) => string;
  pageSize?: number;
  emptyMessage?: string;
}) {
  const [localSearch, setLocalSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortKey, setSortKey] = useState<string>(String(columns[0]?.key ?? ''));
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const query = `${search} ${localSearch}`.trim().toLowerCase();
  const filtered = rows.filter(row => {
    const record = row as Record<string, unknown>;
    const fields: (keyof T | string)[] = searchFields ?? Object.keys(record);
    const matchesText = !query || fields.some(key => String(record[String(key)] ?? '').toLowerCase().includes(query));
    const matchesFilter = activeFilter === 'All' || String(record[String(filterKey)] ?? '') === activeFilter;
    return matchesText && matchesFilter;
  });
  const sorted = [...filtered].sort((a, b) => {
    const left = (a as Record<string, unknown>)[sortKey];
    const right = (b as Record<string, unknown>)[sortKey];
    const order = typeof left === 'number' && typeof right === 'number'
      ? left - right
      : String(left ?? '').localeCompare(String(right ?? ''), undefined, { numeric: true, sensitivity: 'base' });
    return sortDirection === 'asc' ? order : -order;
  });
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => setPage(0), [query, activeFilter, rows.length]);
  useEffect(() => {
    if (page >= pageCount) setPage(Math.max(0, pageCount - 1));
  }, [page, pageCount]);

  return <div className="data-table">
    <div className="table-controls">
      <label className="table-search"><Search size={15} /><input value={localSearch} onChange={event => setLocalSearch(event.target.value)} placeholder="Search in table…" aria-label="Search table" /></label>
      {filters.length > 0 && <div className="table-filter">{['All', ...filters].map(value => <button key={value} className={value === activeFilter ? 'active' : ''} onClick={() => setActiveFilter(value)}>{value}</button>)}</div>}
      <span className="table-result-count">{filtered.length} results</span>
    </div>
    <div className="table-scroll"><table><thead><tr>{columns.map(column => <th key={String(column.key)}><button disabled={column.sortable === false} onClick={() => {
      if (sortKey === String(column.key)) setSortDirection(value => value === 'asc' ? 'desc' : 'asc');
      else { setSortKey(String(column.key)); setSortDirection('asc'); }
    }}>{column.label}{sortKey === String(column.key) && <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>}</button></th>)}</tr></thead>
      <tbody>
        <AnimatePresence initial={false} mode="popLayout">
          {pageRows.map((row, index) => <motion.tr key={rowId(row)} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .18, delay: index * .025 }} onClick={() => onRowClick?.(row)} className={onRowClick ? 'clickable-row' : ''}>
            {columns.map(column => <td key={String(column.key)}>{column.render ? column.render(row) : String((row as Record<string, unknown>)[String(column.key)] ?? '—')}</td>)}
          </motion.tr>)}
        </AnimatePresence>
      </tbody>
    </table>
      {pageRows.length === 0 && <div className="table-empty">{emptyMessage}</div>}
    </div>
    <footer className="table-pagination"><span>Showing <b>{sorted.length ? page * pageSize + 1 : 0}–{Math.min((page + 1) * pageSize, sorted.length)}</b> of <b>{sorted.length}</b></span><div><button aria-label="Previous page" disabled={page === 0} onClick={() => setPage(value => Math.max(0, value - 1))}><ChevronLeft size={16} /></button><span>Page {page + 1} of {pageCount}</span><button aria-label="Next page" disabled={page >= pageCount - 1} onClick={() => setPage(value => Math.min(pageCount - 1, value + 1))}><ChevronRight size={16} /></button></div></footer>
  </div>;
}
