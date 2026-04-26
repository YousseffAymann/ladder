import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from './contexts/AuthContext.jsx';
import Layout from './components/Layout.jsx';

const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const AddMatchPage = lazy(() => import('./pages/AddMatchPage.jsx'));
const StatsPage = lazy(() => import('./pages/StatsPage.jsx'));
const TournamentsPage = lazy(() => import('./pages/TournamentsPage.jsx'));
const TrophyCasePage = lazy(() => import('./pages/TrophyCasePage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'));
const MatchHistoryPage = lazy(() => import('./pages/MatchHistoryPage.jsx'));

function RequireAuth({ children }) {
  const { user, loading, signOut } = useAuth();
  if (loading) return <div className="page center text-gold">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (user.status === 'pending') {
    return (
      <div className="page center text-center stack-lg" style={{ minHeight: '100dvh' }}>
        <div style={{ width: 80, height: 80, margin: '0 auto', background: 'var(--bg-elevated)', borderRadius: '22px', border: '2px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px var(--gold-glow)' }}>
          <img src="/favicon.svg" alt="Ladder" style={{ width: '100%', height: '100%', borderRadius: '20px' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Membership Pending</h1>
          <p className="text-secondary" style={{ marginTop: 8 }}>Your request is currently being reviewed by an administrator. You will gain access once approved.</p>
        </div>
        <button className="btn btn-secondary" onClick={signOut}>Sign Out</button>
      </div>
    );
  }
  
  return children;
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || !user.isAdmin) return <Navigate to="/" />;
  return children;
}

export default function App() {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="page center" style={{ minHeight: '100dvh', background: 'var(--bg-primary)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, filter: ['drop-shadow(0 0 10px rgba(212,168,83,0.1))', 'drop-shadow(0 0 30px rgba(212,168,83,0.4))', 'drop-shadow(0 0 10px rgba(212,168,83,0.1))'] }}
          transition={{ 
            opacity: { duration: 0.8, ease: "easeOut" },
            scale: { duration: 1.2, ease: "easeOut" },
            filter: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{ width: 100, height: 100, borderRadius: '24px', background: 'var(--bg-elevated)', border: '2px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <img src="/favicon.svg" alt="Ladder" style={{ width: '100%', height: '100%', borderRadius: '22px' }} />
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<div className="page center text-gold">Loading...</div>}>
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          
          <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
            <Route index element={<HomePage />} />
            <Route path="match" element={<AddMatchPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="tournaments" element={<TournamentsPage />} />
            <Route path="trophies" element={<TrophyCasePage />} />
            <Route path="history" element={<MatchHistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}
