import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity, ArrowDownToLine, ArrowUpRight, Bell, Boxes, Check, ChevronDown,
  Download, FileBarChart, Mail, Package, Plus, Search, Settings2,
  ShieldCheck, ShoppingBag, Users, X
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import { DataTable, Modal, TableColumn } from '../components/shared';
import {
  AdminNotification, chartColors, Customer, Order, OrderStatus, Product, revenueByRange,
  salesByCategory, topProducts
} from '../data/sampleData';

const currency = (amount: number) => `$${amount.toLocaleString()}`;
const shortMoney = (amount: number) => amount >= 1000 ? `$${(amount / 1000).toFixed(0)}k` : `$${amount}`;

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <header className="page-heading management-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-subtitle">{description}</p></div>{action && <div className="heading-action">{action}</div>}</header>;
}

function StatusBadge({ value }: { value: string }) {
  return <span className={`status-badge badge-${value.toLowerCase().replaceAll(' ', '-')}`}><i />{value}</span>;
}

export function AnalyticsPage() {
  const [range, setRange] = useState<keyof typeof revenueByRange>('12M');
  const data = revenueByRange[range];
  return <motion.div className="page-stack management-page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }}>
    <PageHeader eyebrow="PERFORMANCE" title="Analytics" description="Explore revenue and product performance over time." action={<div className="range-switcher">{(['7D', '30D', '12M'] as const).map(item => <button key={item} className={range === item ? 'active' : ''} onClick={() => setRange(item)}>{item}</button>)}</div>} />
    <div className="analytics-kpis"><article><span>Gross revenue</span><b>$48,290</b><small className="trend-up"><ArrowUpRight size={13} /> 12.8% this period</small></article><article><span>Average order value</span><b>$84.60</b><small className="trend-up"><ArrowUpRight size={13} /> 3.2% this period</small></article><article><span>Returning customers</span><b>38.4%</b><small className="trend-up"><ArrowUpRight size={13} /> 5.7% this period</small></article><article><span>Refund rate</span><b>1.8%</b><small className="trend-neutral">−0.4% this period</small></article></div>
    <section className="panel analytics-chart-panel">
      <div className="panel-heading"><div><h2>Revenue over time</h2><p>Current period compared with the previous period.</p></div><span className="chart-caption">USD · {range}</span></div>
      <div className="analytics-area-chart"><ResponsiveContainer width="100%" height="100%">
        <AreaChart data={[...data]} margin={{ top: 14, right: 18, left: -12, bottom: 4 }}>
          <defs><linearGradient id="analytics-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={chartColors.gold} stopOpacity={.3} /><stop offset="100%" stopColor={chartColors.gold} stopOpacity={0} /></linearGradient></defs>
          <CartesianGrid vertical={false} stroke="rgba(241,240,235,.1)" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: chartColors.taupe, fontSize: 10 }} />
          <YAxis axisLine={false} tickLine={false} tickFormatter={shortMoney} tick={{ fill: chartColors.taupe, fontSize: 9 }} />
          <Tooltip formatter={(value: number, name: string) => [currency(value), name]} contentStyle={{ background: '#14251E', border: '1px solid rgba(148,107,46,.35)', borderRadius: 9, color: chartColors.ivory }} />
          <Area dataKey="previous" name="Previous period" type="monotone" stroke={chartColors.taupe} strokeDasharray="4 4" fill="transparent" isAnimationActive animationDuration={850} animationEasing="ease-out" />
          <Area dataKey="revenue" name="Revenue" type="monotone" stroke={chartColors.gold} strokeWidth={2} fill="url(#analytics-gradient)" isAnimationActive animationDuration={1200} animationEasing="ease-out" />
        </AreaChart>
      </ResponsiveContainer></div>
    </section>
    <div className="chart-grid analytics-lower">
      <section className="panel analytics-chart-panel">
        <div className="panel-heading"><div><h2>Product performance</h2><p>Revenue generated per product.</p></div></div>
        <div className="products-chart"><ResponsiveContainer width="100%" height="100%">
          <BarChart data={topProducts} margin={{ top: 8, right: 12, left: 0, bottom: 30 }}>
            <CartesianGrid vertical={false} stroke="rgba(241,240,235,.1)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartColors.taupe, fontSize: 8 }} angle={-22} textAnchor="end" interval={0} height={48} />
            <YAxis axisLine={false} tickLine={false} tickFormatter={shortMoney} tick={{ fill: chartColors.taupe, fontSize: 9 }} width={42} />
            <Tooltip formatter={(value: number) => currency(value)} contentStyle={{ background: '#14251E', border: '1px solid rgba(148,107,46,.35)', borderRadius: 9, color: chartColors.ivory }} />
            <Bar dataKey="revenue" fill={chartColors.gold} radius={[5, 5, 0, 0]} barSize={28} isAnimationActive animationDuration={1100} animationEasing="ease-out" />
          </BarChart>
        </ResponsiveContainer></div>
      </section>
      <section className="panel analytics-chart-panel">
        <div className="panel-heading"><div><h2>Category mix</h2><p>Revenue distribution across the catalog.</p></div></div>
        <div className="analytics-donut-wrap">
          <div className="donut-chart"><ResponsiveContainer width="100%" height="100%">
            <PieChart><Pie data={salesByCategory} dataKey="value" innerRadius="68%" outerRadius="88%" paddingAngle={4} stroke="none" isAnimationActive animationDuration={1000} animationEasing="ease-out">
              {salesByCategory.map(item => <Cell key={item.name} fill={item.color} />)}
            </Pie><Tooltip formatter={(value: number) => [`${value}%`, 'Share']} contentStyle={{ background: '#14251E', border: '1px solid rgba(148,107,46,.35)', borderRadius: 9, color: chartColors.ivory }} /></PieChart>
          </ResponsiveContainer><div className="donut-center"><small>SALES MIX</small><b>100%</b></div></div>
          <div className="category-legend">{salesByCategory.map(item => <span key={item.name}><i style={{ background: item.color }} />{item.name}<b>{item.value}%</b></span>)}</div>
        </div>
      </section>
    </div>
  </motion.div>;
}

