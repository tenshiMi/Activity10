import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Navbar from './components/Navbar';

// Attendee Pages
import Home from './pages/attendee/Home';
import EventDetails from './pages/attendee/EventDetails';
import MyTickets from './pages/attendee/MyTickets';

// Organizer Pages
import DashboardLayout from './components/DashboardLayout';
import OrganizerDashboard from './pages/organizer/Dashboard';
import CreateEvent from './pages/organizer/CreateEvent';
import Attendees from './pages/organizer/Attendees';
import ScannerPage from './pages/organizer/Scanner';

// ADMIN Pages (NEW)
import AdminLayout from './components/AdminLayout';
import ManageUsers from './pages/admin/ManageUsers';
import Reports from './pages/admin/Reports';

function App() {
  return (
    <BrowserRouter>
    <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* === ATTENDEE ROUTES === */}
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<EventDetails />} />
        <Route path="/my-tickets" element={<MyTickets />} />

        {/* === ORGANIZER ROUTES === */}
        <Route path="/organizer" element={<DashboardLayout />}>
          <Route index element={<OrganizerDashboard />} />
          <Route path="create" element={<CreateEvent />} />
          <Route path="attendees" element={<Attendees />} />
        </Route>
        <Route path="/organizer/scan" element={<ScannerPage />} />

        {/* === ADMIN ROUTES (NEW) === */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Admin Home reuses the Organizer Dashboard component for viewing events */}
          <Route index element={<OrganizerDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="reports" element={<Reports />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;