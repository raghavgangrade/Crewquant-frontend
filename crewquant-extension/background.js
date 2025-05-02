// Main background service worker for the CrewQuant extension
import * as api from './api.js';
import * as urlService from './services/url-service.js';
import * as idleService from './services/idle-service.js';

// State management
let isTracking = false;
let isAuthenticated = false;
let keepAliveInterval = null;

// Initialize extension
async function initialize() {
  try {
    // Check if user is authenticated
    const token = await getAuthToken();
    if (token) {
      isAuthenticated = true;
      
      // Load work policy
      const workPolicy = await urlService.loadWorkPolicy();
      
      // Start tracking
      startTracking();
      
      // Set up service worker persistence
      setupServiceWorkerPersistence();
    }
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Setup persistence strategies to keep service worker alive
function setupServiceWorkerPersistence() {
  // Keep-alive ping every 25 seconds to prevent service worker from going idle
  keepAliveInterval = setInterval(() => {
    console.log('Service worker keep-alive ping');
    chrome.runtime.getPlatformInfo(function() {});
  }, 25000);
  
  // Register for alarm events - but only use alarms for keep-alive, not for state changes
  chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'keepAlive') {
      // Just a keep-alive ping, don't change any states
      console.log('Alarm-triggered keep-alive ping');
    }
  });
}

// Clean up interval on service worker termination
chrome.runtime.onSuspend.addListener(() => {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
});

// Start tracking browser activity
function startTracking() {
  if (isTracking) return;
  
  isTracking = true;
  
  // Set up tab change listener
  chrome.tabs.onActivated.addListener((activeInfo) => {
    urlService.handleTabChange(activeInfo, idleService.isIdle(), () => urlService.recordTimeEvent(isAuthenticated));
  });
  
  // Set up URL change listener
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    urlService.handleUrlChange(tabId, changeInfo, tab, idleService.isIdle(), () => urlService.recordTimeEvent(isAuthenticated));
  });
  
  // Set up idle detection if enabled
  const workPolicy = urlService.getWorkPolicy();
  idleService.initIdleDetection(workPolicy);
  
  // Check current tab on start
  urlService.updateCurrentTab();
}

// Stop tracking
function stopTracking() {
  if (!isTracking) return;
  
  isTracking = false;
  
  // Remove listeners
  chrome.tabs.onActivated.removeListener(urlService.handleTabChange);
  chrome.tabs.onUpdated.removeListener(urlService.handleUrlChange);
  idleService.removeIdleDetection();
  
  // Record end of current session if any
  const { url, startTime } = urlService.getCurrentUrlData();
  if (url && startTime && !idleService.isIdle()) {
    urlService.recordTimeEvent(isAuthenticated);
  } else if (idleService.isIdle()) {
    // Record any ongoing idle time
    idleService.handleUserActiveAgain();
  }
}

// Get auth token from storage
async function getAuthToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['authToken'], (result) => {
      resolve(result.authToken || null);
    });
  });
}

// Listen for authentication events
chrome.storage.onChanged.addListener((changes) => {
  if (changes.authToken) {
    if (changes.authToken.newValue) {
      // User just logged in
      isAuthenticated = true;
      initialize();
    } else {
      // User just logged out
      isAuthenticated = false;
      stopTracking();
    }
  }
});

// Handle messages from popup and options pages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkWorkUrl') {
    const isWork = urlService.isWorkUrl(request.url);
    const workId = isWork ? urlService.extractWorkId(request.url) : null;
    sendResponse({ isWork, workId });
  } else if (request.action === 'userLogout') {
    console.log('User logged out, stopping tracking');
    isAuthenticated = false;
    stopTracking();
  } else if (request.action === 'getDebugInfo') {
    // Helper to troubleshoot idle tracking
    const idleDebugInfo = idleService.getDebugInfo();
    const workPolicy = urlService.getWorkPolicy();
    
    sendResponse({
      ...idleDebugInfo,
      workPolicy,
      isTracking
    });
  }
  return true; // Keep the message channel open for async responses
});

// Initialize on startup
initialize();