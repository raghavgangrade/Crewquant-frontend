// Import necessary components and icons from Material-UI and React
import React from 'react';
import { Grid as MuiGrid, Card, CardContent, CardHeader, Typography, TextField, Box } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import TimerOffIcon from '@mui/icons-material/TimerOff';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Define what a time summary looks like (time durations in milliseconds)
interface TimeSummary {
  totalWorkTime: number;      // How long spent working
  totalNonWorkTime: number;   // How long spent not working
  totalIdleTime: number;      // How long spent idle/inactive
  averageWorkTimePerDay: number; // Average daily work time
}

// Define what a single time event looks like
interface TimeEvent {
  id: number;           // Unique ID for the event
  user_id: number;      // Which user this event belongs to
  type: string;         // Type of event: 'work', 'non_work', or 'idle'
  work_id: string;      // ID of the work being done (if any)
  url: string;          // Website URL being tracked
  start_time: string;   // When the event started
  end_time: string;     // When the event ended
}

// Define what information the SummaryCards component needs to work
interface SummaryCardsProps {
  timeEvents: TimeEvent[];    // List of all time events
  selectedDate: string;       // Which date is selected
  onDateChange: (date: string) => void; // Function to handle date changes
}

// Fix for Material-UI Grid component typing
const Grid = MuiGrid as React.ComponentType<any>;

/**
 * Checks if a time event happened on the selected date
 * For example: Is this event from January 1st?
 */
const isEventInDate = (event: TimeEvent, date: string): boolean => {
  const eventDate = new Date(event.start_time).toDateString();
  const selectedDate = new Date(date).toDateString();
  return eventDate === selectedDate;
};

/**
 * Takes all time events and calculates total times for the selected date
 * For example: Total work time = 5 hours, Non-work time = 2 hours, etc.
 */
const calculateSummary = (events: TimeEvent[], selectedDate: string): TimeSummary => {
  // Only look at events from the selected date
  const filteredEvents = events.filter(event => isEventInDate(event, selectedDate));
  
  // Start with zero for all times
  const summary: TimeSummary = {
    totalWorkTime: 0,
    totalNonWorkTime: 0,
    totalIdleTime: 0,
    averageWorkTimePerDay: 0
  };
  
  // Add up all the time durations
  filteredEvents.forEach(event => {
    // Calculate how long this event lasted
    const duration = new Date(event.end_time).getTime() - new Date(event.start_time).getTime();
    
    // Add the duration to the right category
    switch(event.type) {
      case 'work':
        summary.totalWorkTime += duration;
        break;
      case 'non_work':
        summary.totalNonWorkTime += duration;
        break;
      case 'idle':
        summary.totalIdleTime += duration;
        break;
    }
  });

  return summary;
};

/**
 * Converts milliseconds into a readable format
 * For example: 3600000 milliseconds becomes "1h 0m"
 */
const formatDuration = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

/**
 * Main component that shows time tracking summary cards
 * Shows total time, work time, non-work time, and idle time
 */
const SummaryCards: React.FC<SummaryCardsProps> = ({ timeEvents, selectedDate, onDateChange }) => {
  // Calculate all the time summaries for the selected date
  const summary = calculateSummary(timeEvents, selectedDate);
  const totalTime = summary.totalWorkTime + summary.totalNonWorkTime + summary.totalIdleTime;
  // Total time spent in the day
  const totalTimeSpent = summary.totalWorkTime + summary.totalNonWorkTime + summary.totalIdleTime;
  const eightHoursMs = 8 * 60 * 60 * 1000;

  return (
    // Main container for all cards
    <Box sx={{ bgcolor: 'background.default', px: 3 }}> {/* Added horizontal padding */}
      {/* Date picker section at the top */}
      <Grid container justifyContent="right" sx={{ mb: 0 }}>
        <Grid item xs={12} md={4}>
          <TextField
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            fullWidth
            sx={{ mb: 3 }} // Added margin bottom for spacing
          />
        </Grid>
      </Grid>

      {/* Grid of summary cards */}
      <Grid container spacing={3.5} sx={{ mb: 4 }} justifyContent="center">
        {/* Total Time Card - Shows combined time from all categories */}
        <Grid item xs={12} md={4}>
          <Card raised sx={{ minHeight: 180, minWidth: 270 }}>
            <CardHeader
              avatar={<AccessTimeIcon color="success" />} // Reusing icon; replace with another if you like
              title="Total Time (out of 8h)"
              sx={{ bgcolor: 'success.light', color: 'white' }}
            />
            <CardContent>
              <Typography variant="h5">{formatDuration(totalTimeSpent)}</Typography>
              <Typography variant="subtitle2">
                {(totalTimeSpent / eightHoursMs * 100).toFixed(1)}% of 8 hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Work Time Card - Shows time spent working */}
        <Grid item xs={12} md={4}>
          <Card raised sx={{ minHeight: 180, minWidth: 270 }}>
            <CardHeader
              avatar={<WorkIcon color="primary" />}
              title="Work Time"
              sx={{ bgcolor: 'primary.light', color: 'white' }}
            />
            <CardContent>
              <Typography variant="h5">{formatDuration(summary.totalWorkTime)}</Typography>
              <Typography variant="subtitle2">
                {totalTime > 0 ? `${((summary.totalWorkTime / totalTime) * 100).toFixed(1)}% of total time` : '0% of total time'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Non-Work Time Card - Shows time spent on non-work activities */}
        <Grid item xs={12} md={4}>
          <Card raised sx={{ minHeight: 180, minWidth: 270 }}>
            <CardHeader
              avatar={<TimerOffIcon color="error" />}
              title="Non-Work Time"
              sx={{ bgcolor: 'error.light', color: 'white' }}
            />
            <CardContent>
              <Typography variant="h5">{formatDuration(summary.totalNonWorkTime)}</Typography>
              <Typography variant="subtitle2">
                {totalTime > 0 ? `${((summary.totalNonWorkTime / totalTime) * 100).toFixed(1)}% of total time` : '0% of total time'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Idle Time Card - Shows time spent inactive */}
        <Grid item xs={12} md={4}>
          <Card raised sx={{ minHeight: 180, minWidth: 270 }}>
            <CardHeader
              avatar={<AccessTimeIcon color="warning" />}
              title="Idle Time"
              sx={{ bgcolor: 'warning.light', color: 'white' }}
            />
            <CardContent>
              <Typography variant="h5">{formatDuration(summary.totalIdleTime)}</Typography>
              <Typography variant="subtitle2">
                {totalTime > 0 ? `${((summary.totalIdleTime / totalTime) * 100).toFixed(1)}% of total time` : '0% of total time'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Export the component for use in other parts of the app
export default SummaryCards;
