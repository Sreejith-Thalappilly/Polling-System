// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Global State
let currentUser = null;
let authToken = null;
let polls = [];
let myVotes = [];

// DOM Elements
const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');
const navActions = document.getElementById('navActions');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const createPollForm = document.getElementById('createPollForm');
const pollsList = document.getElementById('pollsList');
const myVotesList = document.getElementById('myVotesList');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Check for existing token
    const token = localStorage.getItem('authToken');
    if (token) {
        authToken = token;
        loadUserProfile();
    } else {
        showAuthSection();
    }

    // Set default expiry time (1 hour from now)
    const now = new Date();
    now.setHours(now.getHours() + 1);
    document.getElementById('pollExpiry').value = now.toISOString().slice(0, 16);
});

// Authentication Functions
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        authToken = data.data.access_token;
        currentUser = data.data.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(currentUser));

        showDashboard();
        loadPolls();
        loadMyVotes();
    } catch (error) {
        showError('loginError', error.message);
    }
}

async function register(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        showSuccess('registerError', 'Registration successful! Please login.');
        document.getElementById('registerForm').reset();
    } catch (error) {
        showError('registerError', error.message);
    }
}

async function logout() {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        authToken = null;
        currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        showAuthSection();
    }
}

async function loadUserProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to load user profile');
        }

        const data = await response.json();
        currentUser = data.data.user;
        showDashboard();
        loadPolls();
        loadMyVotes();
    } catch (error) {
        console.error('Profile load error:', error);
        logout();
    }
}

// UI Functions
function showAuthSection() {
    authSection.style.display = 'flex';
    dashboardSection.style.display = 'none';
    navActions.innerHTML = '';
}

function showDashboard() {
    authSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    
    document.getElementById('userName').textContent = currentUser.firstName;
    document.getElementById('userRole').textContent = currentUser.role;
    
    const adminActions = document.getElementById('adminActions');
    if (currentUser.role === 'admin') {
        adminActions.style.display = 'block';
    } else {
        adminActions.style.display = 'none';
    }

    navActions.innerHTML = `
        <button class="btn btn-secondary btn-small" onclick="logout()">
            <i class="fas fa-sign-out-alt"></i> Logout
        </button>
    `;
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    document.querySelector(`[onclick="switchAuthTab('${tab}')"]`).classList.add('active');
    document.getElementById(`${tab}Form`).classList.add('active');
    
    // Clear error messages
    document.getElementById(`${tab}Error`).classList.remove('show');
}

function showCreatePollForm() {
    createPollForm.style.display = 'block';
    document.getElementById('newPollForm').reset();
    
    // Set default expiry time (1 hour from now)
    const now = new Date();
    now.setHours(now.getHours() + 1);
    document.getElementById('pollExpiry').value = now.toISOString().slice(0, 16);
}

function hideCreatePollForm() {
    createPollForm.style.display = 'none';
    document.getElementById('createPollError').classList.remove('show');
}

function toggleAllowedUsers() {
    const visibility = document.getElementById('pollVisibility').value;
    const allowedUsersSection = document.getElementById('allowedUsersSection');
    
    if (visibility === 'private') {
        allowedUsersSection.style.display = 'block';
    } else {
        allowedUsersSection.style.display = 'none';
    }
}

// Poll Functions
async function loadPolls() {
    try {
        const response = await fetch(`${API_BASE_URL}/polls`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to load polls');
        }

        const data = await response.json();
        polls = data.data.polls;
        renderPolls();
    } catch (error) {
        console.error('Polls load error:', error);
        showError('pollsList', 'Failed to load polls');
    }
}

