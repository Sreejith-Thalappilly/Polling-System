import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Plus, BarChart3, Home } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-brand">
          <BarChart3 className="nav-icon" />
          Polling System
        </Link>
        
        <div className="nav-menu">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">
                <Home className="nav-link-icon" />
                Dashboard
              </Link>
              
              {isAdmin && (
                <Link to="/create-poll" className="nav-link">
                  <Plus className="nav-link-icon" />
                  Create Poll
                </Link>
              )}
              
              <Link to="/my-votes" className="nav-link">
                <BarChart3 className="nav-link-icon" />
                My Votes
              </Link>
              
              <div className="nav-user">
                <User className="nav-user-icon" />
                <span className="nav-user-name">
                  {user.firstName} {user.lastName}
                </span>
                <span className={`nav-user-role ${user.role}`}>
                  {user.role}
                </span>
              </div>
              
              <button onClick={handleLogout} className="nav-logout">
                <LogOut className="nav-link-icon" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
