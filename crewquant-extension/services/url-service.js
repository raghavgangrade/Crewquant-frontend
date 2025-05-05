// URL Service - Handles URL tracking and work URL pattern matching
import * as api from '../api.js';

// State management for URL tracking
let currentTabId = null;
let currentUrl = null;
let startTime = null;
let workPolicy = null;

// Load work policy from API
export async function loadWorkPolicy() {
  try {
    const policyData = await api.fetchWorkPolicy();
    
    if (policyData) {
      // Parse work_urls if it's a string
      let workUrls = [];
      if (policyData.work_urls) {
        try {
          workUrls = typeof policyData.work_urls === 'string' 
            ? JSON.parse(policyData.work_urls)
            : policyData.work_urls;
        } catch (e) {
          console.error('Error parsing work_urls:', e);
        }
      }
      
      workPolicy = {
        id: policyData.id,
        workUrls: Array.isArray(workUrls) ? workUrls : [],
        monitorIdleTime: policyData.monitor_idle_time || false,
        monitorNonWorkTime: policyData.monitor_non_work_time || false
      };
      
      console.log('Loaded work policy:', workPolicy);
      return workPolicy;
    }
  } catch (error) {
    console.error('Error loading work policy:', error);
    throw error;
  }
}

// Get current work policy
export function getWorkPolicy() {
  return workPolicy;
}

// Set work policy (useful for testing or direct updates)
export function setWorkPolicy(policy) {
  workPolicy = policy;
}

// Check if URL matches work patterns
export function isWorkUrl(url) {
  if (!workPolicy || !workPolicy.workUrls || workPolicy.workUrls.length === 0) {
    return false;
  }
  
  for (const pattern of workPolicy.workUrls) {
    try {
      const cleanedPattern = pattern.urlPattern.replace(/^\/|\/$/g, '');
      const regex = new RegExp(cleanedPattern);
      if (regex.test(url)) {
        return true;
      }
    } catch (e) {
      console.error('Invalid regex pattern:', pattern.urlPattern);
    }
  }
  
  return false;
}

// Extract work ID from URL using regex patterns
export function extractWorkId(url) {
  if (!workPolicy || !workPolicy.workUrls || workPolicy.workUrls.length === 0) {
    return null;
  }
  
  for (const pattern of workPolicy.workUrls) {
    try {
      const urlRegex = new RegExp(pattern.urlPattern);
      if (urlRegex.test(url)) {
        const extractorRegex = new RegExp(pattern.workIdExtractor);
        const match = url.match(extractorRegex);
        if (match && match[1]) {
          return match[1];
        }
      }
    } catch (e) {
      console.error('Error applying regex:', e);
    }
  }
  
  return null;
}

// Handle tab changes
export function handleTabChange(activeInfo, isCurrentlyIdle, recordTimeEventCallback) {
  // Don't record anything if we're idle
  if (isCurrentlyIdle) return;
  
  // Record time for previous tab/URL
  if (currentUrl && startTime) {
    recordTimeEventCallback();
  }
  
  // Update current tab
  currentTabId = activeInfo.tabId;
  chrome.tabs.get(currentTabId, (tab) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    
    updateCurrentUrl(tab.url);
  });
}

// Handle URL changes within tabs
export function handleUrlChange(tabId, changeInfo, tab, isCurrentlyIdle, recordTimeEventCallback) {
  // Don't record anything if we're idle
  if (isCurrentlyIdle) return;
  
  if (tabId === currentTabId && changeInfo.url) {
    // Record time for previous URL
    if (currentUrl && startTime) {
      recordTimeEventCallback();
    }
    
    // Update current URL
    updateCurrentUrl(changeInfo.url);
  }
}

// Update current URL and start time
export function updateCurrentUrl(url) {
  // Don't track chrome:// URLs and extension pages
  if (url && (url.startsWith('chrome://') || url.startsWith('chrome-extension://'))) {
    return;
  }
  
  currentUrl = url;
  startTime = new Date();
  console.log(`Started tracking URL: ${url} at ${startTime}`);
}

// Get current active tab
export function updateCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      currentTabId = tabs[0].id;
      updateCurrentUrl(tabs[0].url);
    }
  });
}

// Record a time event
export async function recordTimeEvent(isAuthenticated) {
  try {
    // Skip if not authenticated or no URL or no start time
    if (!isAuthenticated || !currentUrl || !startTime) {
      return;
    }
    
    // Skip tracking of chrome:// URLs and extension pages
    if (currentUrl.startsWith('chrome://') || 
        currentUrl.startsWith('chrome-extension://')) {
      return;
    }
    
    const endTime = new Date();
    const duration = endTime - startTime;
    
    // Skip very short visits
    if (duration < 5000) { // 5 seconds
      return;
    }
    
    // Determine if this is a work URL
    const isWork = isWorkUrl(currentUrl);
    
    // Skip non-work URLs if not configured to track them
    if (!isWork && !workPolicy?.monitorNonWorkTime) {
      return;
    }
    
    // Extract work ID if it's a work URL
    const workId = isWork ? extractWorkId(currentUrl) : null;
    
    // Create time event
    const timeEvent = {
      type: isWork ? 'work' : 'non_work',
      url: currentUrl,
      workId: workId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    };
    
    console.log('Creating time event:', timeEvent);
    
    // Send to API
    await api.createTimeEvent(timeEvent);
  } catch (error) {
    console.error('Error recording time event:', error);
  }
}

// Get current URL and start time
export function getCurrentUrlData() {
  return {
    url: currentUrl,
    startTime: startTime
  };
}

// Clear current URL tracking
export function clearUrlTracking() {
  currentUrl = null;
  startTime = null;
}