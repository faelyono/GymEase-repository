import { useState } from 'react';
import { ClipboardList, Plus, X, Search, XCircle, BarChart3 } from 'lucide-react';

const dummyBookings = [
  { booking_id: 1, member_name: 'John Doe', class_name: 'Morning Yoga', status: 'confirmed', booked_at: '2025-06-08T10:30:00' },
  { booking_id: 2, member_name: 'Jane Smith', class_name: 'Boxing Basics', status: 'confirmed', booked_at: '2025-06-08T11:00:00' },
  { booking_id: 3, member_name: 'Alex Johnson', class_name: 'HIIT Blast', status: 'cancelled', booked_at: '2025-06-07T14:00:00' },
  { booking_id: 4, member_name: 'Maria Garcia', class_name: 'Kung Fu', status: 'confirmed', booked_at: '2025-06-09T09:15:00' },
  { booking_id: 5, member_name: 'John Doe', class_name: 'Spin Class', status: 'confirmed', booked_at: '2025-06-09T16:00:00' },
  { booking_id: 6, member_name: 'Jane Smith', class_name: 'Body Pump', status: 'cancelled', booked_at: '2025-06-08T08:00:00' },
];

export default function BookingsPage() {
  const [bookings] = useState(dummyBookings);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');

  const filtered = bookings.filter(b => {
    const matchSearch = b.member_name.toLowerCase().includes(search.toLowerCase()) ||
      b.class_name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || b.status === filter;
    return matchSearch && matchFilter;
  });

  const formatDateTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ocean-100 flex items-center gap-3">
            <ClipboardList size={32} className="text-ocean-400" />
            Bookings
          </h1>
          <p className="text-ocean-300 mt-1">Track class bookings and cancellations</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-ocean-500 hover:bg-ocean-400 text-ocean-950 font-semibold rounded-lg transition-colors cursor-pointer"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'New Booking'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-ocean-900/40 border border-ocean-700/20 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-ocean-100">{bookings.length}</p>
          <p className="text-sm text-ocean-400 mt-1">Total Bookings</p>
        </div>
        <div className="bg-ocean-900/40 border border-ocean-700/20 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-emerald-400">{confirmedCount}</p>
          <p className="text-sm text-ocean-400 mt-1">Confirmed</p>
        </div>
        <div className="bg-ocean-900/40 border border-ocean-700/20 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-red-400">{cancelledCount}</p>
          <p className="text-sm text-ocean-400 mt-1">Cancelled</p>
        </div>
      </div>

      {/* Add Booking Form */}
      {showForm && (
        <div className="bg-ocean-900/50 border border-ocean-700/30 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-ocean-100 mb-4">Create Booking</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select className="px-4 py-2.5 bg-ocean-950 border border-ocean-700/40 rounded-lg text-ocean-100 focus:outline-none focus:border-ocean-500">
              <option value="">Select Member</option>
              <option value="1">John Doe</option>
              <option value="2">Jane Smith</option>
              <option value="3">Alex Johnson</option>
              <option value="4">Maria Garcia</option>
            </select>
            <select className="px-4 py-2.5 bg-ocean-950 border border-ocean-700/40 rounded-lg text-ocean-100 focus:outline-none focus:border-ocean-500">
              <option value="">Select Class</option>
              <option value="1">Morning Yoga</option>
              <option value="2">Boxing Basics</option>
              <option value="3">HIIT Blast</option>
              <option value="4">Kung Fu</option>
            </select>
          </div>
          <button className="mt-4 px-6 py-2.5 bg-ocean-500 hover:bg-ocean-400 text-ocean-950 font-semibold rounded-lg transition-colors cursor-pointer">
            Book Now
          </button>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ocean-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search bookings..."
            className="w-full pl-11 pr-4 py-2.5 bg-ocean-900/40 border border-ocean-700/30 rounded-lg text-ocean-100 placeholder-ocean-400 focus:outline-none focus:border-ocean-500"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'confirmed', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium capitalize transition-colors cursor-pointer ${
                filter === f
                  ? 'bg-ocean-500 text-ocean-950'
                  : 'bg-ocean-900/40 text-ocean-300 hover:bg-ocean-700/30'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-ocean-900/30 border border-ocean-700/20 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ocean-700/30">
              <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-300">ID</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-300">Member</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-300">Class</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-300">Status</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-300">Booked At</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-ocean-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(booking => (
              <tr key={booking.booking_id} className="border-b border-ocean-700/10 hover:bg-ocean-700/10 transition-colors">
                <td className="px-6 py-4 text-ocean-400 text-sm">#{booking.booking_id}</td>
                <td className="px-6 py-4 text-ocean-100 font-medium">{booking.member_name}</td>
                <td className="px-6 py-4 text-ocean-300">{booking.class_name}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    booking.status === 'confirmed'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-ocean-300 text-sm">{formatDateTime(booking.booked_at)}</td>
                <td className="px-6 py-4 text-right">
                  {booking.status === 'confirmed' && (
                    <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer" title="Cancel booking">
                      <XCircle size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
