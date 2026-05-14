import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Dumbbell, CalendarDays, ClipboardList, CheckCircle } from 'lucide-react';

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/members', label: 'Members', icon: Users },
  { to: '/trainers', label: 'Trainers', icon: Dumbbell },
  { to: '/classes', label: 'Classes', icon: CalendarDays },
  { to: '/bookings', label: 'Bookings', icon: ClipboardList },
  { to: '/attendance', label: 'Attendance', icon: CheckCircle },
];

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ocean-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-ocean-900/60 border-r border-ocean-700/30 flex flex-col fixed h-full">
        <div
          className="px-6 py-6 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <h2 className="text-2xl font-bold text-ocean-100 tracking-tight">
            Gym<span className="text-ocean-400">Ease</span>
          </h2>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-ocean-700/40 text-ocean-100 shadow-md'
                    : 'text-ocean-300 hover:bg-ocean-700/20 hover:text-ocean-100'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-ocean-700/30">
          <p className="text-xs text-ocean-400">GymEase v1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
