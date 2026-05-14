import { useState } from 'react';
import { CalendarDays, Plus, X, Search, Pencil, Trash2, Clock, Users } from 'lucide-react';

const dummyClasses = [
  { class_id: 1, class_name: 'Morning Yoga', trainer_name: 'Sarah Connor', schedule: '2025-06-10T07:00:00', capacity: 20 },
  { class_id: 2, class_name: 'Boxing Basics', trainer_name: 'Mike Tyson', schedule: '2025-06-10T09:00:00', capacity: 15 },
  { class_id: 3, class_name: 'HIIT Blast', trainer_name: 'Arnold Classic', schedule: '2025-06-10T11:00:00', capacity: 25 },
  { class_id: 4, class_name: 'Kung Fu', trainer_name: 'Bruce Lee', schedule: '2025-06-11T08:00:00', capacity: 18 },
  { class_id: 5, class_name: 'Spin Class', trainer_name: 'Sarah Connor', schedule: '2025-06-11T10:00:00', capacity: 30 },
  { class_id: 6, class_name: 'Body Pump', trainer_name: 'Arnold Classic', schedule: '2025-06-12T14:00:00', capacity: 22 },
];

export default function ClassesPage() {
  const [classes] = useState(dummyClasses);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = classes.filter(c =>
    c.class_name.toLowerCase().includes(search.toLowerCase()) ||
    c.trainer_name.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ocean-100 flex items-center gap-3">
            <CalendarDays size={32} className="text-ocean-400" />
            Classes
          </h1>
          <p className="text-ocean-300 mt-1">Schedule and manage gym classes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-ocean-500 hover:bg-ocean-400 text-ocean-950 font-semibold rounded-lg transition-colors cursor-pointer"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'Add Class'}
        </button>
      </div>

      {/* Add Class Form */}
      {showForm && (
        <div className="bg-ocean-900/50 border border-ocean-700/30 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-ocean-100 mb-4">New Class</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Class Name" className="px-4 py-2.5 bg-ocean-950 border border-ocean-700/40 rounded-lg text-ocean-100 placeholder-ocean-400 focus:outline-none focus:border-ocean-500" />
            <select className="px-4 py-2.5 bg-ocean-950 border border-ocean-700/40 rounded-lg text-ocean-100 focus:outline-none focus:border-ocean-500">
              <option value="">Select Trainer</option>
              <option value="1">Mike Tyson</option>
              <option value="2">Sarah Connor</option>
              <option value="3">Bruce Lee</option>
              <option value="4">Arnold Classic</option>
            </select>
            <input type="datetime-local" className="px-4 py-2.5 bg-ocean-950 border border-ocean-700/40 rounded-lg text-ocean-100 focus:outline-none focus:border-ocean-500" />
            <input type="number" placeholder="Capacity" className="px-4 py-2.5 bg-ocean-950 border border-ocean-700/40 rounded-lg text-ocean-100 placeholder-ocean-400 focus:outline-none focus:border-ocean-500" />
          </div>
          <button className="mt-4 px-6 py-2.5 bg-ocean-500 hover:bg-ocean-400 text-ocean-950 font-semibold rounded-lg transition-colors cursor-pointer">
            Create Class
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ocean-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search classes..."
          className="w-full pl-11 pr-4 py-2.5 bg-ocean-900/40 border border-ocean-700/30 rounded-lg text-ocean-100 placeholder-ocean-400 focus:outline-none focus:border-ocean-500"
        />
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(cls => (
          <div key={cls.class_id} className="bg-ocean-900/40 border border-ocean-700/20 rounded-xl p-5 hover:border-ocean-500/40 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-ocean-100">{cls.class_name}</h3>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-ocean-300 hover:text-ocean-100 hover:bg-ocean-700/30 rounded-lg transition-colors cursor-pointer">
                  <Pencil size={14} />
                </button>
                <button className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-ocean-400 text-sm mb-3">by {cls.trainer_name}</p>
            <div className="flex items-center gap-4 text-sm text-ocean-300">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-ocean-500" />
                {formatDate(cls.schedule)} · {formatTime(cls.schedule)}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-ocean-300">
              <Users size={14} className="text-ocean-500" />
              Capacity: {cls.capacity}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
