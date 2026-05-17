import { useState, useEffect } from 'react';
import { CheckCircle, Search, UserCheck, CalendarDays } from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_ATTENDANCE = `${BASE}/api/attendance`;
const API_BOOKINGS = `${BASE}/api/bookings`;

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_ATTENDANCE);
      const data = await res.json();
      if (data.success) setAttendance(data.data);
    } catch (err) {
      setError('cant reach the backend, make sure its running');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingBookings = async () => {
    try {
      const res = await fetch(`${API_BOOKINGS}?status=confirmed`);
      const data = await res.json();
      if (data.success) {
        // filter out already attended ones
        const attendedBookingIds = new Set(attendance.map(a => a.booking_id));
        setPendingBookings(data.data.filter(b => !attendedBookingIds.has(b.booking_id)));
      }
    } catch (err) { }
  };

  useEffect(() => { fetchAttendance(); }, []);

  // refetch pending when attendance changes
  useEffect(() => {
    fetchPendingBookings();
  }, [attendance]);

  const handleMarkPresent = async (bookingId) => {
    setError('');
    try {
      const res = await fetch(API_ATTENDANCE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId })
      });
      const data = await res.json();
      if (!data.success) {
        const msg = (data.message || '').toLowerCase();
        if (msg.includes('already') || msg.includes('duplicate') || msg.includes('exists')) {
          setError('attendance already marked for this booking');
        } else {
          setError(data.message || 'couldnt mark attendance');
        }
        return;
      }
      fetchAttendance();
    } catch (err) {
      setError('something went wrong, check your connection');
    }
  };

  const filtered = attendance.filter(a =>
    a.member_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.class_name?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDateTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      {/* header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ocean-950 flex items-center gap-3">
          <CheckCircle size={32} className="text-ocean-400" />
          Attendance
        </h1>
        <p className="text-ocean-700 mt-1">View attendance records and mark check-ins</p>
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg mb-4">{error}</p>}

      {/* stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-ocean-200 rounded-xl p-5 text-center shadow-sm">
          <p className="text-3xl font-bold text-ocean-950">{attendance.length}</p>
          <p className="text-sm text-ocean-700 mt-1">Total Attended</p>
        </div>
        <div className="bg-white border border-ocean-200 rounded-xl p-5 text-center shadow-sm">
          <p className="text-3xl font-bold text-ocean-900">{pendingBookings.length}</p>
          <p className="text-sm text-ocean-700 mt-1">Pending Check-in</p>
        </div>
        <div className="bg-white border border-ocean-200 rounded-xl p-5 text-center shadow-sm">
          <p className="text-3xl font-bold text-emerald-600">
            {attendance.length > 0 ? Math.round((attendance.length / (attendance.length + pendingBookings.length)) * 100) : 0}%
          </p>
          <p className="text-sm text-ocean-700 mt-1">Attendance Rate</p>
        </div>
      </div>

      {/* mark attendance */}
      <div className="bg-white border border-ocean-200 rounded-xl p-6 mb-8 shadow-sm">
        <h3 className="text-lg font-semibold text-ocean-950 mb-4 flex items-center gap-2">
          <UserCheck size={20} className="text-ocean-400" />
          Mark Attendance
        </h3>
        {pendingBookings.length === 0 ? (
          <p className="text-ocean-700 text-sm">No pending check-ins</p>
        ) : (
          <div className="space-y-3">
            {pendingBookings.map(b => (
              <div key={b.booking_id} className="flex items-center justify-between bg-ocean-50 rounded-lg px-5 py-3">
                <div>
                  <p className="text-ocean-950 font-medium">{b.member_name}</p>
                  <p className="text-ocean-700 text-sm flex items-center gap-1.5">
                    <CalendarDays size={13} />
                    {b.class_name} · {b.schedule ? formatDateTime(b.schedule) : '—'}
                  </p>
                </div>
                <button
                  onClick={() => handleMarkPresent(b.booking_id)}
                  className="px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  Mark Present
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ocean-700" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search attendance records..."
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-ocean-200 rounded-lg text-ocean-950 placeholder-ocean-700 focus:outline-none focus:border-ocean-900"
        />
      </div>

      {/* attendance records */}
      {loading ? (
        <p className="text-ocean-700 text-center py-12">Loading attendance...</p>
      ) : (
        <div className="bg-white border border-ocean-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ocean-200">
                <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-700">ID</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-700">Member</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-700">Class</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-700">Attended At</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-ocean-700">No attendance records found</td></tr>
              ) : (
                filtered.map(record => (
                  <tr key={record.attendance_id} className="border-b border-ocean-100 hover:bg-ocean-50 transition-colors">
                    <td className="px-6 py-4 text-ocean-700 text-sm">#{record.attendance_id}</td>
                    <td className="px-6 py-4 text-ocean-950 font-medium">{record.member_name}</td>
                    <td className="px-6 py-4 text-ocean-700">{record.class_name}</td>
                    <td className="px-6 py-4 text-ocean-700 text-sm">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle size={14} className="text-emerald-500" />
                        {formatDateTime(record.attended_at)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
