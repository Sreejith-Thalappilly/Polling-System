import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Eye, EyeOff, BarChart3, User } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/Api';

const PollCard = ({ poll }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [isVoting, setIsVoting] = useState(false);

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

  const handleVote = async (pollId) => {
    if (!selectedOption) return;

    setIsVoting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/polls/${pollId}/vote`, {
        selectedOption
      });
      
      if (response.data.success) {
        // Refresh the page to show updated results
        window.location.reload();
      }
    } catch (error) {
      console.error('Voting failed:', error);
      alert(error.response?.data?.message || 'Failed to vote');
    } finally {
      setIsVoting(false);
    }
  };

  const hasUserVoted = poll.votes && poll.votes.some(vote => vote.userId === poll.user?.id);

  return (
    <div className={`poll-card ${poll.isExpired ? 'expired' : ''}`}>
      <div className="poll-header">
        <div className="poll-title-section">
          <h3 className="poll-title">{poll.title}</h3>
          <div className="poll-meta">
            <span className="poll-author">
              <User className="meta-icon" />
              {poll.createdBy?.firstName} {poll.createdBy?.lastName}
            </span>
            <span className="poll-date">
              <Clock className="meta-icon" />
              {formatDate(poll.createdAt)}
            </span>
          </div>
        </div>
        
        <div className="poll-status">
          <span className={`status-badge ${poll.isExpired ? 'expired' : 'active'}`}>
            {poll.isExpired ? 'Expired' : 'Active'}
          </span>
          {poll.visibility === 'private' && (
            <span className="visibility-badge private">
              <EyeOff className="visibility-icon" />
              Private
            </span>
          )}
          {poll.visibility === 'public' && (
            <span className="visibility-badge public">
              <Eye className="visibility-icon" />
              Public
            </span>
          )}
        </div>
      </div>

      <div className="poll-content">
        <p className="poll-description">{poll.description}</p>
        
        <div className="poll-time">
          <Clock className="time-icon" />
          <span className="time-text">
            {poll.isExpired ? 'Expired' : getTimeRemaining(poll.expiresAt)}
          </span>
        </div>

        {poll.canVote && !hasUserVoted && (
          <div className="poll-voting">
            <h4>Select an option:</h4>
            <div className="poll-options">
              {poll.options.map((option, index) => (
                <label key={index} className="option-item">
                  <input
                    type="radio"
                    name={`poll-${poll.id}`}
                    value={option}
                    checked={selectedOption === option}
                    onChange={(e) => setSelectedOption(e.target.value)}
                  />
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>
            <button
              onClick={() => handleVote(poll.id)}
              disabled={!selectedOption || isVoting}
              className="btn btn-primary btn-small"
            >
              {isVoting ? 'Voting...' : 'Vote'}
            </button>
          </div>
        )}

        {hasUserVoted && (
          <div className="poll-voted">
            <div className="voted-indicator">
              <BarChart3 className="voted-icon" />
              <span>You have voted on this poll</span>
            </div>
          </div>
        )}

        {(poll.isExpired || hasUserVoted) && poll.results && (
          <div className="poll-results">
            <h4>Results:</h4>
            <div className="results-list">
              {poll.results.map((result, index) => (
                <div key={index} className="result-item">
                  <div className="result-label">{result.option}</div>
                  <div className="result-bar-container">
                    <div 
                      className="result-bar"
                      style={{ width: `${result.percentage}%` }}
                    ></div>
                  </div>
                  <div className="result-stats">
                    {result.votes} votes ({result.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="poll-footer">
        <div className="poll-stats">
          <span className="stat">
            <Users className="stat-icon" />
            {poll.totalVotes || 0} votes
          </span>
        </div>
        
        <Link to={`/poll/${poll.id}`} className="btn btn-outline btn-small">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default PollCard;
