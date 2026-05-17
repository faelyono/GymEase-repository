import { Outlet, NavLink, Link } from 'react-router-dom';
import { Users, Dumbbell, CalendarDays, ClipboardList, CheckCircle, BarChart3, LogOut } from 'lucide-react';

const tabs = [
  { to: '/profile', label: 'Profile', icon: Users },
  { to: '/trainers', label: 'Trainers', icon: Dumbbell },
  { to: '/classes', label: 'Classes', icon: CalendarDays },
  { to: '/bookings', label: 'Bookings', icon: ClipboardList },
  { to: '/attendance', label: 'Attendance', icon: CheckCircle },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Layout({ onLogout }) {
  return (
    <div className="min-h-screen bg-ocean-50">
      {/* top nav bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-ocean-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex items-center h-16">
          {/* logo */}
          <Link to="/" className="text-xl font-bold text-ocean-950 tracking-tight mr-10 hover:opacity-80 transition-opacity">
            Gym<span className="text-ocean-400">Ease</span>
          </Link>

          {/* nav links */}
          <nav className="flex items-center gap-1">
            {tabs.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-ocean-900 text-white shadow-sm'
                      : 'text-ocean-950 hover:bg-ocean-100'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* logout */}
          <button
            onClick={onLogout}
            className="ml-auto flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      {/* main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
