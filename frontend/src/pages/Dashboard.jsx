import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePolls } from '../contexts/PollContext';
import { Plus, Clock, Users, BarChart3, Eye, EyeOff } from 'lucide-react';
import PollCard from '../components/PollCard';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const { polls, loading, fetchPolls, fetchMyVotes, myVotes } = usePolls();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchPolls();
    fetchMyVotes();
  }, []);

  const filteredPolls = polls.filter(poll => {
    switch (activeTab) {
      case 'active':
        return poll.canVote;
      case 'expired':
        return poll.isExpired;
      case 'my-votes':
        return myVotes.some(vote => vote.pollId === poll.id);
      default:
        return true;
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading polls...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user.firstName}!</h1>
          <p>Here are the latest polls and voting opportunities.</p>
        </div>
        
        {isAdmin && (
          <Link to="/create-poll" className="btn btn-primary">
            <Plus className="btn-icon" />
            Create New Poll
          </Link>
        )}
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <BarChart3 />
          </div>
          <div className="stat-content">
            <h3>{polls.length}</h3>
            <p>Total Polls</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Clock />
          </div>
          <div className="stat-content">
            <h3>{polls.filter(p => p.canVote).length}</h3>
            <p>Active Polls</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Users />
          </div>
          <div className="stat-content">
            <h3>{myVotes.length}</h3>
            <p>My Votes</p>
          </div>
        </div>
      </div>

      <div className="polls-section">
        <div className="section-header">
          <h2>Polls</h2>
          <div className="tab-buttons">
            <button
              className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Polls
            </button>
            <button
              className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active
            </button>
            <button
              className={`tab-button ${activeTab === 'expired' ? 'active' : ''}`}
              onClick={() => setActiveTab('expired')}
            >
              Expired
            </button>
            <button
              className={`tab-button ${activeTab === 'my-votes' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-votes')}
            >
              My Votes
            </button>
          </div>
        </div>

        <div className="polls-grid">
          {filteredPolls.length === 0 ? (
            <div className="empty-state">
              <BarChart3 className="empty-icon" />
              <h3>No polls found</h3>
              <p>
                {activeTab === 'all' 
                  ? 'No polls have been created yet.' 
                  : `No ${activeTab.replace('-', ' ')} polls found.`
                }
              </p>
              {isAdmin && activeTab === 'all' && (
                <Link to="/create-poll" className="btn btn-primary">
                  <Plus className="btn-icon" />
                  Create First Poll
                </Link>
              )}
            </div>
          ) : (
            filteredPolls.map(poll => (
              <PollCard key={poll.id} poll={poll} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
