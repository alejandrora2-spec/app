import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, LogOut, BarChart3, Home } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <Activity className="w-8 h-8" />
              <span className="text-xl font-bold">HealthTrack</span>
            </div>
            
            {user && (
              <div className="hidden md:flex space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive('/dashboard') 
                      ? 'bg-white/30 backdrop-blur-sm' 
                      : 'hover:bg-white/20'
                  }`}
                  data-testid="nav-dashboard-btn"
                >
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                
                <button
                  onClick={() => navigate('/monthly-report')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive('/monthly-report') 
                      ? 'bg-white/30 backdrop-blur-sm' 
                      : 'hover:bg-white/20'
                  }`}
                  data-testid="nav-reports-btn"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Reportes</span>
                </button>
              </div>
            )}
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm">
                <div className="font-semibold">{user.name}</div>
                <div className="text-xs text-white/80">{user.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4" />
                <span>Salir</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
