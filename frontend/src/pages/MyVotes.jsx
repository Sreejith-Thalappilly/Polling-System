import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePolls } from '../contexts/PollContext';
import { BarChart3, Clock, User, ArrowRight } from 'lucide-react';

const MyVotes = () => {
  const { myVotes, loading, fetchMyVotes } = usePolls();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMyVotes();
  }, []);

  const filteredVotes = myVotes.filter(vote => {
    switch (filter) {
      case 'recent':
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return new Date(vote.createdAt) > oneWeekAgo;
      case 'expired':
        return vote.poll?.isExpired;
      case 'active':
        return vote.poll?.canVote;
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
        <p>Loading your votes...</p>
      </div>
    );
  }

  return (
    <div className="my-votes">
      <div className="page-header">
        <h1>My Votes</h1>
        <p>View all the polls you've participated in</p>
      </div>

      <div className="votes-filters">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Votes ({myVotes.length})
          </button>
          <button
            className={`filter-btn ${filter === 'recent' ? 'active' : ''}`}
            onClick={() => setFilter('recent')}
          >
            Recent
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active Polls
          </button>
          <button
            className={`filter-btn ${filter === 'expired' ? 'active' : ''}`}
            onClick={() => setFilter('expired')}
          >
            Expired Polls
          </button>
        </div>
      </div>

      <div className="votes-list">
        {filteredVotes.length === 0 ? (
          <div className="empty-state">
            <BarChart3 className="empty-icon" />
            <h3>No votes found</h3>
            <p>
              {filter === 'all' 
                ? "You haven't voted on any polls yet." 
                : `No ${filter} votes found.`
              }
            </p>
            <Link to="/dashboard" className="btn btn-primary">
              Browse Polls
            </Link>
          </div>
        ) : (
          filteredVotes.map(vote => (
            <div key={vote.id} className="vote-card">
              <div className="vote-header">
                <div className="vote-poll-info">
                  <h3 className="vote-poll-title">{vote.poll?.title}</h3>
                  <div className="vote-meta">
                    <span className="vote-author">
                      <User className="meta-icon" />
                      {vote.poll?.createdBy?.firstName} {vote.poll?.createdBy?.lastName}
                    </span>
                    <span className="vote-date">
                      <Clock className="meta-icon" />
                      Voted {formatDate(vote.createdAt)}
                    </span>
                  </div>
                </div>
                
                <div className="vote-status">
                  <span className={`status-badge ${vote.poll?.isExpired ? 'expired' : 'active'}`}>
                    {vote.poll?.isExpired ? 'Expired' : 'Active'}
                  </span>
                  {!vote.poll?.isExpired && (
                    <span className="time-remaining">
                      {getTimeRemaining(vote.poll?.expiresAt)}
                    </span>
                  )}
                </div>
              </div>

              <div className="vote-content">
                <div className="vote-selection">
                  <strong>Your vote:</strong> {vote.selectedOption}
                </div>
                
                {vote.poll?.description && (
                  <p className="vote-description">{vote.poll.description}</p>
                )}

                {vote.poll?.results && (
                  <div className="vote-results">
                    <h4>Current Results:</h4>
                    <div className="results-preview">
                      {vote.poll.results.slice(0, 3).map((result, index) => (
                        <div key={index} className="result-preview-item">
                          <span className="result-option">{result.option}</span>
                          <span className="result-percentage">{result.percentage}%</span>
                        </div>
                      ))}
                      {vote.poll.results.length > 3 && (
                        <div className="more-results">
                          +{vote.poll.results.length - 3} more options
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="vote-actions">
                <Link to={`/poll/${vote.poll?.id}`} className="btn btn-outline btn-small">
                  View Full Results
                  <ArrowRight className="btn-icon" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyVotes;
