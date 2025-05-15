// crewquant-extension/options.js

document.addEventListener('DOMContentLoaded', async function() {
  console.log('DOM loaded');
  const loginForm = document.getElementById('login-form');
  const loggedInSection = document.getElementById('logged-in');
  const loginButton = document.getElementById('login-button');
  const googleButton = document.getElementById('google-login-button');
  const logoutButton = document.getElementById('logout-button');
  const loginError = document.getElementById('login-error');
  const statusMessage = document.getElementById('status-message');
  
  console.log('Elements found:', {loginButton, googleButton, loginError});

  try {
    // Check if firebase is defined
    if (typeof firebase === 'undefined') {
      console.error('Firebase is not defined. Make sure the Firebase scripts are loaded correctly.');
      showError('Firebase initialization failed. Please try again later.');
      return;
    }

    // Initialize Firebase
    console.log('Initializing Firebase...');
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    console.log('Firebase initialized successfully');
    
    // Check if user is already logged in
    chrome.storage.local.get(['authToken', 'user'], function(result) {
      if (result.authToken && result.user) {
        showLoggedIn(result.user);
      } else {
        showLoginForm();
      }
    });
    
    // Handle login button click
    if (loginButton) {
      loginButton.addEventListener('click', async function() {
        console.log('Login button clicked');
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
          showError('Please enter email and password');
          return;
        }
        
        try {
          loginButton.textContent = 'Logging in...';
          loginButton.disabled = true;
          
          // Login with Firebase
          // const userCredential = await auth.signInWithEmailAndPassword(email, password);
          // const firebaseUser = userCredential.user;
          
          // // Get Firebase ID Token
          // const idToken = await firebaseUser.getIdToken();
          // console.log('Got Firebase ID token');
          
          // Authenticate with backend
          console.log('Calling firebaseLogin with token');
          const response = await firebaseLogin(email, password);
          console.log('Backend login successful',response);
          // Save token and user info
          chrome.storage.local.set({ 
            authToken: response.token, 
            user: response.user 
          }, function() {
            showLoggedIn(response.user);
            loginButton.textContent = 'Login';
            loginButton.disabled = false;
          });
        } catch (error) {
          console.error('Login error:', error);
          showError(error.message || 'Login failed');
          loginButton.textContent = 'Login';
          loginButton.disabled = false;
        }
      });
    }
    
    // Handle Google sign in
    if (googleButton) {
      googleButton.addEventListener('click', async function() {
        console.log('Google button clicked');
        try {
          googleButton.disabled = true;
          
          // Sign in with Google via Firebase
          const result = await auth.signInWithPopup(googleProvider);
          const firebaseUser = result.user;
          console.log('Google sign-in successful');
          
          // Get Firebase ID Token
          const idToken = await firebaseUser.getIdToken();
          console.log('Got Firebase ID token');
          
          // Authenticate with backend
          console.log('Calling firebaseLogin with token');
          const response = await firebaseLogin(idToken);
          
          // Save token and user info
          chrome.storage.local.set({ 
            authToken: response.token, 
            user: response.user 
          }, function() {
            showLoggedIn(response.user);
            googleButton.disabled = false;
          });
        } catch (error) {
          console.error('Google login error:', error);
          showError(error.message || 'Google login failed');
          googleButton.disabled = false;
        }
      });
    }
    
    // Handle logout button click
    if (logoutButton) {
      logoutButton.addEventListener('click', async function() {
        console.log('Logout button clicked');
        try {
          await auth.signOut();
          chrome.storage.local.remove(['authToken', 'user'], function() {
            showLoginForm();
          });
        } catch (error) {
          console.error('Logout error:', error);
          showError(error.message || 'Logout failed');
        }
      });
    }
  } catch (err) {
    console.error('Firebase setup error:', err);
    showError('Failed to initialize Firebase. Please try again later.');
  }
  
  // Show login form
  function showLoginForm() {
    if (loginForm && loggedInSection) {
      loginForm.classList.remove('hidden');
      loggedInSection.classList.add('hidden');
      if (loginError) loginError.classList.add('hidden');
    }
  }
  
  // Show logged in state
  function showLoggedIn(user) {
    if (loginForm && loggedInSection && statusMessage) {
      loginForm.classList.add('hidden');
      loggedInSection.classList.remove('hidden');
      statusMessage.textContent = `Logged in as ${user.email || user.userName || 'User'}`;
    }
  }
  
  // Show error message
  function showError(message) {
    if (loginError) {
      loginError.textContent = message;
      loginError.classList.remove('hidden');
    }
    console.error('Error:', message);
  }
});