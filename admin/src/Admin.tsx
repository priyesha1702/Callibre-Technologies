import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight, Bell, Check, ChevronDown, LogOut, Menu, Moon, Search, Settings,
  ShieldCheck, Sun, X
} from 'lucide-react';
import { createClient, Session } from '@supabase/supabase-js';
import {
  BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate
} from 'react-router-dom';
import { Dropdown, Modal, SkeletonPage } from './components/shared';
import { Sidebar } from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import {
  AnalyticsPage, NotificationsPage, OrdersPage, ProductsPage, ReportsPage,
  SettingsPage, UsersPage
} from './pages/ManagementPages';
import {
  AdminNotification, Customer, initialNotifications, initialOrders, initialProducts,
  initialUsers, Order, Product
} from './data/sampleData';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './supabase-config';

type Notice = { kind: 'success' | 'error'; text: string };
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

const isConfigured = String(SUPABASE_URL) !== 'https://YOUR_PROJECT_ID.supabase.co'
  && String(SUPABASE_ANON_KEY) !== 'YOUR_SUPABASE_ANON_KEY';
const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/analytics': 'Analytics',
  '/users': 'Users',
  '/orders': 'Orders',
  '/products': 'Products',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
  '/settings': 'Settings'
};

function LoginPage({ notice, setNotice }: { notice: Notice | null; setNotice: (notice: Notice | null) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setNotice(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setNotice({ kind: 'error', text: `Sign in failed: ${error.message}` });
      return;
    }
    if (data.user.app_metadata.role !== 'admin') {
      await supabase.auth.signOut();
      setNotice({ kind: 'error', text: 'This account does not have administrator access.' });
      return;
    }
    setPassword('');
    navigate(location.state?.from?.pathname ?? '/', { replace: true });
  }

  return <main className="login-screen">
    <div className="login-glow login-glow-one" /><div className="login-glow login-glow-two" />
    <a className="admin-brand" href="/"><span>✳</span> ProjectHub</a>
    <form className="login-card" onSubmit={signIn}>
      <div className="login-icon"><ShieldCheck size={23} /></div><p className="eyebrow">SECURE WORKSPACE</p><h1>Welcome back.</h1>
      <p className="login-copy">Sign in with your ProjectHub administrator account to open your workspace.</p>
      {!isConfigured && <div className="notice error">Supabase is not configured in the website connection settings.</div>}
      {notice && <div className={`notice ${notice.kind}`}>{notice.text}</div>}
      <label>Email address<input type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} placeholder="admin@example.com" /></label>
      <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} placeholder="Your password" /></label>
      <button className="button button-primary login-submit" disabled={!isConfigured || busy}>{busy ? 'Signing in…' : 'Sign in'}<ArrowUpRight size={17} /></button>
      <a className="back-home" href="/">← Back to ProjectHub</a>
    </form>
    <span className="login-foot"><ShieldCheck size={14} /> Protected by ProjectHub access policies</span>
  </main>;
}

