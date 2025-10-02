import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const PollContext = createContext();

export const usePolls = () => {
  const context = useContext(PollContext);
  if (!context) {
    throw new Error('usePolls must be used within a PollProvider');
  }
  return context;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const PollProvider = ({ children }) => {
  const [polls, setPolls] = useState([]);
  const [myVotes, setMyVotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/polls`);
      setPolls(response.data.data.polls);
    } catch (error) {
      console.error('Failed to fetch polls:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchPoll = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/polls/${id}`);
      return response.data.data.poll;
    } catch (error) {
      console.error('Failed to fetch poll:', error);
      throw error;
    }
  };

  const fetchMyVotes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/polls/my-votes`);
      setMyVotes(response.data.data.votes);
    } catch (error) {
      console.error('Failed to fetch votes:', error);
      throw error;
    }
  };

  const createPoll = async (pollData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/polls`, pollData);
      await fetchPolls(); // Refresh polls list
      return { success: true, data: response.data.data.poll };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to create poll' 
      };
    }
  };

  const updatePoll = async (id, pollData) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/polls/${id}`, pollData);
      await fetchPolls(); // Refresh polls list
      return { success: true, data: response.data.data.poll };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update poll' 
      };
    }
  };

  const deletePoll = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/polls/${id}`);
      await fetchPolls(); // Refresh polls list
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to delete poll' 
      };
    }
  };

  const voteOnPoll = async (pollId, selectedOption) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/polls/${pollId}/vote`, {
        selectedOption
      });
      await fetchPolls(); // Refresh polls list
      await fetchMyVotes(); // Refresh votes list
      return { success: true, data: response.data.data.vote };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to vote' 
      };
    }
  };

  const value = {
    polls,
    myVotes,
    loading,
    fetchPolls,
    fetchPoll,
    fetchMyVotes,
    createPoll,
    updatePoll,
    deletePoll,
    voteOnPoll
  };

  return (
    <PollContext.Provider value={value}>
      {children}
    </PollContext.Provider>
  );
};
