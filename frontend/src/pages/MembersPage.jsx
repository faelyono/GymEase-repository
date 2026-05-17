import { useState, useEffect } from 'react';
import { Users, Mail, Phone, CreditCard, Calendar, Shield, TrendingUp, Sparkles } from 'lucide-react';

const API = 'http://localhost:3000/api/auth';
const API_ATTENDANCE = 'http://localhost:3000/api/attendance';
const API_GRAPH = 'http://localhost:3000/api/graph';

export default function MembersPage() {
  const token = localStorage.getItem('gymease_token') || '';
  const [profile, setProfile] = useState(null);
  const [attendanceRate, setAttendanceRate] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setProfile(data);
      fetchAttendanceRate(data.member_id);
      fetchRecommendations(data.member_id);
    } catch (err) { }
    finally { setLoading(false); }
  };

  const fetchAttendanceRate = async (memberId) => {
    try {
      const res = await fetch(`${API_ATTENDANCE}/rate/member/${memberId}`);
      const data = await res.json();
      if (data.success) setAttendanceRate(data.data);
    } catch (err) { }
  };

  const fetchRecommendations = async (memberId) => {
    try {
      const res = await fetch(`${API_GRAPH}/recommend/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setRecommendations(data.recommendations || []);
    } catch (err) { }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-ocean-700">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ocean-950 flex items-center gap-3">
          <Users size={32} className="text-ocean-400" />
          My Profile
        </h1>
        <p className="text-ocean-700 mt-1">Your membership details</p>
      </div>

      {profile && (
        <div className="bg-white border border-ocean-200 rounded-xl p-8 shadow-sm">
          {/* status badge */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-ocean-950">{profile.fullname}</h2>
            <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${
              profile.status_aktif === 'ACTIVE'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700'
            }`}>
              <Shield size={14} />
              {profile.status_aktif}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-ocean-700">
                <Mail size={18} className="text-ocean-900" />
                <div>
                  <p className="text-xs text-ocean-600">Email</p>
                  <p className="text-ocean-950 font-medium">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-ocean-700">
                <Phone size={18} className="text-ocean-900" />
                <div>
                  <p className="text-xs text-ocean-600">Phone</p>
                  <p className="text-ocean-950 font-medium">{profile.phone || '—'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-ocean-700">
                <CreditCard size={18} className="text-ocean-900" />
                <div>
                  <p className="text-xs text-ocean-600">Plan</p>
                  <p className="text-ocean-950 font-medium">{profile.plan_type || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-ocean-700">
                <Calendar size={18} className="text-ocean-900" />
                <div>
                  <p className="text-xs text-ocean-600">Expires</p>
                  <p className="text-ocean-950 font-medium">
                    {profile.membership_expiry ? new Date(profile.membership_expiry).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* payment stuff and attendance */}
          <div className="mt-6 pt-6 border-t border-ocean-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ocean-700">Payment Status</span>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                profile.payment_status === 'paid'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {profile.payment_status}
              </span>
            </div>
            {attendanceRate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-ocean-700 flex items-center gap-1.5">
                  <TrendingUp size={14} />
                  Attendance Rate
                </span>
                <span className="text-sm font-semibold px-3 py-1 rounded-full bg-ocean-100 text-ocean-900">
                  {attendanceRate.attendance_rate_percent || 0}% ({attendanceRate.total_attended}/{attendanceRate.total_bookings} classes)
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* recommended classes */}
      {recommendations.length > 0 && (
        <div className="mt-6 bg-white border border-ocean-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-ocean-950 mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-ocean-400" />
            Recommended Classes
          </h3>
          <p className="text-sm text-ocean-700 mb-3">Based on what similar members are booking</p>
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-center justify-between bg-ocean-50 rounded-lg px-4 py-3">
                <div>
                  <p className="text-ocean-950 font-medium">{rec.class_name}</p>
                  <p className="text-ocean-700 text-xs">by {rec.trainer_name || 'Unknown'}</p>
                </div>
                <span className="text-xs bg-ocean-100 text-ocean-900 px-2 py-0.5 rounded-full font-medium">
                  {rec.recommended_by_count} member{rec.recommended_by_count > 1 ? 's' : ''} also booked
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
