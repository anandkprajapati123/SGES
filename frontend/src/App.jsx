import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context & Safeguard
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Page Components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import TripDetails from './pages/TripDetails';
import AddExpense from './pages/AddExpense';
import ExpenseHistory from './pages/ExpenseHistory';
import Settlement from './pages/Settlement';
import Notifications from './pages/Notifications';
import JoinTrip from './pages/JoinTrip';

function App() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Pages that should NOT display the sidebar or standard dashboard wrapper
  const isOuterPage = ['/', '/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Toast Alert popup notifier */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={theme === 'dark' ? 'dark' : 'light'}
      />

      {/* Navbar - Sticky on Top */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Main shell: Sidebar + Content */}
      <div className="flex flex-1 relative min-h-[calc(100vh-4rem)]">
        
        {/* Sidebar - Visible on Desktop, Slide Drawer on Mobile */}
        {user && !isOuterPage && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        {/* Dynamic Page Content viewport */}
        <main className={`flex-1 min-w-0 ${user && !isOuterPage ? 'lg:px-8' : ''}`}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected MERN application routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-trip" element={<CreateTrip />} />
              <Route path="/trips/:id" element={<TripDetails />} />
              <Route path="/add-expense" element={<AddExpense />} />
              <Route path="/edit-expense/:id" element={<AddExpense />} />
              <Route path="/expense-history" element={<ExpenseHistory />} />
              <Route path="/trips/:id/settlement" element={<Settlement />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/join/:id" element={<JoinTrip />} />
            </Route>
          </Routes>
        </main>

      </div>
    </div>
  );
}

export default App;
