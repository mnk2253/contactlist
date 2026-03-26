import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { PublicPage } from './pages/PublicPage';
import { EventsPage } from './pages/EventsPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<PublicPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        
        <footer className="mt-20 border-t border-zinc-200 bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-6 flex justify-center gap-6">
              <Link to="/" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">Contact List</Link>
              <Link to="/events" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">Life Events</Link>
              <Link to="/admin" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">Admin Panel</Link>
            </div>
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} Sreedashganti Contact List. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
