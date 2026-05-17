import { useState, useEffect } from 'react';
import { Dumbbell, Plus, X, Search, Pencil, Trash2, Trophy, Eye, Loader2, Users } from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API = `${BASE}/api/trainers`;
const API_GRAPH = `${BASE}/api/graph`;

export default function TrainersPage() {
  const [trainers, setTrainers] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [popular, setPopular] = useState([]);

  // form stuff
  const [formName, setFormName] = useState('');
  const [formSpec, setFormSpec] = useState('');
  const [editingId, setEditingId] = useState(null);

  // detail modal
  const [detailTrainer, setDetailTrainer] = useState(null);
  const [detailGraph, setDetailGraph] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // get all trainers
  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const res = await fetch(API);
      const data = await res.json();
      if (data.success) setTrainers(data.data);
    } catch (err) {
      setError('cant reach the backend, make sure its running');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrainers(); fetchPopular(); }, []);

  const fetchPopular = async () => {
    try {
      const res = await fetch(`${API_GRAPH}/popular-trainers`);
      const data = await res.json();
      if (data.success) setPopular(data.trainers || []);
    } catch (err) { }
  };

  // create or update trainer
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const body = { name: formName, specialization: formSpec };
      const url = editingId ? `${API}/${editingId}` : API;
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
      fetchTrainers();
    } catch (err) {
      setError('something went wrong, check your connection');
    }
  };

  // delete
  const handleDelete = async (id) => {
    if (!confirm('Delete this trainer?')) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchTrainers();
    } catch (err) {
      setError('couldnt delete, try again');
    }
  };

  // start editing
  const startEdit = (trainer) => {
    setEditingId(trainer.trainer_id);
    setFormName(trainer.name);
    setFormSpec(trainer.specialization || '');
    setShowForm(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormSpec('');
    setEditingId(null);
    setShowForm(false);
  };

  // open detail modal
  const openDetail = async (trainerId) => {
    setDetailLoading(true);
    setDetailTrainer(null);
    setDetailGraph(null);
    try {
      const [trainerRes, graphRes] = await Promise.all([
        fetch(`${API}/${trainerId}`),
        fetch(`${API_GRAPH}/trainer/${trainerId}`),
      ]);
      const trainerData = await trainerRes.json();
      const graphData = await graphRes.json();
      if (trainerData.success) setDetailTrainer(trainerData.data);
      if (graphData.success) setDetailGraph(graphData.data || []);
    } catch { }
    finally { setDetailLoading(false); }
  };

  const filtered = trainers.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const inputClass = "px-4 py-2.5 bg-ocean-50 border border-ocean-200 rounded-lg text-ocean-950 placeholder-ocean-700 focus:outline-none focus:border-ocean-900";

  return (
    <div>
      {/* header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ocean-950 flex items-center gap-3">
            <Dumbbell size={32} className="text-ocean-400" />
            Trainers
          </h1>
          <p className="text-ocean-700 mt-1">View and manage all gym trainers</p>
        </div>
        <button
          onClick={() => { showForm ? resetForm() : setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-ocean-900 hover:bg-ocean-950 text-white font-semibold rounded-lg transition-colors cursor-pointer"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'Add Trainer'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg mb-4">{error}</p>}

      {/* popular trainers */}
      {popular.length > 0 && (
        <div className="bg-white border border-ocean-200 rounded-xl p-6 mb-8 shadow-sm">
          <h3 className="text-lg font-semibold text-ocean-950 mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-amber-500" />
            Most Popular Trainers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {popular.map((t, i) => (
              <div key={i} className="bg-ocean-50 rounded-lg p-4 text-center">
                <p className="text-xs text-ocean-600 mb-1">#{i + 1}</p>
                <p className="text-ocean-950 font-semibold text-sm">{t.trainer_name}</p>
                <p className="text-ocean-700 text-xs mt-1">{t.total_bookings} bookings</p>
                <p className="text-ocean-600 text-xs">{t.unique_members} members</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* trainer form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-ocean-200 rounded-xl p-6 mb-8 shadow-sm">
          <h3 className="text-lg font-semibold text-ocean-950 mb-4">
            {editingId ? 'Edit Trainer' : 'New Trainer'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Trainer Name" required className={inputClass} />
            <input type="text" value={formSpec} onChange={e => setFormSpec(e.target.value)} placeholder="Specialization" className={inputClass} />
          </div>
          <button type="submit" className="mt-4 px-6 py-2.5 bg-ocean-900 hover:bg-ocean-950 text-white font-semibold rounded-lg transition-colors cursor-pointer">
            {editingId ? 'Update Trainer' : 'Create Trainer'}
          </button>
        </form>
      )}

      {/* detail modal */}
      {(detailTrainer || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative">
            <button
              onClick={() => { setDetailTrainer(null); setDetailGraph(null); setDetailLoading(false); }}
              className="absolute top-4 right-4 text-ocean-700 hover:text-ocean-950 cursor-pointer text-xl font-bold"
            >
              ✕
            </button>
            {detailLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-ocean-700" />
              </div>
            ) : detailTrainer && (
              <>
                <h3 className="text-xl font-bold text-ocean-950 mb-1">Trainer Detail</h3>
                <p className="text-ocean-600 text-sm mb-6">#{detailTrainer.trainer_id}</p>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-3 border-b border-ocean-100">
                    <span className="text-sm text-ocean-700">Name</span>
                    <span className="text-sm font-medium text-ocean-950">{detailTrainer.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-ocean-100">
                    <span className="text-sm text-ocean-700">Specialization</span>
                    <span className="text-sm font-medium text-ocean-950">{detailTrainer.specialization || '—'}</span>
                  </div>
                  {/* assigned classes */}
                  {detailTrainer.classes && detailTrainer.classes.length > 0 && (
                    <div className="py-3 border-b border-ocean-100">
                      <span className="text-sm text-ocean-700 block mb-2">Assigned Classes</span>
                      <div className="flex flex-wrap gap-2">
                        {detailTrainer.classes.map((c, i) => (
                          <span key={i} className="text-xs bg-ocean-100 text-ocean-900 px-2.5 py-1 rounded-full font-medium">
                            {c.class_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* classes taught with member counts */}
                {detailGraph && detailGraph.length > 0 && (
                  <div className="pt-4 border-t border-ocean-200">
                    <h4 className="text-sm font-semibold text-ocean-950 mb-3 flex items-center gap-1.5">
                      <Users size={14} className="text-ocean-400" />
                      Classes & Members
                    </h4>
                    <div className="space-y-2">
                      {detailGraph.map((item, i) => {
                        const maxMembers = Math.max(...detailGraph.map(d => d.total_members), 1);
                        const pct = Math.round((item.total_members / maxMembers) * 100);
                        return (
                          <div key={i} className="bg-ocean-50 rounded-lg px-4 py-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-medium text-ocean-950">{item.class_name}</span>
                              <span className="text-xs text-ocean-700">{item.total_members} member{item.total_members !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="h-1.5 bg-ocean-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${pct}%`,
                                  background: 'linear-gradient(90deg, #2F4BF5, #48CAE4)',
                                }}
                              />
                            </div>
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

      {/* search bar */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ocean-700" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search trainers..."
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-ocean-200 rounded-lg text-ocean-950 placeholder-ocean-700 focus:outline-none focus:border-ocean-900"
        />
      </div>

      {/* trainers table */}
      {loading ? (
        <p className="text-ocean-700 text-center py-12">Loading trainers...</p>
      ) : (
        <div className="bg-white border border-ocean-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ocean-200">
                <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-700">ID</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-700">Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-700">Specialization</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-ocean-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-ocean-700">No trainers found</td></tr>
              ) : (
                filtered.map(trainer => (
                  <tr key={trainer.trainer_id} className="border-b border-ocean-100 hover:bg-ocean-50 transition-colors">
                    <td className="px-6 py-4 text-ocean-700 text-sm">#{trainer.trainer_id}</td>
                    <td className="px-6 py-4 text-ocean-950 font-medium">{trainer.name}</td>
                    <td className="px-6 py-4 text-ocean-700">{trainer.specialization || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openDetail(trainer.trainer_id)}
                        className="p-2 text-ocean-700 hover:text-ocean-950 hover:bg-ocean-100 rounded-lg transition-colors cursor-pointer"
                        title="View detail"
                      >
                        <Eye size={16} />
                      </button>
                      <button onClick={() => startEdit(trainer)} className="p-2 text-ocean-700 hover:text-ocean-950 hover:bg-ocean-100 rounded-lg transition-colors cursor-pointer">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(trainer.trainer_id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ml-1 cursor-pointer">
                        <Trash2 size={16} />
                      </button>
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