export function UsersPage({ users, onAdd, search }: { users: Customer[]; onAdd: (user: Customer) => void; search: string }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Customer['role']>('Student');
  const columns: TableColumn<Customer>[] = [
    { key: 'name', label: 'CUSTOMER', render: row => <span className="table-main-cell"><span className="client-avatar">{row.name[0]}</span><span><b>{row.name}</b><small>{row.email}</small></span></span> },
    { key: 'role', label: 'ROLE' },
    { key: 'joined', label: 'JOINED', render: row => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(row.joined)) },
    { key: 'spent', label: 'TOTAL SPENT', render: row => <b>{currency(row.spent)}</b> },
    { key: 'status', label: 'STATUS', sortable: false, render: row => <StatusBadge value={row.status} /> }
  ];
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onAdd({ id: `U-${Date.now().toString().slice(-5)}`, name: newName.trim(), email: newEmail.trim(), role: newRole, status: 'Invited', joined: new Date().toISOString().slice(0, 10), spent: 0 });
    setNewName(''); setNewEmail(''); setNewRole('Student'); setCreateOpen(false);
  };
  return <motion.div className="page-stack management-page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }}>
    <PageHeader eyebrow="COMMUNITY" title="Users" description="Meet the people learning, teaching, and building with ProjectHub." action={<button className="button button-primary" onClick={() => setCreateOpen(true)}><Plus size={16} /> Invite user</button>} />
    <div className="analytics-kpis compact-kpis"><article><span>Total members</span><b>{users.length.toLocaleString()}</b><small>Across your community</small></article><article><span>Active this month</span><b>{users.filter(user => user.status === 'Active').length}</b><small className="trend-up">↑ 8.2% this period</small></article><article><span>Invitations</span><b>{users.filter(user => user.status === 'Invited').length}</b><small>Waiting for a first sign in</small></article></div>
    <section className="panel management-table-panel"><div className="panel-heading"><div><h2>Community members</h2><p>Search, filter, and sort your member list.</p></div><span className="subtle-count"><Users size={15} /> {users.length} members</span></div><DataTable rows={users} columns={columns} search={search} searchFields={['name', 'email', 'role', 'status']} rowId={row => row.id} pageSize={8} filterKey="status" filters={['Active', 'Invited', 'Inactive']} /></section>
    <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Invite a community member"><form className="modal-form" onSubmit={submit}><p>Send an invitation by adding their details to your member list.</p><label>Full name<input required value={newName} onChange={event => setNewName(event.target.value)} placeholder="Alex Morgan" /></label><label>Email address<input required type="email" value={newEmail} onChange={event => setNewEmail(event.target.value)} placeholder="alex@example.com" /></label><label>Member role<select value={newRole} onChange={event => setNewRole(event.target.value as Customer['role'])}><option>Student</option><option>Educator</option><option>Builder</option></select></label><div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setCreateOpen(false)}>Cancel</button><button type="submit" className="button button-primary"><Mail size={15} /> Add invitation</button></div></form></Modal>
  </motion.div>;
}

