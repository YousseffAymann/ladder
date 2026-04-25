import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { LeagueProvider } from './contexts/LeagueContext.jsx';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LeagueProvider>
          <App />
        </LeagueProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
