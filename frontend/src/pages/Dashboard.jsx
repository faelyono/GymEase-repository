import { useState } from 'react';
import { Users, Dumbbell, CalendarDays, ClipboardList, CheckCircle, BarChart3, LogIn, LogOut, Eye, EyeOff } from 'lucide-react';
import mascotImg from '../assets/faelfaelfile.png';
import mascotImg2 from '../assets/faelnaatu.png';

const navItems = [
  { label: 'Profile', icon: Users, color: '#2F4BF5', path: '/profile' },
  { label: 'Trainers', icon: Dumbbell, color: '#4A8FFF', path: '/trainers' },
  { label: 'Classes', icon: CalendarDays, color: '#3219AB', path: '/classes' },
  { label: 'Bookings', icon: ClipboardList, color: '#2F4BF5', path: '/bookings' },
  { label: 'Attendance', icon: CheckCircle, color: '#4A8FFF', path: '/attendance' },
  { label: 'Analytics', icon: BarChart3, color: '#3219AB', path: '/analytics' },
];

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API = `${BASE}/api/auth`;

export default function Dashboard({ onLogin, isLoggedIn, onLogout }) {
  const [showModal, setShowModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regForm, setRegForm] = useState({ fullname: '', email: '', password: '', phone: '', plan_type: '', membership_expiry: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Login failed'); return; }
      localStorage.setItem('gymease_token', data.token);
      onLogin(data.token);
    } catch (err) {
      setError('backend is not running, turn it on first');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); return; }
      setIsRegister(false);
      setEmail(regForm.email);
      setError('');
    } catch (err) {
      setError('backend is not running, turn it on first');
    } finally {
      setLoading(false);
    }
  };

  const radius = 180;
  const centerX = 250;
  const centerY = 250;

  const getPosition = (index, total) => {
    const angle = ((2 * Math.PI) / total) * index - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const positions = navItems.map((_, i) => getPosition(i, navItems.length));
  const inputClass = "px-4 py-2.5 bg-ocean-50 border border-ocean-200 rounded-lg text-ocean-950 placeholder-ocean-700 focus:outline-none focus:border-ocean-900 w-full";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ocean-50 relative overflow-hidden">
      {/* background glow thing */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-ocean-200/40 blur-3xl pointer-events-none" />

      {/* title */}
      <h1 className="text-5xl font-bold text-ocean-950 mb-4 z-10 tracking-tight italic">
        Gym<span className="text-ocean-400">Ease</span>
      </h1>
      <p className="text-ocean-900 text-lg mb-12 z-10">Manage your gym, effortlessly.</p>

      {/* the circle nav thingy */}
      <div className="relative z-10" style={{ width: centerX * 2, height: centerY * 2 }}>
        {/* svg circle connecting the icons */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${centerX * 2} ${centerY * 2}`}
        >
          <circle
            cx={centerX} cy={centerY} r={radius}
            fill="none" stroke="#8DC8FF" strokeWidth="1.5"
          />
          <circle
            cx={centerX} cy={centerY} r={radius * 0.55}
            fill="none" stroke="#8DC8FF" strokeWidth="0.8"
            strokeDasharray="6,6" opacity="0.4"
          />
        </svg>

        {/* login or logout button in the middle */}
        {!isLoggedIn ? (
          <button
            onClick={() => setShowModal(true)}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ left: centerX, top: centerY }}
          >
            <div className="w-28 h-28 rounded-full bg-white border-2 border-ocean-900 flex flex-col items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300">
              <LogIn size={28} className="text-ocean-900 mb-1" />
              <span className="text-sm font-bold text-ocean-950">Login</span>
            </div>
          </button>
        ) : (
          <button
            onClick={onLogout}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ left: centerX, top: centerY }}
          >
            <div className="w-28 h-28 rounded-full bg-white border-2 border-red-400 flex flex-col items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300">
              <LogOut size={28} className="text-red-500 mb-1" />
              <span className="text-sm font-bold text-red-600">Logout</span>
            </div>
          </button>
        )}

        {navItems.map((item, i) => {
          const pos = positions[i];
          const Icon = item.icon;
          const Wrapper = isLoggedIn ? 'a' : 'div';
          const wrapperProps = isLoggedIn ? { href: item.path } : {};
          return (
            <Wrapper
              key={item.label}
              {...wrapperProps}
              className={`absolute -translate-x-1/2 -translate-y-1/2 group ${isLoggedIn ? 'cursor-pointer' : ''}`}
              style={{ left: pos.x, top: pos.y, textDecoration: 'none' }}
            >
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isLoggedIn ? 'group-hover:scale-110 group-hover:shadow-2xl' : ''}`}
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${item.color}22, #BFE0FF)`,
                  borderColor: item.color,
                  boxShadow: `0 0 20px ${item.color}33`,
                }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle at 40% 40%, ${item.color}, #3219AB)`,
                    boxShadow: `inset 0 -2px 8px rgba(0,0,0,0.2), 0 0 15px ${item.color}44`,
                  }}
                >
                  <Icon size={28} className="text-ocean-100 drop-shadow-md" />
                </div>
              </div>
              <span className="block mt-2 text-sm font-medium text-ocean-950 text-center">
                {item.label}
              </span>
            </Wrapper>
          );
        })}
      </div>

      {/* login popup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button onClick={() => { setShowModal(false); setError(''); }} className="absolute top-4 right-4 text-ocean-700 hover:text-ocean-950 cursor-pointer text-xl font-bold">
              ✕
            </button>

            {!isRegister ? (
              <>
                <h2 className="text-2xl font-bold text-ocean-950 mb-2">Welcome</h2>
                <p className="text-ocean-700 text-sm mb-6">Sign in to access GymEase</p>
                {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg mb-4">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="relative">
                    {email && <img src={mascotImg} alt="" className="absolute right-0 bottom-0 h-36 object-contain pointer-events-none z-10" />}
                    <label className="block text-sm font-medium text-ocean-700 mb-1">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} placeholder="your@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ocean-700 mb-1">Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className={`${inputClass} pr-10`} placeholder="••••••••" />
                      {password && !showPassword && <img src={mascotImg2} alt="" className="absolute left-0 top-0 h-full object-cover rounded-lg pointer-events-none z-10" style={{ width: 'calc(100% - 40px)' }} />}
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ocean-700 hover:text-ocean-950 cursor-pointer z-20">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full px-6 py-2.5 bg-ocean-900 hover:bg-ocean-950 text-white font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50">
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
                <p className="text-center mt-4 text-sm text-ocean-700">
                  Don't have an account?{' '}
                  <button onClick={() => { setIsRegister(true); setError(''); }} className="text-ocean-900 font-semibold hover:underline cursor-pointer">Register</button>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-ocean-950 mb-2">Create Account</h2>
                <p className="text-ocean-700 text-sm mb-6">Register for a GymEase membership</p>
                {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg mb-4">{error}</p>}
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-ocean-700 mb-1">Full Name</label>
                      <input type="text" value={regForm.fullname} onChange={e => setRegForm({...regForm, fullname: e.target.value})} required className={inputClass} placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ocean-700 mb-1">Email</label>
                      <input type="email" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} required className={inputClass} placeholder="john@email.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ocean-700 mb-1">Password</label>
                      <input type="password" value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} required className={inputClass} placeholder="••••••••" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ocean-700 mb-1">Phone</label>
                      <input type="tel" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} className={inputClass} placeholder="08123456789" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ocean-700 mb-1">Plan</label>
                      <select value={regForm.plan_type} onChange={e => setRegForm({...regForm, plan_type: e.target.value})} className={inputClass}>
                        <option value="">Select</option>
                        <option value="Basic">Basic</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ocean-700 mb-1">Expiry</label>
                      <input type="date" value={regForm.membership_expiry} onChange={e => setRegForm({...regForm, membership_expiry: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full px-6 py-2.5 bg-ocean-900 hover:bg-ocean-950 text-white font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50">
                    {loading ? 'Registering...' : 'Create Account'}
                  </button>
                </form>
                <p className="text-center mt-4 text-sm text-ocean-700">
                  Already have an account?{' '}
                  <button onClick={() => { setIsRegister(false); setError(''); }} className="text-ocean-900 font-semibold hover:underline cursor-pointer">Sign In</button>
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
