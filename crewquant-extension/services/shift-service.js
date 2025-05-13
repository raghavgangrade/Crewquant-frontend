// Shift Service - Handles shift-related functionality
import * as api from '../api.js';

// Cache for shift assignments and details
let shiftAssignments = [];
let shiftsDetails = {};
let isInitialized = false;

// Initialize shift tracking
export async function initShiftTracking() {
  try {
    if (isInitialized) return true;
    
    // Fetch user's shift assignments
    const assignments = await api.fetchShiftAssignments();
    
    if (!Array.isArray(assignments)) {
      console.error('Unexpected format for shift assignments:', assignments);
      return false;
    }
    
    shiftAssignments = assignments;
    console.log('Loaded shift assignments:', shiftAssignments);
    
    // Fetch details for each shift
    for (const assignment of shiftAssignments) {
      try {
        const shiftDetails = await api.fetchShiftDetails(assignment.shift_id);
        shiftsDetails[assignment.shift_id] = shiftDetails;
      } catch (error) {
        console.error(`Error fetching details for shift ${assignment.shift_id}:`, error);
      }
    }
    
    console.log('Loaded shift details:', shiftsDetails);
    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Error initializing shift tracking:', error);
    return false;
  }
}

// Check if user is currently in an active shift
export function isInActiveShift() {
  // If no shift assignments or not initialized, cannot be in active shift
  if (!isInitialized || !shiftAssignments || shiftAssignments.length === 0) {
    return false;
  }
  
  const now = new Date();
  const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
  
  // Get current hour and minute for time comparison
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
  console.log(`Current date: ${now.toLocaleDateString()}, day: ${currentDay}, time: ${now.toLocaleTimeString()}, minutes: ${currentTimeInMinutes}`);
  
  for (const assignment of shiftAssignments) {
    // Check if today is within the date range of the assignment
    const startDate = new Date(assignment.start_date);
    const endDate = new Date(assignment.end_date);
    
    // Set time to 00:00:00 for accurate date comparison
    const todayDateOnly = new Date(now);
    todayDateOnly.setHours(0, 0, 0, 0);
    
    const startDateOnly = new Date(startDate);
    startDateOnly.setHours(0, 0, 0, 0);
    
    const endDateOnly = new Date(endDate);
    endDateOnly.setHours(23, 59, 59, 999);
    
    console.log(`Comparing date range: ${startDateOnly.toLocaleDateString()} - ${endDateOnly.toLocaleDateString()} with today: ${todayDateOnly.toLocaleDateString()}`);
    
    if (todayDateOnly < startDateOnly || todayDateOnly > endDateOnly) {
      console.log("Today is outside the assignment date range, skipping");
      continue; // Skip this assignment if today is outside the date range
    }
    
    console.log("Today is within the assignment date range");
    
    // Get shift details
    const shiftDetails = shiftsDetails[assignment.shift_id];
    if (!shiftDetails) {
      console.warn(`No details found for shift ID ${assignment.shift_id}`);
      continue;
    }
    
    // Extract days from shift details - handle correctly for nested structure
    let days = [];
    let shiftInfo = null;
    
    if (shiftDetails.days && Array.isArray(shiftDetails.days)) {
      days = shiftDetails.days;
      shiftInfo = shiftDetails;
    } else if (shiftDetails.shift && shiftDetails.shift.days) {
      days = shiftDetails.shift.days;
      shiftInfo = shiftDetails.shift;
    } else {
      console.warn(`No days information found for shift ID ${assignment.shift_id}`);
      
      // Log full structure to debug
      console.log("Full shift details:", JSON.stringify(shiftDetails, null, 2));
      
      // For testing, assume all days are working days
      days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      // Use shift info from wherever we can find it
      shiftInfo = shiftDetails.shift || shiftDetails;
    }
    
    // Check if today is a working day for this shift
    console.log(`Checking if ${currentDay} is in working days: ${JSON.stringify(days)}`);
    if (days.indexOf(currentDay) === -1) {
      console.log(`Today (${currentDay}) is not a working day for shift ID ${assignment.shift_id}. Working days: ${days.join(', ')}`);
      continue; // Skip this shift if today is not a working day
    }
    
    console.log(`Today (${currentDay}) is a working day for this shift`);
    
    // Get the correct start and end time
    let startTime, endTime;
    
    if (shiftInfo && shiftInfo.start_time) {
      startTime = shiftInfo.start_time;
      endTime = shiftInfo.end_time;
    } else {
      console.warn(`No time information found for shift ID ${assignment.shift_id}`);
      continue;
    }
    
    // Parse shift times
    try {
      // Extract hours and minutes from time strings like "19:00:24"
      const startTimeParts = startTime.split(':');
      const endTimeParts = endTime.split(':');
      
      const shiftStartTimeInMinutes = parseInt(startTimeParts[0]) * 60 + parseInt(startTimeParts[1]);
      const shiftEndTimeInMinutes = parseInt(endTimeParts[0]) * 60 + parseInt(endTimeParts[1]);
      
      // Debug output
      console.log(`Shift hours: ${startTime} - ${endTime}`);
      console.log(`Shift minutes: ${shiftStartTimeInMinutes}-${shiftEndTimeInMinutes}`);
      console.log(`Current minutes: ${currentTimeInMinutes}`);
      
      // Check if current time is within shift hours
      if (currentTimeInMinutes >= shiftStartTimeInMinutes && currentTimeInMinutes <= shiftEndTimeInMinutes) {
        console.log(`User is currently in active shift ${assignment.shift_id}`);
        return true; // User is currently in an active shift
      } else {
        console.log(`Current time (${currentHour}:${currentMinute.toString().padStart(2, '0')}) is outside shift hours (${startTime} - ${endTime})`);
      }
    } catch (error) {
      console.error('Error parsing shift times:', error);
    }
  }
  
  // If we get here, user is not in any active shift
  console.log('User is not in any active shift at the current time');
  return false;
}

// For debugging purposes
export function getShiftInfo() {
  return {
    assignments: shiftAssignments,
    details: shiftsDetails,
    isInShift: isInActiveShift(),
    isInitialized
  };
}

// Refresh shift data
export async function refreshShiftData() {
  isInitialized = false;
  shiftAssignments = [];
  shiftsDetails = {};
  return await initShiftTracking();
}