function TopBar({ email, search, onSearch, notifications, onRead, onDismiss, theme, onThemeToggle, onSignOut, onMobileMenu, profileName }: {
  email: string;
  search: string;
  onSearch: (value: string) => void;
  notifications: AdminNotification[];
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  onSignOut: () => void;
  onMobileMenu: () => void;
  profileName: string;
}) {
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);
  const unread = notifications.filter(item => !item.read).length;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return <header className="app-topbar">
    <button className="mobile-menu-button" onClick={onMobileMenu} aria-label="Open navigation"><Menu size={19} /></button>
    <div className="breadcrumbs">Workspace <span>/</span> <b>{pageTitles[location.pathname] ?? 'Dashboard'}</b></div>
    <div className="topbar-actions">
      <label className="global-search"><Search size={16} /><input ref={searchRef} value={search} onChange={event => onSearch(event.target.value)} placeholder="Search anything…" aria-label="Search current data" /><kbd>⌘ K</kbd>{search && <button aria-label="Clear search" onClick={() => onSearch('')}><X size={13} /></button>}</label>
      <Dropdown label={`Notifications${unread ? `, ${unread} unread` : ''}`} trigger={<span className="topbar-icon"><Bell size={18} />{unread > 0 && <i className="notification-badge">{unread}</i>}</span>}>
        <div className="dropdown-heading"><div><b>Notifications</b><small>{unread ? `${unread} unread updates` : 'You’re all caught up'}</small></div><Link to="/notifications" data-close-dropdown>View all</Link></div>
        <div className="dropdown-notifications">
          <AnimatePresence initial={false}>{notifications.slice(0, 4).map(item => <motion.article key={item.id} className={`dropdown-notification ${item.read ? 'is-read' : ''}`} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}><button onClick={() => onRead(item.id)}><i className={`notification-dot dot-${item.kind}`} /><span><b>{item.title}</b><small>{item.detail}</small><em>{item.time}</em></span></button><button className="mini-dismiss" aria-label="Dismiss notification" onClick={() => onDismiss(item.id)}>×</button></motion.article>)}</AnimatePresence>
          {notifications.length === 0 && <p className="dropdown-empty">No notifications to show.</p>}
        </div>
        {unread > 0 && <button className="dropdown-footer-button" onClick={() => notifications.filter(item => !item.read).forEach(item => onRead(item.id))}>Mark all as read</button>}
      </Dropdown>
      <button className="theme-toggle-button" onClick={onThemeToggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button>
      <Dropdown label="Profile menu" trigger={<span className="top-profile-avatar">{(email[0] ?? 'A').toUpperCase()}</span>}>
        <div className="profile-dropdown-head"><span className="top-profile-avatar">{(email[0] ?? 'A').toUpperCase()}</span><div><b>{profileName || email.split('@')[0]}</b><small>{email}</small></div></div>
        <Link className="profile-menu-link" to="/settings" data-close-dropdown><Settings size={15} /> Preferences</Link>
        <button className="profile-menu-link signout-link" onClick={onSignOut}><LogOut size={15} /> Sign out</button>
      </Dropdown>
    </div>
  </header>;
}

