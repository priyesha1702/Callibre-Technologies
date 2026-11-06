import { AnimatePresence, motion } from 'framer-motion';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import {
  ArrowUpRight, Clock3, ExternalLink, FolderKanban,
  Sparkles, Users
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { AnimatedCounter, DataTable, TableColumn } from '../components/shared';
import {
  AdminNotification, chartColors, metricData, Order, OrderStatus, recentActivity, revenueByRange,
  salesByCategory, topProducts
} from '../data/sampleData';

type ProjectSubmission = {
  id: string;
  title: string;
  description: string;
  modules: string[];
  roles: string[];
  project_type: string;
  status: string;
  created_at: string;
  contact: { client_name: string; client_email: string; client_phone: string };
};

const money = (value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const shortMoney = (value: number) => value >= 1000 ? `$${(value / 1000).toFixed(value % 1000 ? 1 : 0)}k` : `$${value}`;

function TooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number; color?: string; payload?: { color?: string; revenue?: number } }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return <div className="chart-tooltip"><b>{label}</b>{payload.map((item, index) => <span key={`${item.name}-${index}`}><i style={{ background: item.color ?? item.payload?.color ?? chartColors.gold }} />{item.name ?? 'Revenue'} <strong>{money(Number(item.value ?? item.payload?.revenue ?? 0))}</strong></span>)}</div>;
}

function ChartCard({ title, description, children, className = '' }: { title: string; description: string; children: React.ReactNode; className?: string }) {
  return <motion.section className={`chart-card ${className}`} variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }} transition={{ duration: .35 }}>
    <div className="chart-card-heading"><div><h2>{title}</h2><p>{description}</p></div></div>
    {children}
  </motion.section>;
}

function StatCard({ item, index }: { item: typeof metricData[number]; index: number }) {
  const Icon = [FolderKanban, Users, Sparkles, ArrowUpRight][index];
  return <motion.article className="stat-card" variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -4, boxShadow: `0 18px 38px ${item.color}18` }} transition={{ duration: .23 }}>
    <div className="stat-card-top"><span>{item.label}</span><span className="stat-icon" style={{ color: item.color, background: `${item.color}14` }}><Icon size={17} /></span></div>
    <strong className="stat-value"><AnimatedCounter value={item.value} prefix={item.prefix} suffix={item.suffix} decimals={item.suffix === '%' ? 2 : 0} /></strong>
    <div className="stat-meta"><span className="trend-up"><ArrowUpRight size={13} /> {item.trend}%</span><span>vs. last month</span></div>
    <div className="stat-sparkline" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><AreaChart data={item.series.map((value, seriesIndex) => ({ index: seriesIndex, value }))}><defs><linearGradient id={`spark-${index}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={item.color} stopOpacity={.38} /><stop offset="100%" stopColor={item.color} stopOpacity={0} /></linearGradient></defs><Area dataKey="value" type="monotone" stroke={item.color} strokeWidth={1.7} fill={`url(#spark-${index})`} isAnimationActive animationDuration={900} animationEasing="ease-out" /></AreaChart></ResponsiveContainer></div>
  </motion.article>;
}

function NotificationPanel({ notifications, onRead, onDismiss }: {
  notifications: AdminNotification[];
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  return <section className="panel notification-panel">
    <div className="panel-heading"><div><h2>Notifications</h2><p>Updates that need your attention.</p></div><button className="text-button" onClick={() => notifications.filter(item => !item.read).forEach(item => onRead(item.id))}>Mark all read</button></div>
    <div className="notification-list">
      <AnimatePresence initial={false}>
        {notifications.slice(0, 4).map(notification => <motion.article key={notification.id} className={`notification-item ${notification.read ? 'is-read' : ''}`} layout initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0, paddingBlock: 0 }} transition={{ duration: .2 }}>
          <span className={`notification-dot dot-${notification.kind}`} />
          <button className="notification-copy" onClick={() => onRead(notification.id)}><b>{notification.title}</b><span>{notification.detail}</span><small>{notification.time}</small></button>
          <button className="dismiss-notification" aria-label={`Dismiss ${notification.title}`} onClick={() => onDismiss(notification.id)}>×</button>
        </motion.article>)}
      </AnimatePresence>
      {notifications.length === 0 && <p className="muted-empty">You’re all caught up.</p>}
    </div>
  </section>;
}