async function createPoll(pollData) {
    try {
        const response = await fetch(`${API_BASE_URL}/polls`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(pollData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create poll');
        }

        hideCreatePollForm();
        loadPolls();
        showSuccess('createPollError', 'Poll created successfully!');
    } catch (error) {
        showError('createPollError', error.message);
    }
}

async function voteOnPoll(pollId, selectedOption) {
    try {
        const response = await fetch(`${API_BASE_URL}/polls/${pollId}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ selectedOption }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to vote');
        }

        loadPolls();
        loadMyVotes();
        showSuccess('pollsList', 'Vote submitted successfully!');
    } catch (error) {
        showError('pollsList', error.message);
    }
}

async function loadMyVotes() {
    try {
        const response = await fetch(`${API_BASE_URL}/polls/my-votes`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to load votes');
        }

        const data = await response.json();
        myVotes = data.data.votes;
        renderMyVotes();
    } catch (error) {
        console.error('Votes load error:', error);
    }
}

// Render Functions
function renderPolls() {
    pollsList.innerHTML = '';
    
    if (polls.length === 0) {
        pollsList.innerHTML = '<p>No polls available.</p>';
        return;
    }

    polls.forEach(poll => {
        const pollCard = document.createElement('div');
        pollCard.className = 'poll-card';
        pollCard.dataset.pollId = poll.id;
        
        const isExpired = new Date(poll.expiresAt) < new Date();
        const canVote = poll.isActive && !isExpired;
        const userVoted = myVotes.some(vote => vote.pollId === poll.id);
        
        pollCard.innerHTML = `
            <div class="poll-header">
                <div>
                    <h3 class="poll-title">${poll.title}</h3>
                    <div class="poll-meta">
                        <span>By: ${poll.createdBy.firstName} ${poll.createdBy.lastName}</span>
                        <span>Created: ${new Date(poll.createdAt).toLocaleDateString()}</span>
                        <span>Expires: ${new Date(poll.expiresAt).toLocaleString()}</span>
                    </div>
                </div>
                <div>
                    <span class="poll-status ${isExpired ? 'expired' : 'active'}">
                        ${isExpired ? 'Expired' : 'Active'}
                    </span>
                    ${poll.visibility === 'private' ? '<span class="poll-status private">Private</span>' : ''}
                </div>
            </div>
            
            <p class="poll-description">${poll.description}</p>
            
            ${canVote && !userVoted ? renderVotingOptions(poll) : ''}
            ${userVoted || isExpired ? renderPollResults(poll) : ''}
            
            ${userVoted ? '<p class="success-message show">You have voted on this poll.</p>' : ''}
        `;
        
        pollsList.appendChild(pollCard);
    });
}

function renderVotingOptions(poll) {
    return `
        <div class="poll-options">
            <h4>Select an option:</h4>
            ${poll.options.map((option, index) => `
                <div class="option-item" onclick="selectOption('${poll.id}', '${option}')">
                    <input type="radio" name="poll_${poll.id}" value="${option}" id="option_${poll.id}_${index}">
                    <label for="option_${poll.id}_${index}">${option}</label>
                </div>
            `).join('')}
            <button class="btn btn-primary btn-small" onclick="submitVote('${poll.id}')" style="margin-top: 1rem;">
                Submit Vote
            </button>
        </div>
    `;
}

function renderPollResults(poll) {
    const results = poll.results || [];
    
    return `
        <div class="poll-results">
            <h4>Results:</h4>
            ${results.map(result => `
                <div class="result-item">
                    <span>${result.option}</span>
                    <div class="result-bar">
                        <div class="result-fill" style="width: ${result.percentage}%"></div>
                    </div>
                    <span>${result.votes} votes (${result.percentage}%)</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderMyVotes() {
    myVotesList.innerHTML = '';
    
    if (myVotes.length === 0) {
        myVotesList.innerHTML = '<p>You haven\'t voted on any polls yet.</p>';
        return;
    }

    myVotes.forEach(vote => {
        const voteCard = document.createElement('div');
        voteCard.className = 'vote-card';
        
        voteCard.innerHTML = `
            <h4>${vote.poll.title}</h4>
            <p><strong>Your vote:</strong> ${vote.selectedOption}</p>
            <p><strong>Voted on:</strong> ${new Date(vote.createdAt).toLocaleString()}</p>
        `;
        
        myVotesList.appendChild(voteCard);
    });
}

// Event Listeners
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    await login(email, password);
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userData = {
        firstName: document.getElementById('registerFirstName').value,
        lastName: document.getElementById('registerLastName').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
    };
    await register(userData);
});

document.getElementById('newPollForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const options = document.getElementById('pollOptions').value
        .split('\n')
        .map(option => option.trim())
        .filter(option => option);
    
    const allowedUserIds = document.getElementById('allowedUsers').value
        .split(',')
        .map(id => id.trim())
        .filter(id => id);
    
    const pollData = {
        title: document.getElementById('pollTitle').value,
        description: document.getElementById('pollDescription').value,
        options: options,
        visibility: document.getElementById('pollVisibility').value,
        expiresAt: new Date(document.getElementById('pollExpiry').value).toISOString(),
        allowedUserIds: allowedUserIds.length > 0 ? allowedUserIds : undefined,
    };
    
    await createPoll(pollData);
});

// Utility Functions
function selectOption(pollId, option) {
    const pollCard = document.querySelector(`[data-poll-id="${pollId}"]`);
    if (pollCard) {
        pollCard.querySelectorAll('.option-item').forEach(item => {
            item.classList.remove('selected');
        });
        event.target.closest('.option-item').classList.add('selected');
        pollCard.dataset.selectedOption = option;
    }
}

function submitVote(pollId) {
    const pollCard = document.querySelector(`[data-poll-id="${pollId}"]`);
    const selectedOption = pollCard?.dataset.selectedOption;
    
    if (!selectedOption) {
        showError('pollsList', 'Please select an option before voting');
        return;
    }
    
    voteOnPoll(pollId, selectedOption);
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        setTimeout(() => {
            errorElement.classList.remove('show');
        }, 5000);
    }
}

function showSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.add('show');
        setTimeout(() => {
            successElement.classList.remove('show');
        }, 3000);
    }
}
