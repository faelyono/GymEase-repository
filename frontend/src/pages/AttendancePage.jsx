import { useState } from 'react';
import { CheckCircle, Search, UserCheck, BarChart3, CalendarDays } from 'lucide-react';

const dummyAttendance = [
  { attendance_id: 1, booking_id: 1, member_name: 'John Doe', class_name: 'Morning Yoga', attended_at: '2025-06-10T07:05:00' },
  { attendance_id: 2, booking_id: 2, member_name: 'Jane Smith', class_name: 'Boxing Basics', attended_at: '2025-06-10T09:02:00' },
  { attendance_id: 3, booking_id: 4, member_name: 'Maria Garcia', class_name: 'Kung Fu', attended_at: '2025-06-11T08:10:00' },
  { attendance_id: 4, booking_id: 5, member_name: 'John Doe', class_name: 'Spin Class', attended_at: '2025-06-11T10:03:00' },
];

const pendingBookings = [
  { booking_id: 7, member_name: 'Alex Johnson', class_name: 'Body Pump', schedule: '2025-06-12T14:00:00' },
  { booking_id: 8, member_name: 'Jane Smith', class_name: 'Morning Yoga', schedule: '2025-06-13T07:00:00' },
  { booking_id: 9, member_name: 'Maria Garcia', class_name: 'HIIT Blast', schedule: '2025-06-13T11:00:00' },
];

export default function AttendancePage() {
  const [attendance] = useState(dummyAttendance);
  const [search, setSearch] = useState('');

  const filtered = attendance.filter(a =>
    a.member_name.toLowerCase().includes(search.toLowerCase()) ||
    a.class_name.toLowerCase().includes(search.toLowerCase())
  );

  const formatDateTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ocean-100 flex items-center gap-3">
          <CheckCircle size={32} className="text-ocean-400" />
          Attendance
        </h1>
        <p className="text-ocean-300 mt-1">Track member attendance and mark presence</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-ocean-900/40 border border-ocean-700/20 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-ocean-100">{attendance.length}</p>
          <p className="text-sm text-ocean-400 mt-1">Total Attended</p>
        </div>
        <div className="bg-ocean-900/40 border border-ocean-700/20 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-ocean-400">{pendingBookings.length}</p>
          <p className="text-sm text-ocean-400 mt-1">Pending Check-in</p>
        </div>
        <div className="bg-ocean-900/40 border border-ocean-700/20 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-emerald-400">
            {attendance.length > 0 ? Math.round((attendance.length / (attendance.length + pendingBookings.length)) * 100) : 0}%
          </p>
          <p className="text-sm text-ocean-400 mt-1">Attendance Rate</p>
        </div>
      </div>

      {/* Mark Attendance Section */}
      <div className="bg-ocean-900/50 border border-ocean-700/30 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-ocean-100 mb-4 flex items-center gap-2">
          <UserCheck size={20} className="text-ocean-400" />
          Mark Attendance
        </h3>
        <div className="space-y-3">
          {pendingBookings.map(b => (
            <div key={b.booking_id} className="flex items-center justify-between bg-ocean-950/60 rounded-lg px-5 py-3">
              <div>
                <p className="text-ocean-100 font-medium">{b.member_name}</p>
                <p className="text-ocean-400 text-sm flex items-center gap-1.5">
                  <CalendarDays size={13} />
                  {b.class_name} · {formatDateTime(b.schedule)}
                </p>
              </div>
              <button className="px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                Mark Present
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ocean-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search attendance records..."
          className="w-full pl-11 pr-4 py-2.5 bg-ocean-900/40 border border-ocean-700/30 rounded-lg text-ocean-100 placeholder-ocean-400 focus:outline-none focus:border-ocean-500"
        />
      </div>

      {/* Attendance Records */}
      <div className="bg-ocean-900/30 border border-ocean-700/20 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ocean-700/30">
              <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-300">ID</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-300">Member</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-300">Class</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-300">Attended At</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(record => (
              <tr key={record.attendance_id} className="border-b border-ocean-700/10 hover:bg-ocean-700/10 transition-colors">
                <td className="px-6 py-4 text-ocean-400 text-sm">#{record.attendance_id}</td>
                <td className="px-6 py-4 text-ocean-100 font-medium">{record.member_name}</td>
                <td className="px-6 py-4 text-ocean-300">{record.class_name}</td>
                <td className="px-6 py-4 text-ocean-300 text-sm">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-emerald-400" />
                    {formatDateTime(record.attended_at)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
