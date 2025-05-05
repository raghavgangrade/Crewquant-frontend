import React from 'react';
import { Grid as MuiGrid, Card, CardContent, CardHeader, Typography, TextField, Box } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import TimerOffIcon from '@mui/icons-material/TimerOff';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface TimeSummary {
  totalWorkTime: number;
  totalNonWorkTime: number;
  totalIdleTime: number;
  averageWorkTimePerDay: number;
}

interface TimeEvent {
  id: number;
  user_id: number;
  type: string;
  work_id: string;
  url: string;
  start_time: string;
  end_time: string;
}

interface SummaryCardsProps {
  timeEvents: TimeEvent[];
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const Grid = MuiGrid as React.ComponentType<any>;

const isEventInDate = (event: TimeEvent, date: string): boolean => {
  const eventDate = new Date(event.start_time).toDateString();
  const selectedDate = new Date(date).toDateString();
  return eventDate === selectedDate;
};

const calculateSummary = (events: TimeEvent[], selectedDate: string): TimeSummary => {
  const filteredEvents = events.filter(event => isEventInDate(event, selectedDate));

  const summary: TimeSummary = {
    totalWorkTime: 0,
    totalNonWorkTime: 0,
    totalIdleTime: 0,
    averageWorkTimePerDay: 0
  };

  filteredEvents.forEach(event => {
    const duration = new Date(event.end_time).getTime() - new Date(event.start_time).getTime();

    switch (event.type) {
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

const formatDuration = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

const SummaryCards: React.FC<SummaryCardsProps> = ({ timeEvents, selectedDate, onDateChange }) => {
  const summary = calculateSummary(timeEvents, selectedDate);
  const totalTime = summary.totalWorkTime + summary.totalNonWorkTime + summary.totalIdleTime;
  //Total time spent in the day
  const totalTimeSpent = summary.totalWorkTime + summary.totalNonWorkTime + summary.totalIdleTime;
  const eightHoursMs = 8 * 60 * 60 * 1000;


  return (
    <Box sx={{ bgcolor: 'background.default', px: 3 }}> {/* Added horizontal padding */}
      <Grid container justifyContent="right" sx={{ mb: 0 }}>
        <Grid item xs={12} md={4}>
          <TextField
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            fullWidth
            sx={{ mb: 3 }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3.5} sx={{ mb: 4 }} justifyContent="center">
        {/* Made all cards have the same width and added minHeight */}

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

export default SummaryCards;
