// Base URL for the API
const API_BASE_URL = 'https://crewquant.lirisoft.net/api';

// Get auth token from storage
async function getAuthToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['authToken'], (result) => {
      resolve(result.authToken || null);
    });
  });
}

// Fetch work policy from backend
export async function fetchWorkPolicy() {
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
  return data.workPolicy && data.workPolicy.length > 0 
    ? data.workPolicy[0] 
    : null;
}

// Create time event
export async function createTimeEvent(timeEvent) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  console.log('Sending time event to API:', timeEvent);

  try {
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
    return data;
  } catch (error) {
    console.error('Error in createTimeEvent:', error);
    throw error;
  }
}

// Login user
export async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await response.json();
  return data;
}