export function OrdersPage({ orders, onSelect, search }: { orders: Order[]; onSelect: (order: Order) => void; search: string }) {
  const [exported, setExported] = useState(false);
  const columns: TableColumn<Order>[] = [
    { key: 'id', label: 'ORDER', render: row => <span className="order-id">{row.id}</span> },
    { key: 'customer', label: 'CUSTOMER', render: row => <span className="table-main-cell"><span className="client-avatar">{row.customer[0]}</span><span><b>{row.customer}</b><small>{row.email}</small></span></span> },
    { key: 'product', label: 'PRODUCT', render: row => <span className="table-stacked"><b>{row.product}</b><small>{row.category}</small></span> },
    { key: 'date', label: 'DATE', render: row => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(row.date)) },
    { key: 'amount', label: 'AMOUNT', render: row => <b>{currency(row.amount)}</b> },
    { key: 'status', label: 'STATUS', sortable: false, render: row => <StatusBadge value={row.status} /> }
  ];
  const exportOrders = () => {
    downloadOrdersCsv(orders);
    setExported(true);
    window.setTimeout(() => setExported(false), 2500);
  };
  return <motion.div className="page-stack management-page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }}>
    <PageHeader eyebrow="SALES" title="Orders" description="Keep an eye on purchases and customer activity." action={<button className="button button-outline" onClick={exportOrders}>{exported ? <Check size={15} /> : <Download size={15} />}{exported ? 'Downloaded' : 'Export orders'}</button>} />
    <div className="analytics-kpis compact-kpis"><article><span>Gross sales</span><b>$48,290</b><small className="trend-up">↑ 12.8% this month</small></article><article><span>Orders this month</span><b>{orders.length.toLocaleString()}</b><small className="trend-up">↑ 4.6% this month</small></article><article><span>Awaiting payment</span><b>{orders.filter(order => order.status === 'Pending').length}</b><small>Need a quick follow-up</small></article></div>
    <section className="panel management-table-panel"><div className="panel-heading"><div><h2>All orders</h2><p>Select an order to see its complete receipt.</p></div><span className="subtle-count"><ShoppingBag size={15} /> {orders.length} orders</span></div><DataTable rows={orders} columns={columns} search={search} searchFields={['id', 'customer', 'email', 'product', 'category', 'status']} onRowClick={onSelect} rowId={row => row.id} pageSize={8} filterKey="status" filters={['Paid', 'Pending', 'Refunded', 'Cancelled'] satisfies OrderStatus[]} /></section>
  </motion.div>;
}

