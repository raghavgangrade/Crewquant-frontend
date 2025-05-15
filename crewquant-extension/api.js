// crewquant-extension/api.js
// Base URL for the API
const API_BASE_URL = 'https://crewquant.lirisoft.net/api';

// Firebase login with ID token
function firebaseLogin(email, password) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Sending Firebase ID token to backend');
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Firebase login failed');
      }
      
      resolve(await response.json());
    } catch (error) {
      console.error('Firebase login error:', error);
      reject(error);
    }
  });
}

// Standard login with email/password (legacy)
function login(email, password) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      resolve(await response.json());
    } catch (error) {
      console.error('Login error:', error);
      reject(error);
    }
  });
}

// Fetch user info
function fetchUserInfo(token) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user info');
      }
      
      resolve(await response.json());
    } catch (error) {
      console.error('Fetch user info error:', error);
      reject(error);
    }
  });
}

// Get auth token from storage
function getAuthToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['authToken'], (result) => {
      resolve(result.authToken || null);
    });
  });
}

// Fetch work policy from backend
function fetchWorkPolicy() {
  return new Promise(async (resolve, reject) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }
    
      const response = await fetch(`${API_BASE_URL}/work-policy`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    
      if (!response.ok) {
        throw new Error('Failed to fetch work policy');
      }
    
      const data = await response.json();
      resolve(data.workPolicy && data.workPolicy.length > 0 
        ? data.workPolicy[0] 
        : null);
    } catch (error) {
      console.error('Error in fetchWorkPolicy:', error);
      reject(error);
    }
  });
}

// Create time event
function createTimeEvent(timeEvent) {
  return new Promise(async (resolve, reject) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }
    
      console.log('Sending time event to API:', timeEvent);
    
      const response = await fetch(`${API_BASE_URL}/time-events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(timeEvent)
      });
    
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create time event:', response.status, errorText);
        throw new Error(`Failed to create time event: ${response.status} ${errorText}`);
      }
    
      const data = await response.json();
      console.log('Time event created successfully:', data);
      resolve(data);
    } catch (error) {
      console.error('Error in createTimeEvent:', error);
      reject(error);
    }
  });
}

