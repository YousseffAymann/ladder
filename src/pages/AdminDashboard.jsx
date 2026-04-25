import { useState } from 'react';
import { useLeague } from '../contexts/LeagueContext.jsx';
import PageTransition from '../components/PageTransition.jsx';
import GlowEffect from '../components/GlowEffect.jsx';
import { Check, X, Shield, Users, Trophy, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const { users, approveUser, rejectUser, banUser, updateUserRole, pendingMatches, verifyMatch } = useLeague();
  const [activeTab, setActiveTab] = useState('memberships');

  const pendingUsers = Object.values(users).filter(u => u.status === 'pending');
  const approvedUsers = Object.values(users).filter(u => u.status === 'approved');
  const disputedMatches = pendingMatches.filter(m => m.status === 'disputed');

  return (
    <PageTransition>
      <div className="page stack-xl" style={{ position: 'relative' }}>
        <GlowEffect color="rgba(212,168,83,0.05)" />

        <div className="page-header stack-sm" style={{ position: 'relative', zIndex: 1 }}>
          <div className="row" style={{ gap: 8 }}>
            <Shield size={24} color="var(--gold)" />
            <h1 className="page-title">Admin Console</h1>
          </div>
          <div className="page-subtitle">Master Control & Membership Review</div>
        </div>

        <div className="row" style={{ gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
          <button className={`btn ${activeTab === 'memberships' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('memberships')}>
            <Users size={16} /> Pending ({pendingUsers.length})
          </button>
          <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('users')}>
            Members
          </button>
          <button className={`btn ${activeTab === 'disputes' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('disputes')}>
            <AlertTriangle size={16} /> Disputes ({disputedMatches.length})
          </button>
        </div>

        <div className="stack-lg" style={{ position: 'relative', zIndex: 1 }}>
          {activeTab === 'memberships' && (
            <div className="stack-md">
              <h2 className="text-lg font-bold">Pending Applications</h2>
              {pendingUsers.length === 0 ? (
                <div className="text-secondary">No pending requests at this time.</div>
              ) : (
                pendingUsers.map(u => (
                  <div key={u.id} className="card stack-sm border-gold">
                    <div className="row-between">
                      <div>
                        <div className="font-bold">{u.displayName}</div>
                        <div className="text-xs text-secondary">@{u.username} | {u.email}</div>
                        <div className="text-xs text-tertiary" style={{ marginTop: 4 }}>Applied: {new Date(u.createdAt?.toDate()).toLocaleDateString()}</div>
                      </div>
                      <div className="row" style={{ gap: 8 }}>
                        <button className="btn btn-ghost btn-icon" style={{ color: 'var(--red)' }} onClick={() => rejectUser(u.id)} title="Reject">
                          <X size={20} />
                        </button>
                        <button className="btn btn-primary btn-icon" onClick={() => approveUser(u.id)} title="Approve">
                          <Check size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="stack-md">
              <h2 className="text-lg font-bold">Active Members</h2>
              {approvedUsers.map(u => (
                <div key={u.id} className="card row-between border-subtle">
                  <div className="row" style={{ gap: 12 }}>
                    <div className="avatar">{u.initials}</div>
                    <div>
                      <div className="font-bold">{u.displayName} {u.isAdmin && <span className="text-gold">(Admin)</span>}</div>
                      <div className="text-xs text-secondary">@{u.username}</div>
                    </div>
                  </div>
                  <div className="row" style={{ gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => updateUserRole(u.id, !u.isAdmin)}>
                      {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => banUser(u.id)}>
                      Ban
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'disputes' && (
            <div className="stack-md">
              <h2 className="text-lg font-bold">Reported Matches</h2>
              {disputedMatches.length === 0 ? (
                <div className="text-secondary">No disputes to resolve.</div>
              ) : (
                disputedMatches.map(m => (
                  <div key={m.id} className="card stack-sm border-red">
                    <div className="text-sm font-bold text-red">Disputed Match</div>
                    <div className="row-between text-sm">
                      <span>{users[m.player1Id]?.displayName} vs {users[m.player2Id]?.displayName}</span>
                      <span>{m.sets.map(s => `${s.p1Score}-${s.p2Score}`).join(', ')}</span>
                    </div>
                    <div className="row" style={{ gap: 8, marginTop: 8 }}>
                      <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => verifyMatch(m.id, false)}>Delete Match</button>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => verifyMatch(m.id, true)}>Force Approve</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