function ProjectSubmissions({ rows, onStatusChange, onRefresh }: {
  rows: ProjectSubmission[];
  onStatusChange: (id: string, status: string) => void;
  onRefresh: () => void;
}) {
  const columns: TableColumn<ProjectSubmission>[] = [
    { key: 'title', label: 'PROJECT', render: row => <span className="table-main-cell"><span className="tiny-project-icon"><FolderKanban size={15} /></span><span><b>{row.title}</b><small>{row.project_type} · {row.modules.length} modules</small></span></span> },
    { key: 'contact', label: 'SUBMITTED BY', sortable: false, render: row => <span className="table-stacked"><b>{row.contact.client_name}</b><small>{row.contact.client_email}</small></span> },
    { key: 'created_at', label: 'DATE', render: row => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(row.created_at)) },
    { key: 'status', label: 'STATUS', sortable: false, render: row => <select className="submission-status-select" value={row.status} onClick={event => event.stopPropagation()} onChange={event => onStatusChange(row.id, event.target.value)}><option value="new">New</option><option value="contacted">Contacted</option><option value="in_progress">In progress</option><option value="closed">Closed</option></select> }
  ];
  return <section className="panel projects-panel">
    <div className="panel-heading"><div><h2>Community submissions</h2><p>Ideas shared through the public ProjectHub form.</p></div><button className="text-button refresh-link" onClick={onRefresh}><ExternalLink size={14} /> Refresh</button></div>
    {rows.length ? <DataTable rows={rows} columns={columns} search="" searchFields={['title', 'description']} rowId={row => row.id} pageSize={5} filters={['new', 'contacted', 'in_progress', 'closed']} filterKey="status" /> :
      <div className="muted-empty submissions-empty"><FolderKanban size={21} /><b>No community submissions yet</b><span>Public project ideas will appear here when submitted.</span></div>}
  </section>;
}

