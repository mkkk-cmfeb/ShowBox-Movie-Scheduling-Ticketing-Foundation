import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Sabhi Components aur Pages ke Imports
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Auth from './pages/Auth.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import BookTicket from './pages/BookTicket.jsx';
import SeatSelection from './pages/SeatSelection.jsx';
import MyBookings from './pages/MyBookings.jsx';
import MyTickets from './pages/MyTickets.jsx';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/book/:id" element={<BookTicket />} /> 
        <Route path="/seats/:showId" element={<SeatSelection />} />
        <Route path="/my-tickets-qr" element={<MyTickets />} />
        
        {/* User Routes */}
        <Route path="/my-tickets" element={<MyBookings />} />
        
        {/* Admin Protected Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        /> 
      </Routes>
    </BrowserRouter>
  );
}

export { App }; 
export default App;