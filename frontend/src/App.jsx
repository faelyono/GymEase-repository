import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import MembersPage from './pages/MembersPage';
import TrainersPage from './pages/TrainersPage';
import ClassesPage from './pages/ClassesPage';
import BookingsPage from './pages/BookingsPage';
import AttendancePage from './pages/AttendancePage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('gymease_token') || '');

  const handleLogout = () => {
    localStorage.removeItem('gymease_token');
    setToken('');
  };

  // not logged in, show login splash
  if (!token) {
    return <Dashboard onLogin={(t) => setToken(t)} isLoggedIn={false} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard isLoggedIn={true} onLogout={handleLogout} />} />
        <Route element={<Layout onLogout={handleLogout} />}>
          <Route path="/profile" element={<MembersPage />} />
          <Route path="/trainers" element={<TrainersPage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
