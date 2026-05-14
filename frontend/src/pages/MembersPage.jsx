import { useState } from 'react';
import { Users, Search, Plus, X, Mail, Phone, CreditCard, Calendar } from 'lucide-react';

const dummyMembers = [
  { member_id: 1, fullname: 'John Doe', email: 'john@gym.com', phone: '08123456789', plan_type: 'Premium', membership_expiry: '2025-12-31', payment_status: 'paid' },
  { member_id: 2, fullname: 'Jane Smith', email: 'jane@gym.com', phone: '08198765432', plan_type: 'Basic', membership_expiry: '2025-06-15', payment_status: 'paid' },
  { member_id: 3, fullname: 'Alex Johnson', email: 'alex@gym.com', phone: '08112233445', plan_type: 'Premium', membership_expiry: '2025-03-01', payment_status: 'unpaid' },
  { member_id: 4, fullname: 'Maria Garcia', email: 'maria@gym.com', phone: '08155667788', plan_type: 'Basic', membership_expiry: '2025-09-20', payment_status: 'paid' },
];

export default function MembersPage() {
  const [members] = useState(dummyMembers);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = members.filter(m =>
    m.fullname.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ocean-100 flex items-center gap-3">
            <Users size={32} className="text-ocean-400" />
            Members
          </h1>
          <p className="text-ocean-300 mt-1">Manage gym members and memberships</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-ocean-500 hover:bg-ocean-400 text-ocean-950 font-semibold rounded-lg transition-colors cursor-pointer"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'Add Member'}
        </button>
      </div>

      {/* Add Member Form */}
      {showForm && (
        <div className="bg-ocean-900/50 border border-ocean-700/30 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-ocean-100 mb-4">Register New Member</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Full Name" className="px-4 py-2.5 bg-ocean-950 border border-ocean-700/40 rounded-lg text-ocean-100 placeholder-ocean-400 focus:outline-none focus:border-ocean-500" />
            <input type="email" placeholder="Email" className="px-4 py-2.5 bg-ocean-950 border border-ocean-700/40 rounded-lg text-ocean-100 placeholder-ocean-400 focus:outline-none focus:border-ocean-500" />
            <input type="tel" placeholder="Phone" className="px-4 py-2.5 bg-ocean-950 border border-ocean-700/40 rounded-lg text-ocean-100 placeholder-ocean-400 focus:outline-none focus:border-ocean-500" />
            <select className="px-4 py-2.5 bg-ocean-950 border border-ocean-700/40 rounded-lg text-ocean-100 focus:outline-none focus:border-ocean-500">
              <option value="">Select Plan</option>
              <option value="Basic">Basic</option>
              <option value="Premium">Premium</option>
            </select>
            <input type="date" placeholder="Expiry Date" className="px-4 py-2.5 bg-ocean-950 border border-ocean-700/40 rounded-lg text-ocean-100 focus:outline-none focus:border-ocean-500" />
            <input type="password" placeholder="Password" className="px-4 py-2.5 bg-ocean-950 border border-ocean-700/40 rounded-lg text-ocean-100 placeholder-ocean-400 focus:outline-none focus:border-ocean-500" />
          </div>
          <button className="mt-4 px-6 py-2.5 bg-ocean-500 hover:bg-ocean-400 text-ocean-950 font-semibold rounded-lg transition-colors cursor-pointer">
            Register
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
          placeholder="Search members..."
          className="w-full pl-11 pr-4 py-2.5 bg-ocean-900/40 border border-ocean-700/30 rounded-lg text-ocean-100 placeholder-ocean-400 focus:outline-none focus:border-ocean-500"
        />
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(member => (
          <div key={member.member_id} className="bg-ocean-900/40 border border-ocean-700/20 rounded-xl p-5 hover:border-ocean-500/40 transition-all">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-ocean-100">{member.fullname}</h3>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                member.payment_status === 'paid'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {member.payment_status}
              </span>
            </div>
            <div className="space-y-1.5 text-sm text-ocean-300">
              <p className="flex items-center gap-2"><Mail size={14} /> {member.email}</p>
              <p className="flex items-center gap-2"><Phone size={14} /> {member.phone}</p>
              <p className="flex items-center gap-2"><CreditCard size={14} /> {member.plan_type}</p>
              <p className="flex items-center gap-2"><Calendar size={14} /> Expires: {member.membership_expiry}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