function AdminShell({ session, onSignOut, notifications, setNotifications, orders, setOrders, users, setUsers, products, setProducts, theme, setTheme, profileName, setProfileName, notice, setNotice }: {
  session: Session;
  onSignOut: () => void;
  notifications: AdminNotification[];
  setNotifications: (update: (current: AdminNotification[]) => AdminNotification[]) => void;
  orders: Order[];
  setOrders: (update: (current: Order[]) => Order[]) => void;
  users: Customer[];
  setUsers: (update: (current: Customer[]) => Customer[]) => void;
  products: Product[];
  setProducts: (update: (current: Product[]) => Product[]) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  profileName: string;
  setProfileName: (name: string) => void;
  notice: Notice | null;
  setNotice: (notice: Notice | null) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const unreadCount = notifications.filter(item => !item.read).length;

  const readNotification = (id: string) => setNotifications(current => current.map(item => item.id === id ? { ...item, read: true } : item));
  const dismissNotification = (id: string) => setNotifications(current => current.filter(item => item.id !== id));
  const refreshSubmissions = useCallback(async () => {
    if (!supabase) {
      setNotice({ kind: 'error', text: 'Supabase is not configured. Project submissions are unavailable.' });
      return;
    }
    setSubmissionsLoading(true);
    const { data: rows, error } = await supabase.from('project_submissions')
      .select('id,title,description,modules,roles,project_type,status,created_at')
      .order('created_at', { ascending: false });
    if (error) {
      setNotice({ kind: 'error', text: `Could not load community submissions: ${error.message}` });
      setSubmissionsLoading(false);
      return;
    }
    if (!rows.length) {
      setSubmissions([]);
      setSubmissionsLoading(false);
      return;
    }
    const { data: contacts, error: contactError } = await supabase.from('submission_contacts')
      .select('submission_id,client_name,client_email,client_phone')
      .in('submission_id', rows.map(row => row.id));
    if (contactError) {
      setNotice({ kind: 'error', text: `Could not load client contact information: ${contactError.message}` });
      setSubmissionsLoading(false);
      return;
    }
    const contactById = new Map((contacts ?? []).map(contact => [contact.submission_id, contact]));
    const mapped: ProjectSubmission[] = [];
    for (const row of rows) {
      const contact = contactById.get(row.id);
      if (contact) mapped.push({ ...row, contact });
    }
    setSubmissions(mapped);
    if (mapped.length !== rows.length) setNotice({ kind: 'error', text: 'Some submissions have no matching contact information and were omitted.' });
    setSubmissionsLoading(false);
  }, [setNotice]);

  useEffect(() => { void refreshSubmissions(); }, [refreshSubmissions]);

  async function updateSubmissionStatus(id: string, status: string) {
    if (!supabase) return;
    const { error } = await supabase.from('project_submissions').update({ status }).eq('id', id);
    if (error) {
      setNotice({ kind: 'error', text: `Could not update submission status: ${error.message}` });
      return;
    }
    setSubmissions(current => current.map(item => item.id === id ? { ...item, status } : item));
    setNotice({ kind: 'success', text: 'Submission status updated.' });
  }

  const routeContent = useMemo(() => <Routes location={location}>
    <Route path="/" element={<DashboardPage search={search} orders={orders} onSelectOrder={setSelectedOrder} notifications={notifications} onReadNotification={readNotification} onDismissNotification={dismissNotification} submissions={submissions} onSubmissionStatusChange={updateSubmissionStatus} onRefreshSubmissions={() => { setSubmissionsLoading(true); void refreshSubmissions(); }} />} />
    <Route path="/analytics" element={<AnalyticsPage />} />
    <Route path="/users" element={<UsersPage users={users} onAdd={user => setUsers(current => [user, ...current])} search={search} />} />
    <Route path="/orders" element={<OrdersPage orders={orders} onSelect={setSelectedOrder} search={search} />} />
    <Route path="/products" element={<ProductsPage products={products} onToggle={id => setProducts(current => current.map(product => product.id === id ? { ...product, status: product.status === 'Active' ? 'Draft' : 'Active' } : product))} onAdd={product => setProducts(current => [product, ...current])} search={search} />} />
    <Route path="/reports" element={<ReportsPage orders={orders} users={users} products={products} />} />
    <Route path="/notifications" element={<NotificationsPage notifications={notifications} onRead={readNotification} onDismiss={dismissNotification} />} />
    <Route path="/settings" element={<SettingsPage theme={theme} onThemeChange={setTheme} profileName={profileName} onProfileNameChange={setProfileName} />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>, [location, search, orders, notifications, submissions, users, products, theme, profileName, refreshSubmissions, setUsers, setProducts]);

  useEffect(() => {
    const title = pageTitles[location.pathname] ?? 'Dashboard';
    document.title = `${title} · ProjectHub Admin`;
  }, [location.pathname]);

  return <div className="admin-app" data-theme={theme}>
    <div className="ambient ambient-cyan" /><div className="ambient ambient-purple" />
    <Sidebar mobileOpen={mobileSidebar} onMobileClose={() => setMobileSidebar(false)} unreadCount={unreadCount} email={session.user.email ?? 'admin'} />
    <div className="app-main">
      <TopBar email={session.user.email ?? 'admin'} search={search} onSearch={setSearch} notifications={notifications} onRead={readNotification} onDismiss={dismissNotification} theme={theme} onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} onSignOut={onSignOut} onMobileMenu={() => setMobileSidebar(true)} profileName={profileName} />
      <main className="route-content">
        {submissionsLoading && location.pathname === '/' && <span className="loading-inline" aria-live="polite">Syncing community submissions…</span>}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={location.pathname} className="route-motion" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }} transition={{ duration: .18 }}>{routeContent}</motion.div>
        </AnimatePresence>
      </main>
      <footer className="app-footer"><span>✳ ProjectHub Admin</span><span><ShieldCheck size={13} /> Client contact details protected by row-level security</span></footer>
    </div>
    <AnimatePresence>{notice && <motion.div className={`toast-notice ${notice.kind}`} initial={{ opacity: 0, y: 10, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }}><span>{notice.kind === 'success' ? <Check size={15} /> : <X size={15} />}{notice.text}</span><button aria-label="Dismiss notification" onClick={() => setNotice(null)}><X size={14} /></button></motion.div>}</AnimatePresence>
    <Modal open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} title="Order details">
      {selectedOrder && <div className="order-detail-modal"><p className="eyebrow">{selectedOrder.id} · {selectedOrder.category}</p><h3>{selectedOrder.product}</h3><div className="order-receipt"><div><span>Customer</span><b>{selectedOrder.customer}</b><small>{selectedOrder.email}</small></div><div><span>Order date</span><b>{new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeStyle: 'short' }).format(new Date(selectedOrder.date))}</b></div><div><span>Payment status</span><b><span className={`status-badge badge-${selectedOrder.status.toLowerCase()}`}><i />{selectedOrder.status}</span></b></div><div className="receipt-total"><span>Total paid</span><b>${selectedOrder.amount.toFixed(2)}</b></div></div><div className="modal-actions"><button className="button button-outline" onClick={() => setSelectedOrder(null)}>Close</button><button className="button button-primary" onClick={() => { setOrders(current => current.map(order => order.id === selectedOrder.id ? { ...order, status: 'Refunded' } : order)); setSelectedOrder(null); setNotice({ kind: 'success', text: `Order ${selectedOrder.id} marked as refunded in this demo.` }); }}>Mark as refunded</button></div></div>}
    </Modal>
  </div>;
}

