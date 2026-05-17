import { useState, useEffect } from 'react';
import {
  BarChart3, Users, Dumbbell, CalendarDays,
  Network, Sparkles, ChevronRight, Loader2, X, ChevronDown, RefreshCw
} from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_GRAPH = `${BASE}/api/graph`;
const API_BOOKINGS = `${BASE}/api/bookings`;
const API_CLASSES = `${BASE}/api/classes`;
const API_TRAINERS = `${BASE}/api/trainers`;

// modal component
function Modal({ open, onClose, icon: Icon, title, subtitle, wide, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className={`bg-white rounded-2xl shadow-2xl relative flex flex-col max-h-[85vh] ${wide ? 'w-full max-w-2xl' : 'w-full max-w-lg'}`}>
        <div className="flex items-start justify-between px-7 pt-7 pb-4 border-b border-ocean-100 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-ocean-950 flex items-center gap-2">
              <Icon size={22} className="text-ocean-400" />
              {title}
            </h3>
            {subtitle && <p className="text-sm text-ocean-700 mt-1">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-ocean-600 hover:text-ocean-950 cursor-pointer p-1 rounded-lg hover:bg-ocean-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-7 py-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

// select dropdown component
function SelectDropdown({ value, onChange, options, placeholder, loading }) {
  return (
    <div className="relative mb-5">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-ocean-50 border border-ocean-200 rounded-lg text-ocean-950 focus:outline-none focus:border-ocean-900 text-sm appearance-none cursor-pointer pr-10"
      >
        <option value="">{loading ? 'Loading...' : placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ocean-600 pointer-events-none" />
    </div>
  );
}

// strength bar component
function StrengthBar({ value, max, label }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-ocean-700 w-8 text-right">{value}</span>
      <div className="flex-1 h-2 bg-ocean-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #2F4BF5, #48CAE4)',
          }}
        />
      </div>
      {label && <span className="text-xs text-ocean-600 min-w-[60px]">{label}</span>}
    </div>
  );
}

// card definitions for the grid
const analyticsCards = [
  { key: 'member', icon: Users, title: 'Member Activity', desc: 'Show booked classes and connected trainers for a member', color: '#2F4BF5' },
  { key: 'class', icon: CalendarDays, title: 'Class Members', desc: 'Show all members who booked a specific class', color: '#3219AB' },
  { key: 'trainer', icon: Dumbbell, title: 'Trainer Network', desc: 'Show classes taught by a trainer and their member counts', color: '#4A8FFF' },
  { key: 'similarity', icon: Sparkles, title: 'Class Similarity', desc: 'Show classes that are frequently booked together', color: '#48CAE4' },
  { key: 'network', icon: Network, title: 'Member Network', desc: 'Show members who attend the same classes', color: '#2F4BF5' },
];

export default function AnalyticsPage() {
  const token = localStorage.getItem('gymease_token') || '';
  const authHeaders = { Authorization: `Bearer ${token}` };

  // which modal is open
  const [activeModal, setActiveModal] = useState(null);

  // dropdown data sources
  const [members, setMembers] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [trainersList, setTrainersList] = useState([]);
  const [listsLoading, setListsLoading] = useState(true);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [bookingsRes, classesRes, trainersRes] = await Promise.all([
          fetch(API_BOOKINGS),
          fetch(API_CLASSES),
          fetch(API_TRAINERS),
        ]);

        // extract unique members from bookings
        const bData = await bookingsRes.json();
        if (bData.success) {
          const unique = [...new Map(
            bData.data.map(b => [b.member_id, { member_id: b.member_id, fullname: b.member_name }])
          ).values()];
          setMembers(unique);
        }

        const cData = await classesRes.json();
        if (cData.success) setClassesList(cData.data || []);

        const tData = await trainersRes.json();
        if (tData.success) setTrainersList(tData.data || []);
      } catch { }
      finally { setListsLoading(false); }
    };
    fetchLists();
  }, []);

  // build dropdown options
  const memberOptions = members.map(m => ({
    value: String(m.member_id),
    label: `#${m.member_id} — ${m.fullname || m.name || 'Unknown'}`,
  }));
  const classOptions = classesList.map(c => ({
    value: String(c.class_id),
    label: `#${c.class_id} — ${c.class_name}`,
  }));
  const trainerOptions = trainersList.map(t => ({
    value: String(t.trainer_id),
    label: `#${t.trainer_id} — ${t.name}`,
  }));

  // member graph
  const [memberIdInput, setMemberIdInput] = useState('');
  const [memberGraph, setMemberGraph] = useState(null);
  const [memberGraphLoading, setMemberGraphLoading] = useState(false);
  const [memberGraphError, setMemberGraphError] = useState('');

  const fetchMemberGraph = async (id) => {
    if (!id) return;
    setMemberGraphError('');
    setMemberGraphLoading(true);
    setMemberGraph(null);
    try {
      const res = await fetch(`${API_GRAPH}/member/${id}`, { headers: authHeaders });
      const data = await res.json();
      if (!data.success) { setMemberGraphError(data.message || 'Failed'); return; }
      setMemberGraph(data);
    } catch { setMemberGraphError('couldnt connect, is the backend on?'); }
    finally { setMemberGraphLoading(false); }
  };

  const handleMemberSelect = (val) => {
    setMemberIdInput(val);
    fetchMemberGraph(val);
  };

  // class graph
  const [classIdInput, setClassIdInput] = useState('');
  const [classGraph, setClassGraph] = useState(null);
  const [classGraphLoading, setClassGraphLoading] = useState(false);
  const [classGraphError, setClassGraphError] = useState('');

  const fetchClassGraph = async (id) => {
    if (!id) return;
    setClassGraphError('');
    setClassGraphLoading(true);
    setClassGraph(null);
    try {
      const res = await fetch(`${API_GRAPH}/class/${id}`, { headers: authHeaders });
      const data = await res.json();
      if (!data.success) { setClassGraphError(data.message || 'Failed'); return; }
      setClassGraph(data);
    } catch { setClassGraphError('couldnt connect, is the backend on?'); }
    finally { setClassGraphLoading(false); }
  };

  const handleClassSelect = (val) => {
    setClassIdInput(val);
    fetchClassGraph(val);
  };

  // trainer graph
  const [trainerIdInput, setTrainerIdInput] = useState('');
  const [trainerGraph, setTrainerGraph] = useState(null);
  const [trainerGraphLoading, setTrainerGraphLoading] = useState(false);
  const [trainerGraphError, setTrainerGraphError] = useState('');

  const fetchTrainerGraph = async (id) => {
    if (!id) return;
    setTrainerGraphError('');
    setTrainerGraphLoading(true);
    setTrainerGraph(null);
    try {
      const res = await fetch(`${API_GRAPH}/trainer/${id}`);
      const data = await res.json();
      if (!data.success) { setTrainerGraphError(data.message || 'Failed'); return; }
      setTrainerGraph(data);
    } catch { setTrainerGraphError('couldnt connect, is the backend on?'); }
    finally { setTrainerGraphLoading(false); }
  };

  const handleTrainerSelect = (val) => {
    setTrainerIdInput(val);
    fetchTrainerGraph(val);
  };

  // class similarity
  const [similarity, setSimilarity] = useState([]);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState('');

  const fetchSimilarity = async () => {
    setSimLoading(true);
    setSimError('');
    try {
      const res = await fetch(`${API_GRAPH}/class-similarity`);
      const data = await res.json();
      if (data.success) setSimilarity(data.pairs || []);
    } catch { setSimError('couldnt load similarity data, try again'); }
    finally { setSimLoading(false); }
  };

  // member network
  const [netIdInput, setNetIdInput] = useState('');
  const [network, setNetwork] = useState(null);
  const [netLoading, setNetLoading] = useState(false);
  const [netError, setNetError] = useState('');

  const fetchNetwork = async (id) => {
    if (!id) return;
    setNetError('');
    setNetLoading(true);
    setNetwork(null);
    try {
      const res = await fetch(`${API_GRAPH}/member-network/${id}`, { headers: authHeaders });
      const data = await res.json();
      if (!data.success) { setNetError(data.message || 'Failed'); return; }
      setNetwork(data);
    } catch { setNetError('couldnt connect, is the backend on?'); }
    finally { setNetLoading(false); }
  };

  const handleNetSelect = (val) => {
    setNetIdInput(val);
    fetchNetwork(val);
  };

  // sync all bookings to graph
  const [syncStatus, setSyncStatus] = useState(''); // '', 'syncing', 'done', 'failed'
  const [syncProgress, setSyncProgress] = useState({ done: 0, total: 0 });

  const syncAllBookings = async () => {
    setSyncStatus('syncing');
    try {
      const res = await fetch(API_BOOKINGS);
      const data = await res.json();
      if (!data.success) { setSyncStatus('failed'); return; }

      const bookings = data.data.filter(b => b.status === 'confirmed');
      setSyncProgress({ done: 0, total: bookings.length });

      for (let i = 0; i < bookings.length; i++) {
        const b = bookings[i];
        // find class details for trainer info
        const cls = classesList.find(c => c.class_id === b.class_id);
        const payload = {
          member_id: b.member_id,
          member_name: b.member_name || `Member ${b.member_id}`,
          class_id: b.class_id,
          class_name: b.class_name || `Class ${b.class_id}`,
          trainer_id: cls?.trainer_id || 0,
          trainer_name: cls?.trainer_name || 'Unknown',
        };
        try {
          await fetch(`${API_GRAPH}/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          });
        } catch { }
        setSyncProgress({ done: i + 1, total: bookings.length });
      }
      setSyncStatus('done');
      setTimeout(() => setSyncStatus(''), 4000);
    } catch {
      setSyncStatus('failed');
      setTimeout(() => setSyncStatus(''), 4000);
    }
  };

  // open modal handler
  const openModal = (key) => {
    setActiveModal(key);
    if (key === 'similarity' && similarity.length === 0) fetchSimilarity();
  };

  const closeModal = () => setActiveModal(null);

  // helpers
  const maxOf = (arr, key) => Math.max(...arr.map(i => i[key]), 1);

  return (
    <div>
      {/* page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ocean-950 flex items-center gap-3">
            <BarChart3 size={32} className="text-ocean-400" />
            Analytics
          </h1>
          <p className="text-ocean-700 mt-1">
            View graph-based insights on member activity, class relationships, and trainer networks
          </p>
        </div>
        <div className="flex items-center gap-3">
          {syncStatus && syncStatus !== 'syncing' && (
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${
              syncStatus === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              {syncStatus === 'done' ? `✓ Synced ${syncProgress.total} bookings` : '✗ Sync failed'}
            </span>
          )}
          <button
            onClick={syncAllBookings}
            disabled={syncStatus === 'syncing'}
            className="flex items-center gap-2 px-5 py-2.5 bg-ocean-900 hover:bg-ocean-950 text-white font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-60 text-sm"
          >
            <RefreshCw size={16} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
            {syncStatus === 'syncing'
              ? `Syncing ${syncProgress.done}/${syncProgress.total}...`
              : 'Sync All Bookings'
            }
          </button>
        </div>
      </div>

      {/* card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyticsCards.map(card => {
          const Icon = card.icon;
          return (
            <button
              key={card.key}
              onClick={() => openModal(card.key)}
              className="bg-white border border-ocean-200 rounded-xl p-6 text-left hover:border-ocean-900/40 shadow-sm transition-all group cursor-pointer"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${card.color}18, ${card.color}08)`,
                  border: `1px solid ${card.color}30`,
                }}
              >
                <Icon size={22} style={{ color: card.color }} />
              </div>
              <h3 className="text-base font-semibold text-ocean-950 mb-1">{card.title}</h3>
              <p className="text-sm text-ocean-700">{card.desc}</p>
            </button>
          );
        })}
      </div>

      {/* member activity modal */}
      <Modal
        open={activeModal === 'member'}
        onClose={closeModal}
        icon={Users}
        title="Member Activity Graph"
        subtitle="Shows booked classes and connected trainers for the selected member"
        wide
      >
        <SelectDropdown
          value={memberIdInput}
          onChange={handleMemberSelect}
          options={memberOptions}
          placeholder="Select a member..."
          loading={listsLoading}
        />
        {memberGraphLoading && (
          <div className="flex items-center gap-2 text-ocean-600 text-sm py-4">
            <Loader2 size={16} className="animate-spin" /> loading...
          </div>
        )}
        {memberGraphError && (
          <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg mb-4">{memberGraphError}</p>
        )}
        {memberGraph && !memberGraphLoading && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium text-ocean-950">
                {memberGraph.data?.[0]?.member_name || `Member #${memberGraph.member_id}`}
              </span>
              <span className="text-xs bg-ocean-100 text-ocean-900 px-2 py-0.5 rounded-full">
                {memberGraph.data?.length || 0} class{memberGraph.data?.length !== 1 ? 'es' : ''} booked
              </span>
            </div>
            {memberGraph.data?.length === 0 ? (
              <p className="text-ocean-600 text-sm">No bookings found for this member.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {memberGraph.data.map((item, i) => (
                  <div key={i} className="bg-ocean-50 rounded-lg p-4 flex items-center gap-4 hover:bg-ocean-100/80 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-ocean-200 flex items-center justify-center shrink-0">
                      <CalendarDays size={18} className="text-ocean-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-ocean-950 font-medium text-sm truncate">{item.class_name}</p>
                      <p className="text-ocean-600 text-xs">by {item.trainer_name || 'Unknown'}</p>
                    </div>
                    <span className="bg-ocean-900 text-white text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
                      ×{item.booking_count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* class members modal */}
      <Modal
        open={activeModal === 'class'}
        onClose={closeModal}
        icon={CalendarDays}
        title="Class Member Graph"
        subtitle="Shows all members who have booked the selected class"
        wide
      >
        <SelectDropdown
          value={classIdInput}
          onChange={handleClassSelect}
          options={classOptions}
          placeholder="Select a class..."
          loading={listsLoading}
        />
        {classGraphLoading && (
          <div className="flex items-center gap-2 text-ocean-600 text-sm py-4">
            <Loader2 size={16} className="animate-spin" /> loading...
          </div>
        )}
        {classGraphError && (
          <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg mb-4">{classGraphError}</p>
        )}
        {classGraph && !classGraphLoading && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium text-ocean-950">
                {classGraph.data?.[0]?.class_name || `Class #${classGraph.class_id}`}
              </span>
              <ChevronRight size={14} className="text-ocean-400" />
              <span className="text-xs text-ocean-700">
                Trainer: {classGraph.data?.[0]?.trainer_name || 'Unassigned'}
              </span>
              <span className="text-xs bg-ocean-100 text-ocean-900 px-2 py-0.5 rounded-full ml-auto">
                {classGraph.data?.length || 0} member{classGraph.data?.length !== 1 ? 's' : ''}
              </span>
            </div>
            {classGraph.data?.length === 0 ? (
              <p className="text-ocean-600 text-sm">No bookings found for this class.</p>
            ) : (
              <div className="space-y-2">
                {classGraph.data.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-ocean-50 rounded-lg px-4 py-3 hover:bg-ocean-100/80 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-ocean-200 flex items-center justify-center text-xs font-bold text-ocean-900 shrink-0">
                      {item.member_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-ocean-950 font-medium text-sm truncate">{item.member_name}</p>
                      <p className="text-ocean-600 text-xs">ID: {item.member_id}</p>
                    </div>
                    <div className="w-32">
                      <StrengthBar value={item.booking_count} max={maxOf(classGraph.data, 'booking_count')} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* trainer network modal */}
      <Modal
        open={activeModal === 'trainer'}
        onClose={closeModal}
        icon={Dumbbell}
        title="Trainer Network"
        subtitle="Shows classes and member counts for the selected trainer"
        wide
      >
        <SelectDropdown
          value={trainerIdInput}
          onChange={handleTrainerSelect}
          options={trainerOptions}
          placeholder="Select a trainer..."
          loading={listsLoading}
        />
        {trainerGraphLoading && (
          <div className="flex items-center gap-2 text-ocean-600 text-sm py-4">
            <Loader2 size={16} className="animate-spin" /> loading...
          </div>
        )}
        {trainerGraphError && (
          <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg mb-4">{trainerGraphError}</p>
        )}
        {trainerGraph && !trainerGraphLoading && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium text-ocean-950">
                {trainerGraph.data?.[0]?.trainer_name || `Trainer #${trainerGraph.trainer_id}`}
              </span>
              <span className="text-xs bg-ocean-100 text-ocean-900 px-2 py-0.5 rounded-full">
                {trainerGraph.data?.length || 0} class{trainerGraph.data?.length !== 1 ? 'es' : ''}
              </span>
            </div>
            {trainerGraph.data?.length === 0 ? (
              <p className="text-ocean-600 text-sm">No classes found for this trainer.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {trainerGraph.data.map((item, i) => (
                  <div key={i} className="bg-ocean-50 rounded-lg p-4 hover:bg-ocean-100/80 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-ocean-950 font-medium text-sm">{item.class_name}</p>
                      <span className="text-xs text-ocean-600">ID: {item.class_id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-ocean-700" />
                      <StrengthBar
                        value={item.total_members}
                        max={maxOf(trainerGraph.data, 'total_members')}
                        label={`${item.total_members} member${item.total_members !== 1 ? 's' : ''}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* class similarity modal */}
      <Modal
        open={activeModal === 'similarity'}
        onClose={closeModal}
        icon={Sparkles}
        title="Class Similarity"
        subtitle="Shows pairs of classes that share the most members"
        wide
      >
        {simError && (
          <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg mb-4">{simError}</p>
        )}
        {simLoading ? (
          <div className="flex items-center gap-2 text-ocean-600 text-sm py-4">
            <Loader2 size={16} className="animate-spin" /> loading...
          </div>
        ) : similarity.length === 0 ? (
          <p className="text-ocean-600 text-sm">No similarity data available. Try syncing bookings first.</p>
        ) : (
          <div className="space-y-3">
            {similarity.map((pair, i) => (
              <div key={i} className="flex items-center gap-4 bg-ocean-50 rounded-lg px-5 py-3.5 hover:bg-ocean-100/80 transition-colors">
                <span className="text-xs font-bold text-ocean-400 w-5">#{i + 1}</span>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="bg-white border border-ocean-200 text-ocean-950 text-sm font-medium px-3 py-1 rounded-lg truncate">
                    {pair.class_a}
                  </span>
                  <div className="flex items-center gap-1 text-ocean-400 shrink-0">
                    <div className="w-6 h-px bg-ocean-300" />
                    <Network size={14} />
                    <div className="w-6 h-px bg-ocean-300" />
                  </div>
                  <span className="bg-white border border-ocean-200 text-ocean-950 text-sm font-medium px-3 py-1 rounded-lg truncate">
                    {pair.class_b}
                  </span>
                </div>
                <span className="bg-ocean-900 text-white text-xs font-bold px-3 py-1 rounded-full shrink-0">
                  {pair.shared_members} shared
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* member network modal */}
      <Modal
        open={activeModal === 'network'}
        onClose={closeModal}
        icon={Network}
        title="Member Social Network"
        subtitle="Shows other members who attend the same classes"
        wide
      >
        <SelectDropdown
          value={netIdInput}
          onChange={handleNetSelect}
          options={memberOptions}
          placeholder="Select a member..."
          loading={listsLoading}
        />
        {netLoading && (
          <div className="flex items-center gap-2 text-ocean-600 text-sm py-4">
            <Loader2 size={16} className="animate-spin" /> loading...
          </div>
        )}
        {netError && (
          <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg mb-4">{netError}</p>
        )}
        {network && !netLoading && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium text-ocean-950">
                Network for Member #{network.member_id}
              </span>
              <span className="text-xs bg-ocean-100 text-ocean-900 px-2 py-0.5 rounded-full">
                {network.network?.length || 0} connection{network.network?.length !== 1 ? 's' : ''}
              </span>
            </div>
            {network.network?.length === 0 ? (
              <p className="text-ocean-600 text-sm">No connections found for this member.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {network.network.map((conn, i) => (
                  <div key={i} className="flex items-center gap-3 bg-ocean-50 rounded-lg px-4 py-3 hover:bg-ocean-100/80 transition-colors">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg, #2F4BF5, #48CAE4)' }}
                    >
                      {conn.member_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-ocean-950 font-medium text-sm truncate">{conn.member_name}</p>
                      <p className="text-ocean-600 text-xs">ID: {conn.member_id}</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full shrink-0">
                      {conn.shared_classes} shared class{conn.shared_classes !== 1 ? 'es' : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
