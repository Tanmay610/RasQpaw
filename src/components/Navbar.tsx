import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, Menu, X, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <HeartPulse className="h-8 w-8 text-brand-600" />
              <span className="font-bold text-xl text-slate-900 tracking-tight">ResQPaw</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            <Link to="/how-it-works" className="text-slate-500 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors">How it Works</Link>
            <Link to="/rescue-map" className="text-slate-500 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors">Rescue Map</Link>
            <Link to="/diagnosis" className="text-slate-500 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1">
              Diagnosis <span className="px-1.5 py-0.5 rounded-md bg-brand-100 text-brand-700 text-[10px] font-bold tracking-wider">AI</span>
            </Link>
            
            {user ? (
              <div className="flex items-center gap-4 ml-4">
                <Link to={user.role === 'rescuer' ? '/rescuer/dashboard' : '/my-reports'} className="text-brand-600 font-medium text-sm">
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 bg-slate-100 rounded-full py-1 px-3">
                  <UserIcon size={16} className="text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">{user.name}</span>
                </div>
                <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-slate-700">Logout</button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-slate-500 hover:text-slate-900 text-sm font-medium">Login</Link>
                <Link to="/register" className="bg-brand-600 text-white hover:bg-brand-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex items-center sm:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-500 hover:text-slate-900">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="sm:hidden bg-white border-t border-slate-100">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/how-it-works" className="block px-4 py-2 text-base font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50">How it Works</Link>
            <Link to="/rescue-map" className="block px-4 py-2 text-base font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50">Rescue Map</Link>
            <Link to="/diagnosis" className="block px-4 py-2 text-base font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50">AI Diagnosis</Link>
            
            {user ? (
              <>
                <Link to={user.role === 'rescuer' ? '/rescuer/dashboard' : '/my-reports'} className="block px-4 py-2 text-base font-medium text-brand-600 hover:bg-slate-50">Dashboard</Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-base font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-4 py-2 text-base font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50">Login</Link>
                <Link to="/register" className="block px-4 py-2 text-base font-medium text-brand-600 hover:bg-slate-50">Sign Up</Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};