export default function DashboardPage({ search, orders, onSelectOrder, notifications, onReadNotification, onDismissNotification, submissions, onSubmissionStatusChange, onRefreshSubmissions }: {
  search: string;
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  notifications: AdminNotification[];
  onReadNotification: (id: string) => void;
  onDismissNotification: (id: string) => void;
  submissions: ProjectSubmission[];
  onSubmissionStatusChange: (id: string, status: string) => void;
  onRefreshSubmissions: () => void;
}) {
  const [range, setRange] = useState<keyof typeof revenueByRange>('30D');
  const revenue = revenueByRange[range];
  const rangeTotal = useMemo(() => revenue.reduce((total, point) => total + point.revenue, 0), [revenue]);
  const orderColumns: TableColumn<Order>[] = [
    { key: 'id', label: 'ORDER', render: row => <span className="order-id">{row.id}</span> },
    { key: 'customer', label: 'CUSTOMER', render: row => <span className="table-stacked"><b>{row.customer}</b><small>{row.email}</small></span> },
    { key: 'product', label: 'PRODUCT' },
    { key: 'date', label: 'DATE', render: row => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(row.date)) },
    { key: 'amount', label: 'AMOUNT', render: row => <b>{money(row.amount)}</b> },
    { key: 'status', label: 'STATUS', sortable: false, render: row => <span className={`status-badge badge-${row.status.toLowerCase()}`}><i />{row.status}</span> }
  ];

  return <motion.div className="dashboard-page page-stack" variants={{ hidden: {}, show: { transition: { staggerChildren: .075, delayChildren: .04 } } }} initial="hidden" animate="show">
    <motion.header className="page-heading" variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
      <div><p className="eyebrow">OVERVIEW <span className="live-indicator"><i /> LIVE</span></p><h1>Good morning, <em>builder.</em></h1><p className="page-subtitle">Here’s your ProjectHub at a glance. Make today count.</p></div>
      <div className="heading-date"><span>{new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</span><b>✳ ProjectHub workspace</b></div>
    </motion.header>

    <motion.section className="stat-grid" variants={{ hidden: {}, show: { transition: { staggerChildren: .08 } } }}>
      {metricData.map((item, index) => <StatCard item={item} index={index} key={item.label} />)}
    </motion.section>

    <div className="chart-grid">
      <ChartCard title="Revenue analytics" description="Revenue performance over time" className="revenue-card">
        <div className="chart-summary"><strong>{money(rangeTotal)}</strong><span className="trend-up"><ArrowUpRight size={13} /> 12.8%</span><div className="range-switcher">{(['7D', '30D', '12M'] as const).map(value => <button key={value} className={range === value ? 'active' : ''} onClick={() => setRange(value)}>{value}</button>)}</div></div>
        <div className="revenue-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={[...revenue]} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
          <defs><linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={chartColors.gold} stopOpacity={.3} /><stop offset="90%" stopColor={chartColors.gold} stopOpacity={0} /></linearGradient></defs>
          <CartesianGrid vertical={false} stroke="rgba(193,215,233,.075)" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#8296AA', fontSize: 10 }} dy={9} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8296AA', fontSize: 9 }} tickFormatter={shortMoney} />
          <Tooltip content={<TooltipContent />} cursor={{ stroke: 'rgba(148,107,46,.42)', strokeDasharray: '4 4' }} />
          <Area dataKey="previous" name="Previous" type="monotone" stroke="#A68D77" strokeDasharray="4 4" strokeWidth={1.5} fill="transparent" isAnimationActive animationDuration={800} animationEasing="ease-out" />
          <Area dataKey="revenue" name="Revenue" type="monotone" stroke={chartColors.gold} strokeWidth={2.2} fill="url(#revenue-fill)" activeDot={{ r: 4, fill: chartColors.gold, stroke: '#14251E', strokeWidth: 2 }} isAnimationActive animationDuration={1100} animationEasing="ease-out" />
        </AreaChart></ResponsiveContainer></div>
        <div className="chart-legend"><span><i className="legend-cyan" /> This period</span><span><i className="legend-muted" /> Previous period</span></div>
      </ChartCard>

      <ChartCard title="Sales by category" description="Share of total revenue" className="category-card">
        <div className="donut-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={salesByCategory} dataKey="value" nameKey="name" innerRadius="68%" outerRadius="88%" paddingAngle={4} stroke="none" isAnimationActive animationDuration={1000} animationEasing="ease-out">
          {salesByCategory.map(item => <Cell key={item.name} fill={item.color} />)}
        </Pie><Tooltip content={<TooltipContent />} /></PieChart></ResponsiveContainer>
          <div className="donut-center"><small>TOTAL SALES</small><b>$48.2k</b></div>
        </div>
        <div className="category-legend">{salesByCategory.map(item => <span key={item.name}><i style={{ background: item.color }} />{item.name}<b>{item.value}%</b></span>)}</div>
      </ChartCard>
    </div>

    <ChartCard title="Top products" description="Best performers by gross revenue" className="products-chart-card">
      <div className="products-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={topProducts} margin={{ top: 8, right: 12, left: 0, bottom: 30 }}>
        <CartesianGrid vertical={false} stroke="rgba(241,240,235,.1)" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A68D77', fontSize: 8 }} angle={-22} textAnchor="end" interval={0} height={48} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A68D77', fontSize: 9 }} tickFormatter={shortMoney} width={42} />
        <Tooltip content={<TooltipContent />} cursor={{ fill: 'rgba(148,107,46,.1)' }} />
        <Bar dataKey="revenue" name="Revenue" fill={chartColors.gold} radius={[5, 5, 0, 0]} barSize={28} isAnimationActive animationDuration={1100} animationEasing="ease-out" />
      </BarChart></ResponsiveContainer></div>
    </ChartCard>

    <section className="panel orders-panel">
      <div className="panel-heading"><div><p className="eyebrow">LATEST ACTIVITY</p><h2>Recent orders</h2><p>A quick look at the latest customer activity.</p></div><span className="live-tag"><i /> {orders.length} orders</span></div>
      <DataTable rows={orders} columns={orderColumns} search={search} searchFields={['id', 'customer', 'email', 'product', 'category', 'status']} filterKey="status" filters={['Paid', 'Pending', 'Refunded', 'Cancelled'] satisfies OrderStatus[]} onRowClick={onSelectOrder} rowId={row => row.id} pageSize={6} />
    </section>

    <section className="lower-grid">
      <section className="panel activity-panel">
        <div className="panel-heading"><div><h2>Recent activity</h2><p>A little movement every day.</p></div></div>
        <div className="activity-list">{recentActivity.map(item => <motion.article key={item.id} className="activity-item" initial={{ opacity: 0, x: -7 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .22, delay: Number(item.id.slice(-1)) * .055 }}>
          <span className={`activity-node node-${item.color}`} /><div><b>{item.title}</b><p>{item.description}</p><small><Clock3 size={12} /> {item.time}</small></div>
        </motion.article>)}</div>
      </section>
      <NotificationPanel notifications={notifications} onRead={onReadNotification} onDismiss={onDismissNotification} />
    </section>

    <ProjectSubmissions rows={submissions} onStatusChange={onSubmissionStatusChange} onRefresh={onRefreshSubmissions} />
  </motion.div>;
}
