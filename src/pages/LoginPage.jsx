import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlowEffect from '../components/GlowEffect.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        await signUp(email, password, displayName, username);
      } else {
        await signIn(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page center" style={{ minHeight: '100dvh', position: 'relative' }}>
      <GlowEffect />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="stack-xl" 
        style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}
      >
        <div className="text-center stack-sm">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            style={{ width: 80, height: 80, margin: '0 auto', background: 'var(--bg-elevated)', borderRadius: '22px', border: '2px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px var(--gold-glow)' }}
          >
            <img src="/favicon.svg" alt="Ladder" style={{ width: '100%', height: '100%', borderRadius: '20px' }} />
          </motion.div>
          <h1 className="text-3xl font-black tracking-tight" style={{ marginTop: 16, letterSpacing: '0.05em' }}>LADDER</h1>
          <p className="text-secondary tracking-widest uppercase text-xs font-bold">Private Club</p>
        </div>

        <form onSubmit={handleSubmit} className="card-glass stack-lg" style={{ padding: 32 }}>
          {error && <div className="badge badge-red" style={{ textAlign: 'center' }}>{error}</div>}
          
          {isSignUp && (
            <>
              <div className="stack-xs">
                <label className="input-label">Full Name</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Alexander Volkov"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="stack-xs">
                <label className="input-label">Username</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="alexv"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="stack-xs">
            <label className="input-label">Email</label>
            <input 
              type="email" 
              className="input" 
              placeholder="member@ladder.club"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="stack-xs">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className="input" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 8 }}>
            {isSignUp ? 'Create Account' : 'Enter'}
          </button>

          <button type="button" className="btn btn-ghost btn-full" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Already have an account? Sign in' : 'Request membership'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
