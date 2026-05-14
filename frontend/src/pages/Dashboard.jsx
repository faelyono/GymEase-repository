import { useNavigate } from 'react-router-dom';
import { Users, Dumbbell, CalendarDays, ClipboardList, CheckCircle } from 'lucide-react';

const navItems = [
  { label: 'Members', icon: Users, path: '/members', color: '#0077B6' },
  { label: 'Trainers', icon: Dumbbell, path: '/trainers', color: '#0096C7' },
  { label: 'Classes', icon: CalendarDays, path: '/classes', color: '#00B4D8' },
  { label: 'Bookings', icon: ClipboardList, path: '/bookings', color: '#48CAE4' },
  { label: 'Attendance', icon: CheckCircle, path: '/attendance', color: '#90E0EF' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const radius = 180;
  const centerX = 250;
  const centerY = 250;

  // 5 items evenly spaced in a circle, starting from the top (-90°)
  const getPosition = (index, total) => {
    const angle = ((2 * Math.PI) / total) * index - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const positions = navItems.map((_, i) => getPosition(i, navItems.length));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ocean-950 relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-ocean-900/40 blur-3xl pointer-events-none" />

      {/* Title */}
      <h1 className="text-5xl font-bold text-ocean-100 mb-4 z-10 tracking-tight italic">
        Gym<span className="text-ocean-400">Ease</span>
      </h1>
      <p className="text-ocean-300 text-lg mb-12 z-10">Manage your gym, effortlessly.</p>

      {/* Circle navigation ring */}
      <div className="relative z-10" style={{ width: centerX * 2, height: centerY * 2 }}>
        {/* SVG connecting lines between adjacent circles */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${centerX * 2} ${centerY * 2}`}
        >
          {positions.map((pos, i) => {
            const next = positions[(i + 1) % positions.length];
            return (
              <line
                key={i}
                x1={pos.x} y1={pos.y}
                x2={next.x} y2={next.y}
                stroke="#023E8A"
                strokeWidth="1.5"
              />
            );
          })}
          {/* Dashed inner ring for visual effect */}
          <circle
            cx={centerX} cy={centerY} r={radius * 0.55}
            fill="none" stroke="#023E8A" strokeWidth="0.8"
            strokeDasharray="6,6" opacity="0.4"
          />
        </svg>

        {navItems.map((item, i) => {
          const pos = positions[i];
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ left: pos.x, top: pos.y }}
            >
              {/* Outer glow ring */}
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl border-2"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${item.color}33, #023E8A)`,
                  borderColor: item.color,
                  boxShadow: `0 0 20px ${item.color}22`,
                }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:shadow-lg"
                  style={{
                    background: `radial-gradient(circle at 40% 40%, ${item.color}, #023E8A)`,
                    boxShadow: `inset 0 -2px 8px rgba(0,0,0,0.3), 0 0 15px ${item.color}44`,
                  }}
                >
                  <Icon size={28} className="text-ocean-100 drop-shadow-md" />
                </div>
              </div>
              {/* Label */}
              <span className="block mt-2 text-sm font-medium text-ocean-300 group-hover:text-ocean-100 transition-colors text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
