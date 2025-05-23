import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, Tooltip, TableRow, Paper, Typography, Alert, Box, Button,
  Container
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { WorkPolicy } from '../services/workPolicyService';
import SummaryCards from './SummeryCards';
import HourlyDistributionChart from './HourlyDistributionChart';
import TimeLineChart from './TimeLineChart';

const API_BASE_URL = 'https://crewquant.lirisoft.net/api';

// Interface for TimeEvent
interface TimeEvent {
  id: number;
  user_id: number;
  type: string;
  work_id: string;
  url: string;
  start_time: string;
  end_time: string;
}

// Styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: '#1976d2',   // MUI blue
  color: theme.palette.common.white,
  fontSize: '1rem',
}));

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleString();
};

const TimeEventTable: React.FC = () => {
  const navigate = useNavigate();
  const [timeEvents, setTimeEvents] = useState<TimeEvent[]>([]);
  const [workPolicy, setWorkPolicy] = useState<WorkPolicy | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Filter events for selected date
  const filterEventsByDate = (events: TimeEvent[]): TimeEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time).toDateString();
      const filterDate = new Date(selectedDate).toDateString();
      return eventDate === filterDate;
    });
  };

  // Get token from localStorage
  const token = localStorage.getItem('token');

  // Fetch work policy data
  useEffect(() => {
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    // Fetch the work policy settings
    axios
      .get(`${API_BASE_URL}/work-policy`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.workPolicy && response.data.workPolicy.length > 0) {
          const policyData = response.data.workPolicy[0];

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

          setWorkPolicy({
            id: policyData.id,
            workUrls: Array.isArray(workUrls) ? workUrls : [],
            monitorIdleTime: policyData.monitor_idle_time || false,
            monitorNonWorkTime: policyData.monitor_non_work_time || false
          });
        }
      })
      .catch((err) => {
        console.error('Error fetching work policy:', err);
      });

    // Fetch time events
    axios
      .get(`${API_BASE_URL}/time-events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        // Sort time events to get newest first (by start_time)
        const sortedEvents = [...response.data.timeEvents].sort(
          (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        );
        setTimeEvents(sortedEvents);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch time event data');
        setLoading(false);
      });
  }, [token]);

  if (!token) {
    return (
      <Box sx={{ mt: 4, p: 2, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          You need to login first to access time events.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  if (loading) {
    return <Typography variant="h6" sx={{ mt: 4, textAlign: 'center' }}>Loading...</Typography>;
  }

  if (error) {
    return (
      <Box sx={{ mt: 4, p: 2, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Back to Login
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
        Time Events
      </Typography>

      {workPolicy && !workPolicy.monitorNonWorkTime && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Non-Work Time Monitoring is Disabled.
        </Alert>
      )}

      {workPolicy && !workPolicy.monitorIdleTime && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Idle Time Monitoring is Disabled.
        </Alert>
      )}

      {/* Add SummaryCards component with date handling */}
      {timeEvents.length > 0 && (
        <SummaryCards
          timeEvents={timeEvents}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      )}

      {/* Charts Container - Side by side layout */}
      {timeEvents.length > 0 && (
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' }, // Stack on mobile, side by side on desktop
          gap: 2,
          mb: 4
        }}>
          {/* Left Chart */}
          <Box sx={{ flex: 1, boxShadow: 1, borderRadius: 2, width: '100%' }}>
            <HourlyDistributionChart
              timeEvents={timeEvents}
              selectedDate={selectedDate}
            />
          </Box>
          {/* Right Chart */}
          <Box sx={{ flex: 1, boxShadow: 1, borderRadius: 2, width: '100%' }}>
            <TimeLineChart
              timeEvents={timeEvents}
            />
          </Box>
        </Box>
      )}

      {timeEvents.length === 0 ? (
        <Alert severity="info">No time events found.</Alert>
      ) : (
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Type</StyledTableCell>
                  <StyledTableCell>Work ID</StyledTableCell>
                  <StyledTableCell>URL</StyledTableCell>
                  <StyledTableCell>Start Time</StyledTableCell>
                  <StyledTableCell>End Time</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filterEventsByDate(timeEvents).length > 0 ? (
                  filterEventsByDate(timeEvents).map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Box
                          component="span"
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: 12,
                            fontWeight: 500,
                            color: 'white',
                            backgroundColor:
                              event.type === 'work'
                                ? 'success.main'
                                : event.type === 'non_work'
                                  ? 'error.main'
                                  : 'warning.main',
                          }}
                        >
                          {event.type}
                        </Box>
                      </TableCell>
                      <TableCell>{event.work_id || '—'}</TableCell>
                      <TableCell>
                        <Tooltip title={event.url} arrow>
                          <Box
                            sx={{
                              maxWidth: 500,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {event.url}
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{formatDate(event.start_time)}</TableCell>
                      <TableCell>{formatDate(event.end_time)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No data for selected date
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

      )}
    </Box>
    </Container>
  );
};

export default TimeEventTable;
