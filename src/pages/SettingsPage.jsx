import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLeague } from '../contexts/LeagueContext.jsx';
import { LogOut, AlertTriangle } from 'lucide-react';
import { updateEmail, updatePassword } from 'firebase/auth';
import { auth } from '../config/firebase.js';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { updateUserMetadata, deleteUser } = useLeague();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (email !== user.email) {
        await updateEmail(auth.currentUser, email);
      }
      if (password) {
        await updatePassword(auth.currentUser, password);
      }
      await updateUserMetadata(user.id, { displayName, username, email, profileImage });
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (deleteConfirm === 'DELETE MY ACCOUNT') {
      await deleteUser(user.id);
      signOut();
    }
  };

  return (
    <PageTransition>
      <div className="page stack-xl">
        <div className="page-header stack-xs">
          <h1 className="page-title">Settings</h1>
        </div>

        <div className="card stack-md">
          <h3 className="font-bold">Profile Details</h3>
          
          {error && <div className="text-red text-sm">{error}</div>}
          {success && <div className="text-gold text-sm">{success}</div>}

          <div className="stack-sm">
            <label className="input-label">Profile Image URL</label>
            <input className="input" value={profileImage} onChange={e => setProfileImage(e.target.value)} placeholder="https://..." />

            <label className="input-label" style={{ marginTop: 8 }}>Full Name</label>
            <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            
            <label className="input-label" style={{ marginTop: 8 }}>Username</label>
            <input className="input" value={username} onChange={e => setUsername(e.target.value)} />

            <label className="input-label" style={{ marginTop: 8 }}>Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />

            <label className="input-label" style={{ marginTop: 8 }}>New Password (leave blank to keep)</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New Password" />
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="card stack-md border-red">
          <h3 className="font-bold text-red row" style={{ gap: 8 }}><AlertTriangle size={18}/> Danger Zone</h3>
          <p className="text-sm text-secondary">Deleting your account is permanent. This will remove your matches, trophies, and stats.</p>
          <div className="stack-sm">
            <label className="input-label">Type "DELETE MY ACCOUNT" to confirm</label>
            <input className="input" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="DELETE MY ACCOUNT" />
          </div>
          <button className="btn btn-danger" onClick={handleDelete} disabled={deleteConfirm !== 'DELETE MY ACCOUNT'}>
            Delete Account
          </button>
        </div>

        <button className="btn btn-secondary btn-full row" onClick={signOut} style={{ gap: 8 }}>
          <LogOut size={18}/> Sign Out
        </button>
      </div>
    </PageTransition>
  );
}
