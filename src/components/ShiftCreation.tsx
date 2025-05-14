import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Alert,
  Snackbar,
  Grid as MuiGrid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { createShift, getShifts, deleteShift,updateShift  } from '../services/ShiftService';

// Fix for Material-UI Grid component typing
const Grid = MuiGrid as React.ComponentType<any>;

interface Shift {
  id?: number;
  name: string;
  startTime: Date;
  endTime: Date;
  breakDuration: number;
  recurringDays: number[];
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ShiftCreation: React.FC = () => {
  // State for shifts list
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  
  // State for current form data
  const [formData, setFormData] = useState<Shift>({
    name: '',
    startTime: new Date(),
    endTime: new Date(),
    breakDuration: 30,
    recurringDays: []
  });

  // UI state
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get token from localStorage
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      const fetchShifts = async () => {
        try {
          const response = await getShifts(token, currentUserId);
          console.log('API response:', response); // Should show { shifts: [...] }
  
          if (Array.isArray(response.shifts)) {
            // Map the API response to match the Shift type
            const mappedShifts = response.shifts.map((shift: any) => {
              // Add current date to the time for valid Date parsing
              const dateToday = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
              const startDateTime = new Date(`${dateToday}T${shift.start_time}`);
              const endDateTime = new Date(`${dateToday}T${shift.end_time}`);
  
              return {
                id: shift.id,
                name: shift.shift_name,
                startTime: startDateTime,
                endTime: endDateTime,
                breakDuration: shift.break_duration || 30, 
                recurringDays: shift.days.map((day: string) => DAYS_OF_WEEK.indexOf(day))
              };
            });
            setShifts(mappedShifts); // Correctly extracted array
          } else {
            console.error('Unexpected response structure:', response);
            setError('Invalid response format');
          }
        } catch (err) {
          console.error('Error fetching shifts:', err);
          setError('Failed to fetch shifts');
        }
      };
  
      fetchShifts();
    }
  }, [token]);

  useEffect(() => {
    // Get user from localStorage
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const userData = JSON.parse(userString);
        setCurrentUserId(userData.id);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);
  

  const handleInputChange = (field: keyof Shift, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDayToggle = (day: number) => {
    setFormData(prev => {
      const days = prev.recurringDays.includes(day)
        ? prev.recurringDays.filter(d => d !== day)
        : [...prev.recurringDays, day];
      return {
        ...prev,
        recurringDays: days
      };
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.startTime || !formData.endTime || isNaN(formData.startTime.getTime()) || isNaN(formData.endTime.getTime())) {
      setError('Please fill in all required fields');
      return;
    }
  
    if (formData.breakDuration <= 0 || isNaN(formData.breakDuration)) {
      setError('Break duration must be a positive integer.');
      return;
    }
  
    if (formData.recurringDays.length === 0) {
      setError('Please select at least one working day');
      return;
    }
  
    setIsLoading(true);
  
    const payload = {
      user_id: currentUserId,  // Replace with actual dynamic user ID if needed
      shift_name: formData.name,
      start_time: format(formData.startTime, 'HH:mm:ss'),
      end_time: format(formData.endTime, 'HH:mm:ss'),
      days: formData.recurringDays.map((i) => DAYS_OF_WEEK[i]),
      break_duration: formData.breakDuration,
    };
  
    try {
      if (editingShift) {
        await updateShift(editingShift.id!, payload, token!);
  
        const updatedShifts = shifts.map((shift) =>
          shift.id === editingShift.id ? { ...formData, id: editingShift.id } : shift
        );
        setShifts(updatedShifts);
        setSuccess('Shift updated successfully');
      } else {
        const createdShift = await createShift(payload, token!);
        setShifts((prev) => [...prev, { ...formData, id: createdShift.id }]);
        setSuccess('Shift created successfully');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save shift. Please try again.');
    }
  
    setIsLoading(false);
    resetForm();
  };
  
  
  const handleEdit = (shift: Shift) => {
    setEditingShift(shift);
    setFormData(shift);
  };

  const handleDelete = async (id: number) => {
    if (!token) {
      setError('You need to log in to delete shifts');
      return;
    }
  
    try {
      // Call the deleteShift function from the service to delete the shift
      await deleteShift(id.toString(), token);
  
      // Remove the deleted shift from the state
      setShifts(prev => prev.filter(shift => shift.id !== id));
      setSuccess('Shift deleted successfully');
    } catch (err) {
      console.error('Error deleting shift:', err);
      setError('Failed to delete shift. Please try again.');
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      startTime: new Date(),
      endTime: new Date(),
      breakDuration: 30,
      recurringDays: []
    });
    setEditingShift(null);
  };

  const formatTime = (date: Date | null) => {
    if (!date || isNaN(date.getTime())) {
      return 'Invalid Time'; // Return fallback text for invalid dates
    }
    return format(date, 'hh:mm a');
  };

  // Authentication check
  if (!token) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="warning">
            You need to login first to manage shifts.
          </Alert>
          <Button 
            variant="contained" 
            href="/"
            sx={{ mt: 2 }}
          >
            Go to Login
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" textAlign="center" gutterBottom>
            Shift Management
          </Typography>
    
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Left column - Shift Form */}
            <Box sx={{ flex: 1}}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {editingShift ? 'Edit Shift' : 'Create New Shift'}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Shift Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    fullWidth
                    required
                  />

                  <MobileTimePicker
                    label="Start Time"
                    value={formData.startTime || new Date()}
                    onChange={(date) => handleInputChange('startTime', date)}
                    sx={{ width: '100%' }}
                  />

                  <MobileTimePicker
                    label="End Time"
                    value={formData.endTime || new Date()}
                    onChange={(date) => handleInputChange('endTime', date)}
                    sx={{ width: '100%' }}
                  />

                  <TextField
                    label="Break Duration (minutes)"
                    type="number"
                    value={formData.breakDuration}
                    onChange={(e) => handleInputChange('breakDuration', parseInt(e.target.value))}
                    fullWidth
                  />
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Working Days
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {DAYS_OF_WEEK.map((day, index) => (
                        <Chip
                          key={day}
                          label={day.substring(0, 3)}
                          onClick={() => handleDayToggle(index)}
                          color={formData.recurringDays.includes(index) ? 'primary' : 'default'}
                          variant={formData.recurringDays.includes(index) ? 'filled' : 'outlined'}
                        />
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                    <Button onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={isLoading}
                    >
                      {editingShift ? 'Update Shift' : 'Create Shift'}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Box>
            {/* Right column - Shifts List */}
            <Box sx={{ flex: 1, mb: 4 }}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Shift Schedule
                </Typography>

                <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                  {Array.isArray(shifts) && shifts.length === 0 ? (
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography color="textSecondary" align="center">
                            No shifts created yet
                          </Typography>
                        }
                      />
                    </ListItem>
                  ) : (
                    // Safeguard: Check if shifts is an array before mapping
                    Array.isArray(shifts) &&
                    shifts.map((shift) => (
                      <ListItem
                        key={shift.id}
                        divider
                        secondaryAction={
                          <Box>
                            <IconButton onClick={() => handleEdit(shift)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(shift.id!)} >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemText
                          primary={shift.name}
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="body2">
                                {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                Working Days: {shift.recurringDays && Array.isArray(shift.recurringDays) ? shift.recurringDays.map(day => DAYS_OF_WEEK[day].substring(0, 3)).join(', ') : 'N/A'}
                              </Box>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </Paper>
            </Box>
          </Box>
          <Snackbar
            open={!!error || !!success}
            autoHideDuration={6000}
            onClose={() => {
              setError(null);
              setSuccess(null);
            }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              severity={error ? 'error' : 'success'}
              onClose={() => {
                setError(null);
                setSuccess(null);
              }}
            >
              {error || success}
            </Alert>
          </Snackbar>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};
export default ShiftCreation;