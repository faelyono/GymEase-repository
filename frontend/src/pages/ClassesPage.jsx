import { useState, useEffect } from 'react';
import { CalendarDays, Plus, X, Search, Pencil, Trash2, Clock, Users, BarChart3, Eye, Loader2 } from 'lucide-react';

const API_CLASSES = 'http://localhost:3000/api/classes';
const API_TRAINERS = 'http://localhost:3000/api/trainers';
const API_BOOKINGS = 'http://localhost:3000/api/bookings';
const API_ATTENDANCE = 'http://localhost:3000/api/attendance';
const API_GRAPH = 'http://localhost:3000/api/graph';

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [report, setReport] = useState([]);
  const [classStats, setClassStats] = useState({});
  const [classAttendance, setClassAttendance] = useState({});
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // form stuff
  const [formName, setFormName] = useState('');
  const [formTrainer, setFormTrainer] = useState('');
  const [formSchedule, setFormSchedule] = useState('');
  const [formCapacity, setFormCapacity] = useState('');
  const [editingId, setEditingId] = useState(null);

  // detail modal
  const [detailClass, setDetailClass] = useState(null);
  const [detailGraph, setDetailGraph] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_CLASSES);
      const data = await res.json();
      if (data.success) setClasses(data.data);
    } catch (err) {
      setError('cant reach the backend, make sure its running');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainers = async () => {
    try {
      const res = await fetch(API_TRAINERS);
      const data = await res.json();
      if (data.success) setTrainers(data.data);
    } catch (err) { }
  };

  const fetchReport = async () => {
    try {
      const res = await fetch(`${API_CLASSES}/report/availability`);
      const data = await res.json();
      if (data.success) setReport(data.data);
    } catch (err) { }
  };

  const fetchClassStats = async (classId) => {
    try {
      const res = await fetch(`${API_BOOKINGS}/stats/${classId}`);
      const data = await res.json();
      if (data.success) setClassStats(prev => ({ ...prev, [classId]: data.data }));
    } catch (err) { }
  };

  const fetchClassAttendance = async (classId) => {
    try {
      const res = await fetch(`${API_ATTENDANCE}/rate/class/${classId}`);
      const data = await res.json();
      if (data.success) setClassAttendance(prev => ({ ...prev, [classId]: data.data }));
    } catch (err) { }
  };

  useEffect(() => {
    fetchClasses();
    fetchTrainers();
  }, []);

  // fetch stats when classes loaded
  useEffect(() => {
    classes.forEach(c => {
      fetchClassStats(c.class_id);
      fetchClassAttendance(c.class_id);
    });
  }, [classes]);

  // create or update class
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const body = {
        class_name: formName,
        trainer_id: formTrainer || null,
        schedule: formSchedule,
        capacity: parseInt(formCapacity)
      };
      const url = editingId ? `${API_CLASSES}/${editingId}` : API_CLASSES;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Operation failed');
        return;
      }
      resetForm();
      fetchClasses();
    } catch (err) {
      setError('something went wrong, check your connection');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this class?')) return;
    try {
      const res = await fetch(`${API_CLASSES}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchClasses();
    } catch (err) {
      setError('couldnt delete, try again');
    }
  };

  const startEdit = (cls) => {
    setEditingId(cls.class_id);
    setFormName(cls.class_name);
    setFormTrainer(cls.trainer_id || '');
    setFormSchedule(cls.schedule ? cls.schedule.slice(0, 16) : '');
    setFormCapacity(cls.capacity?.toString() || '');
    setShowForm(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormTrainer('');
    setFormSchedule('');
    setFormCapacity('');
    setEditingId(null);
    setShowForm(false);
  };

  const toggleReport = () => {
    if (!showReport) fetchReport();
    setShowReport(!showReport);
  };

  // open detail modal
  const openDetail = async (classId) => {
    setDetailLoading(true);
    setDetailClass(null);
    setDetailGraph(null);
    const token = localStorage.getItem('gymease_token') || '';
    try {
      const [classRes, graphRes] = await Promise.all([
        fetch(`${API_CLASSES}/${classId}`),
        fetch(`${API_GRAPH}/class/${classId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const classData = await classRes.json();
      const graphData = await graphRes.json();
      if (classData.success) setDetailClass(classData.data);
      if (graphData.success) setDetailGraph(graphData.data || []);
    } catch { }
    finally { setDetailLoading(false); }
  };

  const filtered = classes.filter(c =>
    c.class_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.trainer_name?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const inputClass = "px-4 py-2.5 bg-ocean-50 border border-ocean-200 rounded-lg text-ocean-950 placeholder-ocean-700 focus:outline-none focus:border-ocean-900";

  return (
    <div>
      {/* header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ocean-950 flex items-center gap-3">
            <CalendarDays size={32} className="text-ocean-400" />
            Classes
          </h1>
          <p className="text-ocean-700 mt-1">View and manage all scheduled gym classes</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-ocean-200 text-ocean-950 font-medium rounded-lg hover:bg-ocean-50 transition-colors cursor-pointer"
          >
            <BarChart3 size={18} />
            Report
          </button>
          <button
            onClick={() => { showForm ? resetForm() : setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-ocean-900 hover:bg-ocean-950 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? 'Cancel' : 'Add Class'}
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg mb-4">{error}</p>}

      {/* availability report modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-7 pt-7 pb-4 border-b border-ocean-100 shrink-0">
              <h3 className="text-xl font-bold text-ocean-950 flex items-center gap-2">
                <BarChart3 size={22} className="text-ocean-400" />
                Availability Report
              </h3>
              <button onClick={() => setShowReport(false)} className="text-ocean-600 hover:text-ocean-950 cursor-pointer p-1 rounded-lg hover:bg-ocean-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="px-7 py-5 overflow-y-auto flex-1">
              {report.length === 0 ? (
                <p className="text-ocean-700 text-sm">No data available</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-ocean-200">
                        <th className="text-left px-4 py-2 text-ocean-700 font-semibold">Day</th>
                        <th className="text-left px-4 py-2 text-ocean-700 font-semibold">Classes</th>
                        <th className="text-left px-4 py-2 text-ocean-700 font-semibold">Capacity</th>
                        <th className="text-left px-4 py-2 text-ocean-700 font-semibold">Bookings</th>
                        <th className="text-left px-4 py-2 text-ocean-700 font-semibold">Fill Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.map((r, i) => (
                        <tr key={i} className="border-b border-ocean-100">
                          <td className="px-4 py-2 text-ocean-950 font-medium">{r.day_of_week?.trim()}</td>
                          <td className="px-4 py-2 text-ocean-700">{r.total_classes}</td>
                          <td className="px-4 py-2 text-ocean-700">{r.total_capacity}</td>
                          <td className="px-4 py-2 text-ocean-700">{r.total_bookings}</td>
                          <td className="px-4 py-2">
                            <span className="bg-ocean-100 text-ocean-900 text-xs font-medium px-2 py-0.5 rounded-full">
                              {r.fill_rate_percent || 0}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* class form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-ocean-200 rounded-xl p-6 mb-8 shadow-sm">
          <h3 className="text-lg font-semibold text-ocean-950 mb-4">
            {editingId ? 'Edit Class' : 'New Class'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Class Name" required className={inputClass} />
            <select value={formTrainer} onChange={e => setFormTrainer(e.target.value)} className={inputClass}>
              <option value="">Select Trainer (optional)</option>
              {trainers.map(t => (
                <option key={t.trainer_id} value={t.trainer_id}>{t.name}</option>
              ))}
            </select>
            <input type="datetime-local" value={formSchedule} onChange={e => setFormSchedule(e.target.value)} required className={inputClass} />
            <input type="number" value={formCapacity} onChange={e => setFormCapacity(e.target.value)} placeholder="Capacity" required min="1" className={inputClass} />
          </div>
          <button type="submit" className="mt-4 px-6 py-2.5 bg-ocean-900 hover:bg-ocean-950 text-white font-semibold rounded-lg transition-colors cursor-pointer">
            {editingId ? 'Update Class' : 'Create Class'}
          </button>
        </form>
      )}

      {/* detail modal */}
      {(detailClass || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => { setDetailClass(null); setDetailGraph(null); setDetailLoading(false); }}
              className="absolute top-4 right-4 text-ocean-700 hover:text-ocean-950 cursor-pointer text-xl font-bold"
            >
              ✕
            </button>
            {detailLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-ocean-700" />
              </div>
            ) : detailClass && (
              <>
                <h3 className="text-xl font-bold text-ocean-950 mb-1">Class Detail</h3>
                <p className="text-ocean-600 text-sm mb-6">#{detailClass.class_id}</p>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-3 border-b border-ocean-100">
                    <span className="text-sm text-ocean-700">Name</span>
                    <span className="text-sm font-medium text-ocean-950">{detailClass.class_name}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-ocean-100">
                    <span className="text-sm text-ocean-700">Trainer</span>
                    <span className="text-sm font-medium text-ocean-950">{detailClass.trainer_name || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-ocean-100">
                    <span className="text-sm text-ocean-700">Schedule</span>
                    <span className="text-sm font-medium text-ocean-950">
                      {detailClass.schedule ? `${formatDate(detailClass.schedule)} · ${formatTime(detailClass.schedule)}` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-ocean-100">
                    <span className="text-sm text-ocean-700">Capacity</span>
                    <span className="text-sm font-medium text-ocean-950">{detailClass.capacity}</span>
                  </div>
                </div>

                {/* members who booked this class */}
                {detailGraph && detailGraph.length > 0 && (
                  <div className="pt-4 border-t border-ocean-200">
                    <h4 className="text-sm font-semibold text-ocean-950 mb-3 flex items-center gap-1.5">
                      <Users size={14} className="text-ocean-400" />
                      Members Who Booked
                    </h4>
                    <div className="space-y-2">
                      {detailGraph.map((item, i) => {
                        const maxBookings = Math.max(...detailGraph.map(d => d.booking_count), 1);
                        const pct = Math.round((item.booking_count / maxBookings) * 100);
                        return (
                          <div key={i} className="flex items-center gap-3 bg-ocean-50 rounded-lg px-4 py-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                              style={{ background: 'linear-gradient(135deg, #2F4BF5, #48CAE4)' }}
                            >
                              {item.member_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-ocean-950 font-medium text-sm truncate">{item.member_name}</p>
                              <div className="h-1.5 bg-ocean-200 rounded-full overflow-hidden mt-1">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${pct}%`,
                                    background: 'linear-gradient(90deg, #2F4BF5, #48CAE4)',
                                  }}
                                />
                              </div>
                            </div>
                            <span className="text-xs font-bold text-ocean-900 shrink-0">×{item.booking_count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {detailGraph && detailGraph.length === 0 && (
                  <p className="text-ocean-600 text-xs mt-2">no data available yet.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ocean-700" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search classes..."
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-ocean-200 rounded-lg text-ocean-950 placeholder-ocean-700 focus:outline-none focus:border-ocean-900"
        />
      </div>

      {/* classes grid */}
      {loading ? (
        <p className="text-ocean-700 text-center py-12">Loading classes...</p>
      ) : filtered.length === 0 ? (
        <p className="text-ocean-700 text-center py-12">No classes found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(cls => (
            <div key={cls.class_id} className="bg-white border border-ocean-200 rounded-xl p-5 hover:border-ocean-900/40 shadow-sm transition-all group">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-ocean-950">{cls.class_name}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openDetail(cls.class_id)}
                    className="p-1.5 text-ocean-700 hover:text-ocean-950 hover:bg-ocean-100 rounded-lg transition-colors cursor-pointer"
                    title="View detail"
                  >
                    <Eye size={14} />
                  </button>
                  <button onClick={() => startEdit(cls)} className="p-1.5 text-ocean-700 hover:text-ocean-950 hover:bg-ocean-100 rounded-lg transition-colors cursor-pointer">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(cls.class_id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-ocean-700 text-sm mb-3">by {cls.trainer_name || 'Unassigned'}</p>
              <div className="flex items-center gap-4 text-sm text-ocean-700">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-ocean-900" />
                  {formatDate(cls.schedule)} · {formatTime(cls.schedule)}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-ocean-700">
                <Users size={14} className="text-ocean-900" />
                Capacity: {cls.capacity}
              </div>
              {/* booking stats */}
              <div className="mt-3 pt-3 border-t border-ocean-100 flex items-center gap-3 text-xs">
                {classStats[cls.class_id] ? (
                  <>
                    <span className="bg-ocean-100 text-ocean-900 px-2 py-0.5 rounded-full font-medium">
                      {classStats[cls.class_id].fill_rate_percent || 0}% filled
                    </span>
                    <span className="text-ocean-700">
                      {classStats[cls.class_id].confirmed || 0} booked
                    </span>
                  </>
                ) : (
                  <span className="text-ocean-600">Loading stats...</span>
                )}
                {classAttendance[cls.class_id] ? (
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                    {classAttendance[cls.class_id].attendance_rate_percent || 0}% attended
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
