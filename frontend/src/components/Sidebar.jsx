import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, FileText, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/data-audit', label: 'Data audit', icon: ClipboardList },
  { to: '/documents', label: 'Documents', icon: FileText },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside
      className="w-64 shrink-0 flex flex-col h-screen sticky top-0 px-5 py-6"
      style={{ backgroundColor: 'var(--color-ink)' }}
    >
      <div className="flex items-center gap-2 px-2 mb-10">
        <ShieldCheck size={26} strokeWidth={1.75} color="var(--color-brass-light)" />
        <span className="font-display text-xl text-white tracking-tight">DataShield</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 pt-4 mt-4">
        <p className="px-3 text-sm text-white truncate">{user?.name}</p>
        <p className="px-3 text-xs text-white/50 truncate mb-3">{user?.email}</p>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white transition-colors w-full rounded-lg hover:bg-white/5"
        >
          <LogOut size={16} strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
