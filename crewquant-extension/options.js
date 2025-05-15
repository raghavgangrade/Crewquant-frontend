// options.js
// Import the API functions
import * as api from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
  const loginForm = document.getElementById('login-form');
  const loggedInSection = document.getElementById('logged-in');
  const loginButton = document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');
  const loginError = document.getElementById('login-error');
  const statusMessage = document.getElementById('status-message');
  
  // Check if user is already logged in
  chrome.storage.local.get(['authToken', 'user'], function(result) {
    if (result.authToken && result.user) {
      showLoggedIn(result.user);
    } else {
      showLoginForm();
    }
  });
  
  // Handle login button click
  loginButton.addEventListener('click', async function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
      showError('Please enter email and password');
      return;
    }
    
    try {
      loginButton.textContent = 'Logging in...';
      loginButton.disabled = true;
      
      const { user, token } = await api.login(email, password);
      
      // Save token and user info
      chrome.storage.local.set({ 
        authToken: token, 
        user: user 
      }, function() {
        showLoggedIn(user);
        loginButton.textContent = 'Login';
        loginButton.disabled = false;
      });
    } catch (error) {
      showError(error.message || 'Login failed');
      loginButton.textContent = 'Login';
      loginButton.disabled = false;
    }
  });
  
  // Handle logout button click
  logoutButton.addEventListener('click', function() {
    chrome.storage.local.remove(['authToken', 'user'], function() {
      showLoginForm();
    });
  });
  
  // Show login form
  function showLoginForm() {
    loginForm.classList.remove('hidden');
    loggedInSection.classList.add('hidden');
    loginError.classList.add('hidden');
  }
  
  // Show logged in state
  function showLoggedIn(user) {
    loginForm.classList.add('hidden');
    loggedInSection.classList.remove('hidden');
    statusMessage.textContent = `Logged in as ${user.email}`;
  }
  
  // Show error message
  function showError(message) {
    loginError.textContent = message;
    loginError.classList.remove('hidden');
  }
});