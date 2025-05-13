// popup.js
document.addEventListener('DOMContentLoaded', async function() {
    const notLoggedInSection = document.getElementById('not-logged-in');
    const loggedInSection = document.getElementById('logged-in');
    const workStatus = document.getElementById('work-status');
    const nonWorkStatus = document.getElementById('non-work-status');
    const currentUrlText = document.getElementById('current-url-text');
    const workIdSection = document.getElementById('work-id-section');
    const workIdText = document.getElementById('work-id-text');
    const shiftStatusSection = document.getElementById('shift-status-section');
    const shiftStatusText = document.getElementById('shift-status-text');
    const refreshShiftsButton = document.getElementById('refresh-shifts');
    const openOptionsButton = document.getElementById('open-options');
    const openSettingsButton = document.getElementById('open-settings');
    const logoutButton = document.getElementById('logout-button');
    
    const API_BASE_URL = 'https://crewquant.lirisoft.net/api';

    // Check if user is logged in
    chrome.storage.local.get(['authToken'], function(result) {
      if (result.authToken) {
        showLoggedInState();
      } else {
        showNotLoggedInState();
      }
    });
    
    // Get current tab information
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs.length > 0) {
        const currentUrl = tabs[0].url;
        currentUrlText.textContent = currentUrl;
        
        // Determine if this is a work URL and check shift status by messaging the background script
        chrome.runtime.sendMessage({ action: 'checkWorkUrl', url: currentUrl }, function(response) {
          // Add a check for runtime.lastError to avoid the unchecked runtime.lastError message
          if (chrome.runtime.lastError) {
            console.warn('Message error:', chrome.runtime.lastError.message);
            return;
          }
          
          if (response) {
            if (response.isWork) {
              workStatus.classList.remove('hidden');
              nonWorkStatus.classList.add('hidden');
              
              if (response.workId) {
                workIdSection.classList.remove('hidden');
                workIdText.textContent = response.workId;
              } else {
                workIdSection.classList.add('hidden');
              }
            } else {
              workStatus.classList.add('hidden');
              nonWorkStatus.classList.remove('hidden');
              workIdSection.classList.add('hidden');
            }

            // Display shift status
            if (shiftStatusSection) {
              shiftStatusSection.classList.remove('hidden');
              // Add a defensive check for response.isInShift
              if (response.isInShift === true) {
                shiftStatusText.textContent = 'Active Shift: Yes - Tracking Enabled';
                shiftStatusText.style.color = '#4CAF50'; // Green
              } else {
                shiftStatusText.textContent = 'Active Shift: No - Tracking Paused';
                shiftStatusText.style.color = '#F44336'; // Red
              }
            }
          }
        });
      }
    });
    
    // Refresh shift data
    if (refreshShiftsButton) {
      refreshShiftsButton.addEventListener('click', function() {
        refreshShiftsButton.textContent = 'Refreshing...';
        refreshShiftsButton.disabled = true;
        
        chrome.runtime.sendMessage({ action: 'refreshShiftData' }, function(response) {
          // Check for runtime.lastError
          if (chrome.runtime.lastError) {
            console.warn('Refresh error:', chrome.runtime.lastError.message);
            refreshShiftsButton.textContent = 'Refresh Failed';
            setTimeout(() => {
              refreshShiftsButton.disabled = false;
              refreshShiftsButton.textContent = 'Refresh Shifts';
            }, 2000);
            return;
          }
          
          refreshShiftsButton.disabled = false;
          
          if (response && response.success) {
            refreshShiftsButton.textContent = 'Shifts Refreshed';
            setTimeout(() => {
              refreshShiftsButton.textContent = 'Refresh Shifts';
            }, 2000);
            
            // Refresh shift status display
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
              if (tabs.length > 0) {
                chrome.runtime.sendMessage({ action: 'checkWorkUrl', url: tabs[0].url }, function(response) {
                  // Check for runtime.lastError again
                  if (chrome.runtime.lastError) {
                    console.warn('Status refresh error:', chrome.runtime.lastError.message);
                    return;
                  }
                  
                  if (response && shiftStatusText) {
                    if (response.isInShift === true) {
                      shiftStatusText.textContent = 'Active Shift: Yes - Tracking Enabled';
                      shiftStatusText.style.color = '#4CAF50';
                    } else {
                      shiftStatusText.textContent = 'Active Shift: No - Tracking Paused';
                      shiftStatusText.style.color = '#F44336';
                    }
                  }
                });
              }
            });
          } else {
            refreshShiftsButton.textContent = 'Refresh Failed';
            setTimeout(() => {
              refreshShiftsButton.textContent = 'Refresh Shifts';
            }, 2000);
          }
        });
      });
    }
    
    // Open options page
    openOptionsButton.addEventListener('click', function() {
      chrome.runtime.openOptionsPage();
    });
    
    // Open settings
    openSettingsButton.addEventListener('click', function() {
      chrome.tabs.create({ url: `${API_BASE_URL}/work-policy` });
    });
    
    // Logout
    logoutButton.addEventListener('click', function() {
      chrome.storage.local.remove(['authToken', 'user'], function() {
        showNotLoggedInState();
      });
    });
    
    function showLoggedInState() {
      notLoggedInSection.classList.add('hidden');
      loggedInSection.classList.remove('hidden');
    }
    
    function showNotLoggedInState() {
      notLoggedInSection.classList.remove('hidden');
      loggedInSection.classList.add('hidden');
    }
  });