export type OrderStatus = 'Paid' | 'Pending' | 'Refunded' | 'Cancelled';
export type Order = {
  id: string;
  customer: string;
  email: string;
  product: string;
  category: string;
  amount: number;
  status: OrderStatus;
  date: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Educator' | 'Builder';
  status: 'Active' | 'Invited' | 'Inactive';
  joined: string;
  spent: number;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  status: 'Active' | 'Draft';
};

export type AdminNotification = {
  id: string;
  title: string;
  detail: string;
  time: string;
  read: boolean;
  kind: 'order' | 'user' | 'system';
};

export const chartColors = {
  gold: '#946B2E',
  taupe: '#A68D77',
  forest: '#24412F',
  ivory: '#F1F0EB'
} as const;

export const metricData = [
  { label: 'Total revenue', value: 48290, prefix: '$', suffix: '', trend: 12.8, color: chartColors.gold, series: [12, 16, 13, 20, 17, 26, 22, 31] },
  { label: 'Active users', value: 2847, prefix: '', suffix: '', trend: 8.2, color: chartColors.taupe, series: [14, 17, 15, 20, 24, 21, 28, 33] },
  { label: 'Total orders', value: 1364, prefix: '', suffix: '', trend: 4.6, color: chartColors.ivory, series: [11, 14, 12, 19, 16, 24, 21, 27] },
  { label: 'Conversion rate', value: 4.82, prefix: '', suffix: '%', trend: 1.4, color: chartColors.gold, series: [10, 12, 11, 16, 14, 20, 19, 24] }
];

export const revenueByRange = {
  '7D': [
    { label: 'Mon', revenue: 4820, previous: 4100 },
    { label: 'Tue', revenue: 5310, previous: 4520 },
    { label: 'Wed', revenue: 4670, previous: 4380 },
    { label: 'Thu', revenue: 6490, previous: 5020 },
    { label: 'Fri', revenue: 5980, previous: 5210 },
    { label: 'Sat', revenue: 7230, previous: 6120 },
    { label: 'Sun', revenue: 6810, previous: 5840 }
  ],
  '30D': [
    { label: 'Oct 07', revenue: 3920, previous: 3410 }, { label: 'Oct 10', revenue: 4810, previous: 3970 },
    { label: 'Oct 13', revenue: 4350, previous: 3820 }, { label: 'Oct 16', revenue: 5590, previous: 4460 },
    { label: 'Oct 19', revenue: 5020, previous: 4290 }, { label: 'Oct 22', revenue: 6480, previous: 5110 },
    { label: 'Oct 25', revenue: 5870, previous: 4920 }, { label: 'Oct 28', revenue: 7310, previous: 5840 },
    { label: 'Oct 31', revenue: 6890, previous: 6030 }, { label: 'Nov 05', revenue: 8240, previous: 6540 }
  ],
  '12M': [
    { label: 'Dec', revenue: 26400, previous: 21100 }, { label: 'Jan', revenue: 28900, previous: 22600 },
    { label: 'Feb', revenue: 31800, previous: 24800 }, { label: 'Mar', revenue: 30200, previous: 26700 },
    { label: 'Apr', revenue: 35400, previous: 28100 }, { label: 'May', revenue: 38600, previous: 30500 },
    { label: 'Jun', revenue: 36200, previous: 32400 }, { label: 'Jul', revenue: 41900, previous: 33700 },
    { label: 'Aug', revenue: 43800, previous: 35900 }, { label: 'Sep', revenue: 40700, previous: 37100 },
    { label: 'Oct', revenue: 46100, previous: 38900 }, { label: 'Nov', revenue: 48290, previous: 41200 }
  ]
} as const;

export const topProducts = [
  { name: 'React Starter Kit', revenue: 12480, units: 312 },
  { name: 'UI Component Library', revenue: 9870, units: 246 },
  { name: 'Project Planner', revenue: 8340, units: 208 },
  { name: 'Portfolio Blueprint', revenue: 6710, units: 168 },
  { name: 'API Workshop', revenue: 5290, units: 132 }
];

export const salesByCategory = [
  { name: 'Templates', value: 38, revenue: 18350, color: chartColors.gold },
  { name: 'Courses', value: 27, revenue: 13032, color: chartColors.taupe },
  { name: 'Components', value: 21, revenue: 10141, color: chartColors.forest },
  { name: 'Tools', value: 14, revenue: 6767, color: chartColors.ivory }
];

