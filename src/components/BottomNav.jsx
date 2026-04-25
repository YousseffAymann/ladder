import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, BarChart3, Trophy, Medal } from 'lucide-react';

const tabs = [
  { to: '/', icon: Home, label: 'Rankings' },
  { to: '/match', icon: PlusCircle, label: 'Record' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/tournaments', icon: Trophy, label: 'Cups' },
  { to: '/trophies', icon: Medal, label: 'Trophies' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" id="bottom-nav">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
