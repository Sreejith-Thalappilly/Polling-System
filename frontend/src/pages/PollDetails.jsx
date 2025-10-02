import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePolls } from '../contexts/PollContext';
import { Clock, Users, BarChart3, ArrowLeft } from 'lucide-react';

const PollDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchPoll, voteOnPoll } = usePolls();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState('');
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPoll();
  }, [id]);

  const loadPoll = async () => {
    try {
      const pollData = await fetchPoll(id);
      setPoll(pollData);
    } catch (error) {
      setError('Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption) return;
    
    setIsVoting(true);
    setError('');
    
    const result = await voteOnPoll(id, selectedOption);
    
    if (result.success) {
      await loadPoll(); // Refresh poll data
    } else {
      setError(result.message);
    }
    
    setIsVoting(false);
  };

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
        <p>Loading poll...</p>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="error-container">
        <h2>Poll not found</h2>
        <p>The poll you're looking for doesn't exist or you don't have permission to view it.</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          <ArrowLeft className="btn-icon" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  const hasUserVoted = poll.votes && poll.votes.some(vote => vote.userId === poll.user?.id);

  return (
    <div className="poll-details">
      <div className="poll-details-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          <ArrowLeft className="btn-icon" />
          Back to Dashboard
        </button>
        
        <div className="poll-title-section">
          <h1>{poll.title}</h1>
          <div className="poll-meta">
            <span className="poll-author">
              By {poll.createdBy?.firstName} {poll.createdBy?.lastName}
            </span>
            <span className="poll-date">
              Created {formatDate(poll.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="poll-details-content">
        <div className="poll-description">
          <p>{poll.description}</p>
        </div>

        <div className="poll-info">
          <div className="info-item">
            <Clock className="info-icon" />
            <div>
              <div className="info-label">Status</div>
              <div className={`info-value ${poll.isExpired ? 'expired' : 'active'}`}>
                {poll.isExpired ? 'Expired' : 'Active'}
              </div>
            </div>
          </div>
          
          <div className="info-item">
            <Users className="info-icon" />
            <div>
              <div className="info-label">Total Votes</div>
              <div className="info-value">{poll.totalVotes || 0}</div>
            </div>
          </div>
          
          <div className="info-item">
            <Clock className="info-icon" />
            <div>
              <div className="info-label">Time Remaining</div>
              <div className="info-value">
                {poll.isExpired ? 'Expired' : getTimeRemaining(poll.expiresAt)}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {poll.canVote && !hasUserVoted && (
          <div className="poll-voting-section">
            <h3>Cast Your Vote</h3>
            <div className="poll-options">
              {poll.options.map((option, index) => (
                <label key={index} className="option-item">
                  <input
                    type="radio"
                    name="poll-option"
                    value={option}
                    checked={selectedOption === option}
                    onChange={(e) => setSelectedOption(e.target.value)}
                  />
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>
            <button
              onClick={handleVote}
              disabled={!selectedOption || isVoting}
              className="btn btn-primary btn-large"
            >
              {isVoting ? 'Voting...' : 'Submit Vote'}
            </button>
          </div>
        )}

        {hasUserVoted && (
          <div className="poll-voted-section">
            <div className="voted-indicator">
              <BarChart3 className="voted-icon" />
              <span>You have already voted on this poll</span>
            </div>
          </div>
        )}

        {(poll.isExpired || hasUserVoted) && poll.results && (
          <div className="poll-results-section">
            <h3>Poll Results</h3>
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
    </div>
  );
};

export default PollDetails;