export function ProductsPage({ products, onToggle, onAdd, search }: { products: Product[]; onToggle: (id: string) => void; onAdd: (product: Product) => void; search: string }) {
  const [selected, setSelected] = useState<Product | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Product['category']>('Templates');
  const [newPrice, setNewPrice] = useState('49');
  const columns: TableColumn<Product>[] = [
    { key: 'name', label: 'PRODUCT', render: row => <span className="table-main-cell"><span className="product-avatar"><Package size={16} /></span><span><b>{row.name}</b><small>{row.id}</small></span></span> },
    { key: 'category', label: 'CATEGORY' },
    { key: 'price', label: 'PRICE', render: row => <b>{currency(row.price)}</b> },
    { key: 'stock', label: 'IN STOCK', render: row => <span className={row.stock < 70 ? 'low-stock' : ''}>{row.stock}</span> },
    { key: 'sold', label: 'UNITS SOLD', render: row => row.sold.toLocaleString() },
    { key: 'status', label: 'STATUS', sortable: false, render: row => <StatusBadge value={row.status} /> }
  ];
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onAdd({ id: `P-${Date.now().toString().slice(-3)}`, name: newName.trim(), category: newCategory, price: Number(newPrice), stock: 50, sold: 0, status: 'Draft' });
    setCreateOpen(false); setNewName(''); setNewPrice('49');
  };
  return <motion.div className="page-stack management-page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }}>
    <PageHeader eyebrow="CATALOG" title="Products" description="Curate the resources that help the community build." action={<button className="button button-primary" onClick={() => setCreateOpen(true)}><Plus size={16} /> Add product</button>} />
    <div className="analytics-kpis compact-kpis"><article><span>Catalog products</span><b>{products.length}</b><small>Across {new Set(products.map(product => product.category)).size} categories</small></article><article><span>Active listings</span><b>{products.filter(product => product.status === 'Active').length}</b><small>Visible to the community</small></article><article><span>Stock watch</span><b>{products.filter(product => product.stock > 0 && product.stock < 70).length}</b><small>Items with less than 70 available</small></article></div>
    <section className="panel management-table-panel"><div className="panel-heading"><div><h2>Product catalog</h2><p>Select a product to preview or update its listing state.</p></div><span className="subtle-count"><Boxes size={15} /> {products.length} products</span></div><DataTable rows={products} columns={columns} search={search} searchFields={['id', 'name', 'category', 'status']} onRowClick={setSelected} rowId={row => row.id} pageSize={8} filterKey="category" filters={[...new Set(products.map(product => product.category))]} /></section>
    <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Product overview">{selected && <div className="product-modal-content"><div className="product-modal-icon"><Package size={24} /></div><p className="eyebrow">{selected.category} · {selected.id}</p><h3>{selected.name}</h3><div className="product-facts"><span>Price <b>{currency(selected.price)}</b></span><span>In stock <b>{selected.stock}</b></span><span>Units sold <b>{selected.sold}</b></span></div><div className="modal-actions"><button className="button button-outline" onClick={() => setSelected(null)}>Close</button><button className="button button-primary" onClick={() => { onToggle(selected.id); setSelected(null); }}>{selected.status === 'Active' ? 'Unpublish product' : 'Publish product'}</button></div></div>}</Modal>
    <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add a product"><form className="modal-form" onSubmit={submit}><p>Create a catalog entry. It will start as a draft.</p><label>Product name<input required value={newName} onChange={event => setNewName(event.target.value)} placeholder="Build your first app" /></label><label>Category<select value={newCategory} onChange={event => setNewCategory(event.target.value)}><option>Templates</option><option>Courses</option><option>Components</option><option>Tools</option></select></label><label>Price (USD)<input required type="number" min="0" step="1" value={newPrice} onChange={event => setNewPrice(event.target.value)} /></label><div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setCreateOpen(false)}>Cancel</button><button className="button button-primary" type="submit"><Plus size={15} /> Create draft</button></div></form></Modal>
  </motion.div>;
}

