import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
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
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

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

  const handleSubmit = () => {
    // Validate form
    if (!formData.name || !formData.startTime || !formData.endTime) {
      setError('Please fill in all required fields');
      return;
    }
  
    if (formData.recurringDays.length === 0) {
      setError('Please select at least one working day');
      return;
    }
  
    setIsLoading(true);
  
    if (editingShift) {
      // Update existing shift
      const updatedShifts = shifts.map(shift =>
        shift.id === editingShift.id ? { ...formData, id: editingShift.id } : shift
      );
      setShifts(updatedShifts);
      setSuccess('Shift updated successfully');
    } else {
      // Add new shift
      const newShift = {
        ...formData,
        id: shifts.length + 1
      };
      setShifts(prev => [...prev, newShift]);
      setSuccess('Shift created successfully');
    }
  
    setIsLoading(false);
    resetForm();
  };
  
  const handleEdit = (shift: Shift) => {
    setEditingShift(shift);
    setFormData(shift);
  };

  const handleDelete = (id: number) => {
    setShifts(prev => prev.filter(shift => shift.id !== id));
    setSuccess('Shift deleted successfully');
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

  const formatTime = (date: Date) => {
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
                    value={formData.startTime}
                    onChange={(date) => handleInputChange('startTime', date)}
                    sx={{ width: '100%' }}
                  />

                  <MobileTimePicker
                    label="End Time"
                    value={formData.endTime}
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
                  {shifts.length === 0 ? (
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
                    shifts.map((shift) => (
                      <ListItem
                        key={shift.id}
                        divider
                        secondaryAction={
                          <Box>
                            <IconButton onClick={() => handleEdit(shift)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(shift.id!)}>
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
                                Working Days: {shift.recurringDays.map(day => DAYS_OF_WEEK[day].substring(0, 3)).join(', ')}
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