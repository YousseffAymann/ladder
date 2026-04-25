import { Outlet, Link } from 'react-router-dom';
import BottomNav from './BottomNav.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLeague } from '../contexts/LeagueContext.jsx';
import { LogOut, Users, Bell, Shield } from 'lucide-react';

export default function Layout() {
  const { user, signOut, isDemoMode, switchUser } = useAuth();
  const { getUserNotifications } = useLeague();
  const notifs = getUserNotifications(user?.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <header className="app-header" id="app-header">
        <div>
          <div className="app-logo" style={{ letterSpacing: '0.05em' }}>LADDER</div>
          <div className="app-league">Ladder Club</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {user?.isAdmin && (
            <Link to="/admin" className="btn btn-ghost btn-icon" style={{ color: 'var(--gold)' }}>
              <Shield size={20} />
            </Link>
          )}
          {notifs.length > 0 && (
            <div style={{ position: 'relative' }}>
              <Bell size={20} color="var(--gold)" />
              <span style={{
                position: 'absolute', top: -4, right: -4, width: 14, height: 14,
                borderRadius: '50%', background: 'var(--red)', fontSize: '0.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700,
              }}>{notifs.length}</span>
            </div>
          )}
          {isDemoMode && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => switchUser(user?.id === 'user-1' ? 'user-2' : 'user-1')}
              title="Switch demo user"
            >
              <Users size={16} />
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={signOut} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </header>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