function csvCell(value: unknown) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function downloadOrdersCsv(orders: Order[]) {
  const body = [['Order', 'Customer', 'Email', 'Product', 'Category', 'Date', 'Amount USD', 'Status'], ...orders.map(order => [order.id, order.customer, order.email, order.product, order.category, order.date, order.amount, order.status])]
    .map(row => row.map(csvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([body], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'projecthub-orders.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ReportsPage({ orders, users, products }: { orders: Order[]; users: Customer[]; products: Product[] }) {
  const [exported, setExported] = useState(false);
  const paidRevenue = orders.filter(order => order.status === 'Paid').reduce((total, order) => total + order.amount, 0);
  const exportOrders = () => {
    downloadOrdersCsv(orders);
    setExported(true);
    window.setTimeout(() => setExported(false), 2500);
  };
  return <motion.div className="page-stack management-page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }}>
    <PageHeader eyebrow="INSIGHTS" title="Reports" description="A clear snapshot of your store and community." action={<button className="button button-primary" onClick={exportOrders}>{exported ? <Check size={16} /> : <Download size={16} />}{exported ? 'Downloaded' : 'Export orders CSV'}</button>} />
    <div className="report-card-grid"><article className="report-card report-featured"><span className="report-icon"><FileBarChart size={20} /></span><p className="eyebrow">SALES SUMMARY</p><h2>Monthly performance</h2><p>A quick read on the orders and revenue moving through your workspace.</p><div className="report-stat-row"><span><small>Paid revenue</small><b>{currency(paidRevenue)}</b></span><span><small>Orders</small><b>{orders.length}</b></span><span><small>Average order</small><b>{currency(orders.length ? Math.round(paidRevenue / Math.max(1, orders.filter(order => order.status === 'Paid').length)) : 0)}</b></span></div><button className="button button-outline" onClick={exportOrders}><ArrowDownToLine size={15} /> Download order data</button></article>
      <article className="report-card"><span className="report-icon purple"><Users size={20} /></span><p className="eyebrow">COMMUNITY</p><h2>Member overview</h2><p>See who is active across your learning and building community.</p><div className="report-big-number">{users.length.toLocaleString()} <small>members</small></div><div className="report-mini-bar"><i style={{ width: `${Math.min(100, users.filter(user => user.status === 'Active').length / Math.max(users.length, 1) * 100)}%` }} /></div><small className="report-footnote">{users.filter(user => user.status === 'Active').length} active · {users.filter(user => user.status === 'Invited').length} invited</small></article>
      <article className="report-card"><span className="report-icon lime"><Package size={20} /></span><p className="eyebrow">CATALOG</p><h2>Product snapshot</h2><p>A simple breakdown of what’s currently available to your community.</p><div className="report-big-number">{products.length} <small>products</small></div><div className="category-legend report-legend">{[...new Set(products.map(product => product.category))].map((category, index) => <span key={category}><i style={{ background: [chartColors.gold, chartColors.taupe, chartColors.forest, chartColors.ivory][index % 4] }} />{category}<b>{products.filter(product => product.category === category).length}</b></span>)}</div></article>
    </div>
    <section className="panel report-period-panel"><div><span className="report-icon"><Activity size={18} /></span><div><h2>Revenue trend</h2><p>Monthly gross revenue for the last 12 months.</p></div></div><div className="report-spark"><ResponsiveContainer width="100%" height="100%"><AreaChart data={[...revenueByRange['12M']]}><defs><linearGradient id="report-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={chartColors.gold} stopOpacity={.3} /><stop offset="100%" stopColor={chartColors.gold} stopOpacity={0} /></linearGradient></defs><Area dataKey="revenue" type="monotone" stroke={chartColors.gold} fill="url(#report-fill)" strokeWidth={2} isAnimationActive animationDuration={1200} animationEasing="ease-out" /></AreaChart></ResponsiveContainer></div></section>
  </motion.div>;
}

export function NotificationsPage({ notifications, onRead, onDismiss }: {
  notifications: AdminNotification[];
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  return <motion.div className="page-stack management-page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }}>
    <PageHeader eyebrow="UPDATES" title="Notifications" description="Stay on top of orders, members, and workspace updates." action={<button className="button button-outline" onClick={() => notifications.filter(item => !item.read).forEach(item => onRead(item.id))}><Check size={15} /> Mark all as read</button>} />
    <section className="panel notifications-full"><div className="panel-heading"><div><h2>Your inbox</h2><p>{notifications.filter(item => !item.read).length} unread updates</p></div><span className="subtle-count"><Bell size={15} /> {notifications.length} total</span></div><div className="notification-list">
      <AnimatePresence initial={false}>
        {notifications.map(item => <motion.article key={item.id} className={`notification-item ${item.read ? 'is-read' : ''}`} layout initial={{ opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 18, height: 0, paddingBlock: 0 }} transition={{ duration: .2 }}>
          <span className={`notification-dot dot-${item.kind}`} /><button className="notification-copy" onClick={() => onRead(item.id)}><b>{item.title}{!item.read && <i className="unread-dot" />}</b><span>{item.detail}</span><small>{item.time}</small></button><button className="dismiss-notification" aria-label={`Dismiss ${item.title}`} onClick={() => onDismiss(item.id)}><X size={15} /></button>
        </motion.article>)}
      </AnimatePresence>
      {notifications.length === 0 && <div className="muted-empty inbox-empty">You’re all caught up. New updates will appear here.</div>}
    </div></section>
  </motion.div>;
}

export function SettingsPage({ theme, onThemeChange, profileName, onProfileNameChange }: {
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
  profileName: string;
  onProfileNameChange: (name: string) => void;
}) {
  const [name, setName] = useState(profileName);
  const [saved, setSaved] = useState(false);
  const save = (event: FormEvent) => {
    event.preventDefault(); onProfileNameChange(name.trim()); setSaved(true); window.setTimeout(() => setSaved(false), 2200);
  };
  return <motion.div className="page-stack management-page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }}>
    <PageHeader eyebrow="PREFERENCES" title="Settings" description="Make your ProjectHub workspace feel like yours." />
    <section className="panel settings-panel"><div className="settings-title"><span className="settings-icon"><Settings2 size={18} /></span><div><h2>Workspace preferences</h2><p>These preferences are saved for this browser session.</p></div></div>
      <form className="settings-form" onSubmit={save}><label>Display name<input value={name} onChange={event => setName(event.target.value)} required maxLength={60} placeholder="Your name" /></label><div className="setting-row"><div><b>Theme appearance</b><small>Choose the color mode used in this dashboard.</small></div><div className="theme-choices"><button type="button" className={theme === 'dark' ? 'active' : ''} onClick={() => onThemeChange('dark')}>Dark</button><button type="button" className={theme === 'light' ? 'active' : ''} onClick={() => onThemeChange('light')}>Light</button></div></div><div className="setting-row"><div><b>Reduced motion</b><small>Animations respect your system accessibility preference.</small></div><span className="system-preference"><ShieldCheck size={15} /> System managed</span></div><div className="modal-actions"><span className="save-feedback">{saved && <><Check size={14} /> Preferences saved</>}</span><button type="submit" className="button button-primary">Save preferences</button></div></form>
    </section>
    <section className="panel settings-panel"><div className="settings-title"><span className="settings-icon"><ShieldCheck size={18} /></span><div><h2>Data and privacy</h2><p>Project submissions and client contacts are protected by Supabase row-level policies.</p></div></div><p className="settings-security-note">Sample charts, customer, order, and catalog data are local demonstration data. They can be replaced with API-backed records when a store service is available.</p></section>
  </motion.div>;
}
