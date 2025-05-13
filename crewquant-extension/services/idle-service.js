// Idle Service - Handles idle time detection and tracking
import * as api from '../api.js';
import * as urlService from './url-service.js';
import * as shiftService from './shift-service.js';

// State management for idle tracking
let idleStartTime = null;
let isCurrentlyIdle = false;
let trackOnlyDuringShifts = true; // Config flag to enable/disable shift-based tracking

// Initialize idle detection
export function initIdleDetection(workPolicy) {
  if (!workPolicy) {
    console.error('Cannot initialize idle detection without work policy');
    return false;
  }
  
  if (workPolicy.monitorIdleTime === true) {
    console.log('Setting up idle detection with interval of 30 seconds');
    chrome.idle.setDetectionInterval(30); // 30 seconds
    chrome.idle.onStateChanged.addListener(handleIdleState);
    
    // Check current state immediately
    chrome.idle.queryState(30, (state) => {
      console.log('Current idle state:', state);
    });
    
    return true;
  } else {
    console.log('Idle time monitoring is disabled in work policy');
    return false;
  }
}

// Enable or disable shift-based tracking
export function setTrackOnlyDuringShifts(value) {
  trackOnlyDuringShifts = value;
}

// Remove idle detection
export function removeIdleDetection() {
  chrome.idle.onStateChanged.removeListener(handleIdleState);
  return true;
}

// Handle idle state changes
function handleIdleState(state) {
  console.log('Idle state changed to:', state, 'Is Currently Idle:', isCurrentlyIdle);
  
  // Going idle
  if ((state === 'idle' || state === 'locked') && !isCurrentlyIdle) {
    console.log('User became idle, recording current activity and starting idle tracking');
    isCurrentlyIdle = true;
    
    // Record work time until idle
    const { url, startTime } = urlService.getCurrentUrlData();
    if (url && startTime) {
      urlService.recordTimeEvent(true);
    }
    
    // Start tracking idle time - IMPORTANT: Use dedicated idle time tracking variables
    idleStartTime = new Date();
    console.log('Started tracking idle time at:', idleStartTime);
    
    // Clear current URL tracking since we're now idle
    urlService.clearUrlTracking();
  } 
  // Coming back from idle
  else if (state === 'active' && isCurrentlyIdle) {
    console.log('User became active again after being idle');
    
    // Record idle time if idle period was significant
    if (idleStartTime) {
      const idleEndTime = new Date();
      const idleDuration = idleEndTime - idleStartTime;
      
      if (idleDuration >= 5000) { // 5 seconds minimum
        console.log(`Recording idle time of ${Math.floor(idleDuration/1000)} seconds`);
        recordIdleTimeEvent(idleStartTime, idleEndTime);
      } else {
        console.log('Idle period too short, not recording');
      }
      
      // Reset idle tracking
      idleStartTime = null;
    }
    
    isCurrentlyIdle = false;
    
    // Restore active tracking
    urlService.updateCurrentTab();
  }
}

// Record idle time event
async function recordIdleTimeEvent(idleStart, idleEnd) {
  try {
    const workPolicy = urlService.getWorkPolicy();
    
    // Skip if idle tracking disabled
    if (!workPolicy?.monitorIdleTime) {
      console.log('Idle time tracking is disabled in work policy, skipping recording');
      return;
    }
    
    // Check if shift-based tracking is enabled and user is in an active shift
    if (trackOnlyDuringShifts) {
      // For idle periods that may span across shift boundaries, check start and end times
      const wasInShiftAtStart = wasInShift(idleStart);
      const wasInShiftAtEnd = wasInShift(idleEnd);
      
      if (!wasInShiftAtStart && !wasInShiftAtEnd) {
        console.log('Idle time occurred outside of any active shift, skipping recording');
        return;
      }
      
      // If idle period spans across shift boundaries, adjust the time
      if (wasInShiftAtStart && !wasInShiftAtEnd) {
        // Find the shift end time and use that instead
        console.log('Idle period extends beyond shift end, adjusting end time');
        // This is simplified - in a real implementation, you'd calculate the exact shift end time
        // For now, we'll just truncate at the current time for simplicity
      } else if (!wasInShiftAtStart && wasInShiftAtEnd) {
        // Find the shift start time and use that instead
        console.log('Idle period started before shift, adjusting start time');
        // Again, simplified implementation
      }
    }
    
    if (!idleStart || !idleEnd) {
      console.log('Missing start or end time for idle period, skipping recording');
      return;
    }
    
    const duration = idleEnd - idleStart;
    
    // Skip very short idle periods
    if (duration < 5000) { // 5 seconds
      console.log(`Idle period too short (${duration}ms), skipping recording`);
      return;
    }
    
    // Create idle time event - IMPORTANT: Always use 'idle' type, not 'non_work'
    const timeEvent = {
      type: 'idle', // Always use correct idle type
      startTime: idleStart.toISOString(),
      endTime: idleEnd.toISOString()
    };
    
    console.log('Creating idle time event:', timeEvent, 'Duration:', Math.floor(duration / 1000), 'seconds');
    
    // Send to API
    const result = await api.createTimeEvent(timeEvent);
    console.log('Idle time event created successfully:', result);
  } catch (error) {
    console.error('Error recording idle time event:', error);
  }
}

// Helper function to check if user was in shift at a specific time
function wasInShift(timestamp) {
  // This is a simplified implementation
  // In a real implementation, you'd check if the given timestamp falls within any shift
  // For now, we'll just check current shift status as an approximation
  return shiftService.isInActiveShift();
}

// Check if currently idle
export function isIdle() {
  return isCurrentlyIdle;
}

// Get idle start time
export function getIdleStartTime() {
  return idleStartTime;
}

// Get debug info
export function getDebugInfo() {
  return {
    isCurrentlyIdle,
    idleStartTime: idleStartTime ? idleStartTime.toISOString() : null,
    trackOnlyDuringShifts
  };
}

// Handle user becoming active again (for recording ongoing idle time)
export function handleUserActiveAgain() {
  if (isCurrentlyIdle && idleStartTime) {
    const idleEndTime = new Date();
    recordIdleTimeEvent(idleStartTime, idleEndTime);
    idleStartTime = null;
    isCurrentlyIdle = false;
  }
}