function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [orders, setOrders] = useState(initialOrders);
  const [users, setUsers] = useState(initialUsers);
  const [products, setProducts] = useState(initialProducts);
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => localStorage.getItem('projecthub_admin_theme') === 'light' ? 'light' : 'dark');
  const [profileName, setProfileName] = useState(() => localStorage.getItem('projecthub_admin_profile') ?? '');
  const location = useLocation();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('projecthub_admin_theme', theme);
  }, [theme]);
  const setTheme = (nextTheme: 'dark' | 'light') => setThemeState(nextTheme);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setNotice({ kind: 'error', text: `Could not verify sign-in: ${error.message}` });
      if (data.session?.user.app_metadata.role === 'admin') setSession(data.session);
      else if (data.session) {
        void supabase.auth.signOut().then(() => setNotice({ kind: 'error', text: 'This account does not have administrator access.' }));
      }
      setAuthReady(true);
    }).catch(error => {
      if (!active) return;
      setNotice({ kind: 'error', text: `Could not verify sign-in: ${error.message}` });
      setAuthReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (nextSession?.user.app_metadata.role === 'admin') setSession(nextSession);
      else setSession(null);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    setLoadingDashboard(true);
    const timeout = window.setTimeout(() => setLoadingDashboard(false), 950);
    return () => window.clearTimeout(timeout);
  }, [session]);

  async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setNotice({ kind: 'error', text: `Could not sign out: ${error.message}` });
  }

  return <Routes>
    <Route path="/login" element={!authReady ? <div className="boot-screen"><div className="brand-mark">✳</div><span>Loading your workspace…</span></div> : session ? <Navigate to="/" replace /> : <LoginPage notice={notice} setNotice={setNotice} />} />
    <Route path="/*" element={!authReady ? <div className="boot-screen"><div className="brand-mark">✳</div><span>Loading your workspace…</span></div> : !session ? <Navigate to="/login" replace state={{ from: location }} /> : loadingDashboard ? <SkeletonPage /> :
      <AdminShell session={session} onSignOut={() => void signOut()} notifications={notifications} setNotifications={setNotifications} orders={orders} setOrders={setOrders} users={users} setUsers={setUsers} products={products} setProducts={setProducts} theme={theme} setTheme={setTheme} profileName={profileName} setProfileName={name => { setProfileName(name); localStorage.setItem('projecthub_admin_profile', name); }} notice={notice} setNotice={setNotice} />} />
  </Routes>;
}

export default function Admin() {
  return <BrowserRouter basename="/admin"><AdminApp /></BrowserRouter>;
}
