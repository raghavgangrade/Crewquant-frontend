// popup.js
document.addEventListener('DOMContentLoaded', async function() {
    const notLoggedInSection = document.getElementById('not-logged-in');
    const loggedInSection = document.getElementById('logged-in');
    const workStatus = document.getElementById('work-status');
    const nonWorkStatus = document.getElementById('non-work-status');
    const currentUrlText = document.getElementById('current-url-text');
    const workIdSection = document.getElementById('work-id-section');
    const workIdText = document.getElementById('work-id-text');
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
        
        // Determine if this is a work URL by messaging the background script
        chrome.runtime.sendMessage({ action: 'checkWorkUrl', url: currentUrl }, function(response) {
          if (response && response.isWork) {
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
        });
      }
    });
    
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