export const initialOrders: Order[] = [
  { id: 'PH-2841', customer: 'Olivia Rhye', email: 'olivia.rhye@email.com', product: 'React Starter Kit', category: 'Templates', amount: 89, status: 'Paid', date: '2026-11-05T10:42:00' },
  { id: 'PH-2840', customer: 'Phoenix Baker', email: 'phoenix.baker@email.com', product: 'UI Component Library', category: 'Components', amount: 129, status: 'Paid', date: '2026-11-05T09:18:00' },
  { id: 'PH-2839', customer: 'Lana Steiner', email: 'lana.steiner@email.com', product: 'Project Planner', category: 'Tools', amount: 59, status: 'Pending', date: '2026-11-04T16:03:00' },
  { id: 'PH-2838', customer: 'Demi Wilkinson', email: 'demi.wilkinson@email.com', product: 'Portfolio Blueprint', category: 'Templates', amount: 49, status: 'Paid', date: '2026-11-04T13:55:00' },
  { id: 'PH-2837', customer: 'Candice Wu', email: 'candice.wu@email.com', product: 'API Workshop', category: 'Courses', amount: 149, status: 'Paid', date: '2026-11-04T10:11:00' },
  { id: 'PH-2836', customer: 'Natali Craig', email: 'natali.craig@email.com', product: 'React Starter Kit', category: 'Templates', amount: 89, status: 'Refunded', date: '2026-11-03T17:28:00' },
  { id: 'PH-2835', customer: 'Drew Cano', email: 'drew.cano@email.com', product: 'UI Component Library', category: 'Components', amount: 129, status: 'Paid', date: '2026-11-03T14:42:00' },
  { id: 'PH-2834', customer: 'Andi Lane', email: 'andi.lane@email.com', product: 'Project Planner', category: 'Tools', amount: 59, status: 'Paid', date: '2026-11-03T11:06:00' },
  { id: 'PH-2833', customer: 'Kate Morrison', email: 'kate.morrison@email.com', product: 'API Workshop', category: 'Courses', amount: 149, status: 'Pending', date: '2026-11-02T15:40:00' },
  { id: 'PH-2832', customer: 'Jared Dunn', email: 'jared.dunn@email.com', product: 'Portfolio Blueprint', category: 'Templates', amount: 49, status: 'Paid', date: '2026-11-02T09:23:00' },
  { id: 'PH-2831', customer: 'Kylie Fisher', email: 'kylie.fisher@email.com', product: 'API Workshop', category: 'Courses', amount: 149, status: 'Cancelled', date: '2026-11-01T12:19:00' },
  { id: 'PH-2830', customer: 'Rory Howard', email: 'rory.howard@email.com', product: 'React Starter Kit', category: 'Templates', amount: 89, status: 'Paid', date: '2026-10-31T08:54:00' }
];

export const initialUsers: Customer[] = [
  { id: 'U-1084', name: 'Olivia Rhye', email: 'olivia.rhye@email.com', role: 'Builder', status: 'Active', joined: '2026-08-14', spent: 438 },
  { id: 'U-1083', name: 'Phoenix Baker', email: 'phoenix.baker@email.com', role: 'Educator', status: 'Active', joined: '2026-08-11', spent: 295 },
  { id: 'U-1082', name: 'Lana Steiner', email: 'lana.steiner@email.com', role: 'Student', status: 'Active', joined: '2026-08-07', spent: 184 },
  { id: 'U-1081', name: 'Demi Wilkinson', email: 'demi.wilkinson@email.com', role: 'Builder', status: 'Active', joined: '2026-08-05', spent: 527 },
  { id: 'U-1080', name: 'Candice Wu', email: 'candice.wu@email.com', role: 'Educator', status: 'Invited', joined: '2026-08-02', spent: 149 },
  { id: 'U-1079', name: 'Natali Craig', email: 'natali.craig@email.com', role: 'Student', status: 'Active', joined: '2026-07-28', spent: 267 },
  { id: 'U-1078', name: 'Drew Cano', email: 'drew.cano@email.com', role: 'Builder', status: 'Inactive', joined: '2026-07-21', spent: 129 },
  { id: 'U-1077', name: 'Andi Lane', email: 'andi.lane@email.com', role: 'Student', status: 'Active', joined: '2026-07-18', spent: 352 },
  { id: 'U-1076', name: 'Kate Morrison', email: 'kate.morrison@email.com', role: 'Educator', status: 'Active', joined: '2026-07-11', spent: 610 },
  { id: 'U-1075', name: 'Jared Dunn', email: 'jared.dunn@email.com', role: 'Builder', status: 'Active', joined: '2026-07-04', spent: 205 }
];

export const initialProducts: Product[] = [
  { id: 'P-042', name: 'React Starter Kit', category: 'Templates', price: 89, stock: 128, sold: 312, status: 'Active' },
  { id: 'P-041', name: 'UI Component Library', category: 'Components', price: 129, stock: 84, sold: 246, status: 'Active' },
  { id: 'P-040', name: 'Project Planner', category: 'Tools', price: 59, stock: 230, sold: 208, status: 'Active' },
  { id: 'P-039', name: 'Portfolio Blueprint', category: 'Templates', price: 49, stock: 196, sold: 168, status: 'Active' },
  { id: 'P-038', name: 'API Workshop', category: 'Courses', price: 149, stock: 57, sold: 132, status: 'Active' },
  { id: 'P-037', name: 'Design Systems 101', category: 'Courses', price: 99, stock: 0, sold: 96, status: 'Draft' },
  { id: 'P-036', name: 'Icon Pack Vol. 2', category: 'Components', price: 29, stock: 540, sold: 421, status: 'Active' },
  { id: 'P-035', name: 'Launch Checklist', category: 'Tools', price: 19, stock: 310, sold: 184, status: 'Active' }
];

export const initialNotifications: AdminNotification[] = [
  { id: 'N-1', title: 'New order received', detail: 'Olivia Rhye placed order PH-2841 for $89.00.', time: '8 min ago', read: false, kind: 'order' },
  { id: 'N-2', title: 'New community member', detail: 'A new builder joined ProjectHub today.', time: '36 min ago', read: false, kind: 'user' },
  { id: 'N-3', title: 'Product stock is low', detail: 'API Workshop has 57 seats remaining.', time: '2 hours ago', read: false, kind: 'system' },
  { id: 'N-4', title: 'Weekly report is ready', detail: 'Your October performance summary is available.', time: 'Yesterday', read: true, kind: 'system' }
];

export const recentActivity = [
  { id: 'A-1', title: 'New order placed', description: 'Olivia Rhye purchased React Starter Kit', time: '8 min ago', color: 'cyan' },
  { id: 'A-2', title: 'New member joined', description: 'Welcome Phoenix Baker to the community', time: '36 min ago', color: 'purple' },
  { id: 'A-3', title: 'Product updated', description: 'UI Component Library v2.4 was published', time: '2 hours ago', color: 'lime' },
  { id: 'A-4', title: 'Refund processed', description: 'Order PH-2836 was refunded successfully', time: 'Yesterday', color: 'blue' }
];
