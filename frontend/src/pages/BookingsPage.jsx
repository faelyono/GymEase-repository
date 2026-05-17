import { useState, useEffect } from 'react';
import { ClipboardList, Plus, X, Search, XCircle, Eye, Loader2, RefreshCw } from 'lucide-react';

const API_BOOKINGS = 'http://localhost:3000/api/bookings';
const API_CLASSES = 'http://localhost:3000/api/classes';
const API_AUTH = 'http://localhost:3000/api/auth';
const API_GRAPH = 'http://localhost:3000/api/graph';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // form stuff
  const [formMemberId, setFormMemberId] = useState('');
  const [formClassId, setFormClassId] = useState('');
  const [myProfile, setMyProfile] = useState(null);

  // detail modal
  const [detailBooking, setDetailBooking] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // graph sync status
  const [syncStatus, setSyncStatus] = useState(''); // '', 'syncing', 'synced', 'failed'

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BOOKINGS);
      const data = await res.json();
      if (data.success) setBookings(data.data);
    } catch (err) {
      setError('cant reach the backend, make sure its running');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch(API_CLASSES);
      const data = await res.json();
      if (data.success) setClasses(data.data);
    } catch (err) { }
  };

  useEffect(() => {
    fetchBookings();
    fetchClasses();
    fetchMyProfile();
  }, []);

  const fetchMyProfile = async () => {
    const token = localStorage.getItem('gymease_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_AUTH}/profile`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setMyProfile(data);
        setFormMemberId(String(data.member_id));
      }
    } catch (err) { }
  };

  // sync booking to graph
  const syncToGraph = async (bookingData) => {
    const token = localStorage.getItem('gymease_token');
    if (!token) return;

    // find the class info to get trainer details
    const cls = classes.find(c => c.class_id === parseInt(bookingData.class_id));
    if (!cls) return;

    const payload = {
      member_id: parseInt(bookingData.member_id),
      member_name: myProfile?.fullname || `Member ${bookingData.member_id}`,
      class_id: parseInt(bookingData.class_id),
      class_name: cls.class_name,
      trainer_id: cls.trainer_id || 0,
      trainer_name: cls.trainer_name || 'Unknown',
    };

    setSyncStatus('syncing');
    try {
      const res = await fetch(`${API_GRAPH}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setSyncStatus(data.success ? 'synced' : 'failed');
    } catch {
      setSyncStatus('failed');
    }
    // auto-clear status after 3 seconds
    setTimeout(() => setSyncStatus(''), 3000);
  };

  // create booking
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(API_BOOKINGS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: parseInt(formMemberId), class_id: parseInt(formClassId) })
      });
      const data = await res.json();
      if (!data.success) {
        const msg = (data.message || '').toLowerCase();
        if (msg.includes('already') || msg.includes('conflict') || msg.includes('duplicate')) {
          setError('this member already booked this class');
        } else {
          setError(data.message || 'booking failed');
        }
        return;
      }

      // sync to graph after successful booking
      syncToGraph({ member_id: formMemberId, class_id: formClassId });

      setFormMemberId('');
      setFormClassId('');
      setShowForm(false);
      fetchBookings();
    } catch (err) {
      setError('backendnya nyalain mas');
    }
  };

  // cancel booking
  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      const res = await fetch(`${API_BOOKINGS}/${id}/cancel`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) fetchBookings();
      else setError(data.message || 'Cancel failed');
    } catch (err) {
      setError('BACKEND NYALAIN');
    }
  };

  // fetch single booking detail
  const openDetail = async (id) => {
    setDetailLoading(true);
    setDetailBooking(null);
    try {
      const res = await fetch(`${API_BOOKINGS}/${id}`);
      const data = await res.json();
      if (data.success) setDetailBooking(data.data);
    } catch { }
    finally { setDetailLoading(false); }
  };

  const filtered = bookings.filter(b => {
    const matchSearch = b.member_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.class_name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || b.status === filter;
    return matchSearch && matchFilter;
  });

  const formatDateTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  const inputClass = "px-4 py-2.5 bg-ocean-50 border border-ocean-200 rounded-lg text-ocean-950 focus:outline-none focus:border-ocean-900";

  return (
    <div>
      {/* header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ocean-950 flex items-center gap-3">
            <ClipboardList size={32} className="text-ocean-400" />
            Bookings
          </h1>
          <p className="text-ocean-700 mt-1">View and manage all class bookings</p>
        </div>
        <div className="flex items-center gap-3">
          {/* graph sync indicator */}
          {syncStatus && (
            <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all animate-in ${syncStatus === 'syncing' ? 'bg-ocean-100 text-ocean-900' :
              syncStatus === 'synced' ? 'bg-emerald-100 text-emerald-700' :
                'bg-red-100 text-red-700'
              }`}>
              {syncStatus === 'syncing' && <><RefreshCw size={12} className="animate-spin" /> Syncing graph...</>}
              {syncStatus === 'synced' && <>✓ Graph synced</>}
              {syncStatus === 'failed' && <>✗ Sync failed</>}
            </span>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-ocean-900 hover:bg-ocean-950 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? 'Cancel' : 'New Booking'}
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg mb-4">{error}</p>}

      {/* stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-ocean-200 rounded-xl p-5 text-center shadow-sm">
          <p className="text-3xl font-bold text-ocean-950">{bookings.length}</p>
          <p className="text-sm text-ocean-700 mt-1">Total Bookings</p>
        </div>
        <div className="bg-white border border-ocean-200 rounded-xl p-5 text-center shadow-sm">
          <p className="text-3xl font-bold text-emerald-600">{confirmedCount}</p>
          <p className="text-sm text-ocean-700 mt-1">Confirmed</p>
        </div>
        <div className="bg-white border border-ocean-200 rounded-xl p-5 text-center shadow-sm">
          <p className="text-3xl font-bold text-red-500">{cancelledCount}</p>
          <p className="text-sm text-ocean-700 mt-1">Cancelled</p>
        </div>
      </div>

      {/* booking modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative">
            <button type="button" onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-ocean-700 hover:text-ocean-950 cursor-pointer text-xl font-bold">
              ✕
            </button>
            <h3 className="text-xl font-bold text-ocean-950 mb-2">Create Booking</h3>
            {myProfile && (
              <p className="text-sm text-ocean-700 mb-5">Booking as <span className="font-semibold text-ocean-950">{myProfile.fullname}</span></p>
            )}
            {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ocean-700 mb-1">Class</label>
                <select value={formClassId} onChange={e => setFormClassId(e.target.value)} required className={inputClass + ' w-full'}>
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c.class_id} value={c.class_id}>{c.class_name} (Cap: {c.capacity})</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full px-6 py-2.5 bg-ocean-900 hover:bg-ocean-950 text-white font-semibold rounded-lg transition-colors cursor-pointer">
                Book Now
              </button>
            </form>
          </div>
        </div>
      )}

      {/* detail modal */}
      {(detailBooking || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              onClick={() => { setDetailBooking(null); setDetailLoading(false); }}
              className="absolute top-4 right-4 text-ocean-700 hover:text-ocean-950 cursor-pointer text-xl font-bold"
            >
              ✕
            </button>
            {detailLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-ocean-700" />
              </div>
            ) : detailBooking && (
              <>
                <h3 className="text-xl font-bold text-ocean-950 mb-1">Booking Detail</h3>
                <p className="text-ocean-600 text-sm mb-6">#{detailBooking.booking_id}</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-ocean-100">
                    <span className="text-sm text-ocean-700">Member</span>
                    <span className="text-sm font-medium text-ocean-950">{detailBooking.member_name || `ID: ${detailBooking.member_id}`}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-ocean-100">
                    <span className="text-sm text-ocean-700">Class</span>
                    <span className="text-sm font-medium text-ocean-950">{detailBooking.class_name || `ID: ${detailBooking.class_id}`}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-ocean-100">
                    <span className="text-sm text-ocean-700">Status</span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${detailBooking.status === 'confirmed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                      }`}>
                      {detailBooking.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm text-ocean-700">Booked At</span>
                    <span className="text-sm font-medium text-ocean-950">
                      {detailBooking.booked_at ? formatDateTime(detailBooking.booked_at) : '—'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* search and filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ocean-700" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search bookings..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-ocean-200 rounded-lg text-ocean-950 placeholder-ocean-700 focus:outline-none focus:border-ocean-900"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'confirmed', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium capitalize transition-colors cursor-pointer ${filter === f
                ? 'bg-ocean-900 text-white'
                : 'bg-white text-ocean-950 border border-ocean-200 hover:bg-ocean-100'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* bookings table */}
      {loading ? (
        <p className="text-ocean-700 text-center py-12">Loading bookings...</p>
      ) : (
        <div className="bg-white border border-ocean-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ocean-200">
                <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-700">ID</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-700">Member</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-700">Class</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-700">Booked At</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-ocean-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-ocean-700">No bookings found</td></tr>
              ) : (
                filtered.map(booking => (
                  <tr key={booking.booking_id} className="border-b border-ocean-100 hover:bg-ocean-50 transition-colors">
                    <td className="px-6 py-4 text-ocean-700 text-sm">#{booking.booking_id}</td>
                    <td className="px-6 py-4 text-ocean-950 font-medium">{booking.member_name}</td>
                    <td className="px-6 py-4 text-ocean-700">{booking.class_name}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${booking.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                        }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-ocean-700 text-sm">{formatDateTime(booking.booked_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openDetail(booking.booking_id)}
                        className="p-2 text-ocean-700 hover:text-ocean-950 hover:bg-ocean-100 rounded-lg transition-colors cursor-pointer"
                        title="View detail"
                      >
                        <Eye size={16} />
                      </button>
                      {booking.status === 'confirmed' && (
                        <button onClick={() => handleCancel(booking.booking_id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-1" title="Cancel booking">
                          <XCircle size={16} />
                        </button>
                      )}
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
