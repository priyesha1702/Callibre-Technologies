import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3, Bell, Boxes, ChevronLeft, ChevronRight, LayoutDashboard,
  LifeBuoy, Package, Settings, ShoppingBag, Users, FileBarChart
} from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/products', label: 'Products', icon: Boxes },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings }
];

export function Sidebar({ mobileOpen, onMobileClose, unreadCount, email }: {
  mobileOpen: boolean;
  onMobileClose: () => void;
  unreadCount: number;
  email: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return <>
    <AnimatePresence>
      {mobileOpen && <motion.button className="sidebar-backdrop" aria-label="Close navigation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onMobileClose} />}
    </AnimatePresence>
    <motion.aside className={`app-sidebar ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
      animate={{ width: collapsed ? 82 : 256 }}
      transition={{ type: 'spring', stiffness: 230, damping: 27 }}>
      <div className="sidebar-brand">
        <a className="brand-link" href="/"><span className="brand-symbol">✳</span><AnimatePresence initial={false}>{!collapsed && <motion.span className="brand-name" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: .16 }}>ProjectHub</motion.span>}</AnimatePresence></a>
        <button className="collapse-button desktop-only" onClick={() => setCollapsed(value => !value)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}</button>
        <button className="collapse-button mobile-only" onClick={onMobileClose} aria-label="Close navigation"><ChevronLeft size={16} /></button>
      </div>
      <div className="workspace-switch"><span className="workspace-icon">P</span><AnimatePresence initial={false}>{!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><b>ProjectHub</b><small>Workspace</small></motion.span>}</AnimatePresence></div>
      <p className="nav-section-label">{!collapsed ? 'WORKSPACE' : 'MENU'}</p>
      <nav className="primary-nav" aria-label="Main navigation">
        {links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} title={collapsed ? label : undefined} onClick={onMobileClose} className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
          {({ isActive }) => <>
            <motion.span className="nav-icon" whileHover={{ rotate: [-7, 7, 0], scale: 1.12 }} transition={{ duration: .24 }}><Icon size={18} strokeWidth={1.8} /></motion.span>
            <AnimatePresence initial={false}>{!collapsed && <motion.span className="nav-label" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: .14 }}>{label}</motion.span>}</AnimatePresence>
            {label === 'Notifications' && unreadCount > 0 && <span className="nav-unread">{unreadCount}</span>}
            {isActive && <motion.span className="nav-active-indicator" layoutId="sidebar-active" transition={{ type: 'spring', stiffness: 360, damping: 32 }} />}
          </>}
        </NavLink>)}
      </nav>
      <div className="sidebar-spacer" />
      {!collapsed && <motion.div className="sidebar-help" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <span className="help-glint"><LifeBuoy size={17} /></span><div><b>Need a hand?</b><small>We’re here to help</small></div><a href="mailto:support@projecthub.local" aria-label="Email ProjectHub support">↗</a>
      </motion.div>}
      <div className="sidebar-profile">
        <span className="profile-avatar">{(email[0] ?? 'A').toUpperCase()}</span>
        {!collapsed && <div className="profile-copy"><b>{email.split('@')[0]}</b><small>Administrator</small></div>}
      </div>
    </motion.aside>
  </>;
}
