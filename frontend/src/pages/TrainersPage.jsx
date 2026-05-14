import { useState } from 'react';
import { Dumbbell, Plus, X, Search, Pencil, Trash2 } from 'lucide-react';

const dummyTrainers = [
  { trainer_id: 1, name: 'Mike Tyson', specialization: 'Boxing', class_count: 3 },
  { trainer_id: 2, name: 'Sarah Connor', specialization: 'CrossFit', class_count: 2 },
  { trainer_id: 3, name: 'Bruce Lee', specialization: 'Martial Arts', class_count: 5 },
  { trainer_id: 4, name: 'Arnold Classic', specialization: 'Bodybuilding', class_count: 4 },
];

export default function TrainersPage() {
  const [trainers] = useState(dummyTrainers);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = trainers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.specialization.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ocean-100 flex items-center gap-3">
            <Dumbbell size={32} className="text-ocean-400" />
            Trainers
          </h1>
          <p className="text-ocean-300 mt-1">Manage gym trainers and their specializations</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-ocean-500 hover:bg-ocean-400 text-ocean-950 font-semibold rounded-lg transition-colors cursor-pointer"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'Add Trainer'}
        </button>
      </div>

      {/* Add Trainer Form */}
      {showForm && (
        <div className="bg-ocean-900/50 border border-ocean-700/30 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-ocean-100 mb-4">New Trainer</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Trainer Name" className="px-4 py-2.5 bg-ocean-950 border border-ocean-700/40 rounded-lg text-ocean-100 placeholder-ocean-400 focus:outline-none focus:border-ocean-500" />
            <input type="text" placeholder="Specialization" className="px-4 py-2.5 bg-ocean-950 border border-ocean-700/40 rounded-lg text-ocean-100 placeholder-ocean-400 focus:outline-none focus:border-ocean-500" />
          </div>
          <button className="mt-4 px-6 py-2.5 bg-ocean-500 hover:bg-ocean-400 text-ocean-950 font-semibold rounded-lg transition-colors cursor-pointer">
            Create Trainer
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
          placeholder="Search trainers..."
          className="w-full pl-11 pr-4 py-2.5 bg-ocean-900/40 border border-ocean-700/30 rounded-lg text-ocean-100 placeholder-ocean-400 focus:outline-none focus:border-ocean-500"
        />
      </div>

      {/* Trainers Table */}
      <div className="bg-ocean-900/30 border border-ocean-700/20 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ocean-700/30">
              <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-300">Name</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-300">Specialization</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-ocean-300">Classes</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-ocean-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(trainer => (
              <tr key={trainer.trainer_id} className="border-b border-ocean-700/10 hover:bg-ocean-700/10 transition-colors">
                <td className="px-6 py-4 text-ocean-100 font-medium">{trainer.name}</td>
                <td className="px-6 py-4 text-ocean-300">{trainer.specialization}</td>
                <td className="px-6 py-4">
                  <span className="bg-ocean-500/20 text-ocean-400 text-xs font-medium px-2.5 py-1 rounded-full">
                    {trainer.class_count} classes
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-ocean-300 hover:text-ocean-100 hover:bg-ocean-700/30 rounded-lg transition-colors cursor-pointer">
                    <Pencil size={16} />
                  </button>
                  <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors ml-1 cursor-pointer">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
