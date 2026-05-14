import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import MembersPage from './pages/MembersPage';
import TrainersPage from './pages/TrainersPage';
import ClassesPage from './pages/ClassesPage';
import BookingsPage from './pages/BookingsPage';
import AttendancePage from './pages/AttendancePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route element={<Layout />}>
          <Route path="/members" element={<MembersPage />} />
          <Route path="/trainers" element={<TrainersPage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
