import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Container,
    MenuItem,
    List,
    ListItem,
    ListItemText,
    Snackbar,
    Alert,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { getShifts, getUsers, createAssignment, getAssignments, deleteAssignment, updateAssignment} from '../services/ShiftService';
import { useNavigate } from 'react-router-dom';

interface Shift {
    id: number;
    name: string;
    startTime: Date;
    endTime: Date;
    breakDuration: number;
    recurringDays: string[] | number[];
}

interface User {
    id: number;
    userName: string;
}

interface Assignment {
    id?: number;
    userId: number;
    userName: string;
    shift: Shift;
    startDate: Date;
    endDate: Date;
}

const ShiftAssignment: React.FC = () => {
    const navigate = useNavigate();
    const [shifts, setShifts] = useState<Shift[]>([]);

    const [formData, setFormData] = useState<Assignment>({
        userId: 0,
        userName: '',
        shift: { id: 0, name: '', startTime: new Date(), endTime: new Date(), breakDuration: 0, recurringDays: [] },
        startDate: new Date(),
        endDate: new Date(),
    });

    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // Fetch shifts and users on component mount
    useEffect(() => {
        if (token) {
            fetchShifts();
            fetchUsers();
            fetchAssignments();
        }
    }, [token]);

    const fetchShifts = async () => {
        try {
            const response = await getShifts(token!);
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
                        recurringDays: shift.days
                    };
                });
                setShifts(mappedShifts);
                return mappedShifts; // Return the mapped shifts array
            } else {
                console.error('Unexpected response structure:', response);
                setStatusMessage('Invalid response format');
                return []; // Return empty array as fallback
            }
        } catch (err) {
            console.error('Error fetching shifts:', err);
            setStatusMessage('Failed to fetch shifts');
            return []; // Return empty array on error
        }
    };

    const [users, setUsers] = useState<User[]>([]);

    const fetchUsers = async () => {
        try {
            const response = await getUsers(token!);
            if (response.user) {
                // Create a single-item array with the user from the response
                setUsers([{
                    id: response.user.id,
                    userName: response.user.email || `User ${response.user.id}`  // Use email as display name
}]);
            } else {
                console.error('Unexpected response structure:', response);
                setStatusMessage('Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setStatusMessage('Failed to fetch users');
        }
    }

    const handleAssign = async () => {
        if (!token) {
            setStatusMessage("You need to login first.");
            return;
        }

        setIsLoading(true);
        const { userId, shift, startDate, endDate } = formData;

        if (!userId || !shift.id || !startDate || !endDate) {
            setStatusMessage("All fields are required.");
            setIsLoading(false);
            return;
        }

        if (startDate > endDate) {
            setStatusMessage("Start date cannot be after end date.");
            setIsLoading(false);
            return;
        }

        const user = users.find((u) => u.id === userId);
        
        if (!user) {
            setStatusMessage("Invalid user.");
            setIsLoading(false);
            return;
        }

        // Check if the shift is already assigned
        const exists = assignments.some((a) => a.userId === userId && a.shift.id === shift.id);
        if (exists) {
            setStatusMessage("This shift is already assigned.");
            setIsLoading(false);
            return;
        }

        try {
            // Prepare payload for API
            const payload = {
                user_id: userId,
                shift_id: shift.id,
                start_date: format(startDate, 'yyyy-MM-dd'),
                end_date: format(endDate, 'yyyy-MM-dd')
            };

            // Call API to create assignment
            const response = await createAssignment(payload, token);
            
            // Create new assignment with API response data
            const newAssignment: Assignment = { 
                id: response.id,
                userId,
                userName: user.userName,
                shift,
                startDate,
                endDate
            };

            setAssignments([...assignments, newAssignment]);
            setFormData({
                userId: 0,
                userName: '',
                shift: { id: 0, name: '', startTime: new Date(), endTime: new Date(), breakDuration: 0, recurringDays: [] },
                startDate: new Date(),
                endDate: new Date(),
            });
            setStatusMessage("Shift assigned successfully!");
        } catch (err) {
            console.error('Error assigning shift:', err);
            setStatusMessage("Failed to assign shift. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAssignments = async () => {
        if (!token) return;

        try {
            const response = await getAssignments(token);
            // Check if the response is an array (the API returns array directly)
            if (Array.isArray(response)) {
                // First fetch all shifts to ensure we have them for mapping
                const shiftsData = await fetchShifts();
                
                // Map the API response to match the Assignment type
                const mappedAssignments = response.map((assignment: any) => {
                    // Find the corresponding shift in our shifts array
                    const shiftDetails = shiftsData.find((s: any) => s.id === assignment.shift_id) || {
                        id: assignment.shift_id,
                        name: `Shift ${assignment.shift_id}`,
                        startTime: new Date(),
                        endTime: new Date(),
                        breakDuration: 30,
                        recurringDays: []
                    };

                    // Find the user to get username
                    const user = users.find(u => u.id === assignment.user_id);
                    const userName = user ? user.userName : `User ${assignment.user_id}`;
                    
                    return {
                        id: assignment.id,
                        userId: assignment.user_id,
                        userName: userName,
                        shift: shiftDetails,
                        startDate: new Date(assignment.start_date),
                        endDate: new Date(assignment.end_date)
                    };
                });
                
                setAssignments(mappedAssignments);
            } else if (response && response.assignments && Array.isArray(response.assignments)) {
                // Handle the case where response is wrapped in an object with assignments property
                // (Keeping this as fallback in case API format changes)
                // ...existing code for handling wrapped response...
            } else {
                console.error('Unexpected response structure:', response);
                setStatusMessage('Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching assignments:', err);
            setStatusMessage('Failed to fetch assignments');
        }
    };

    const handleDelete = async (assignment: Assignment) => {
        if (!token) {
            setStatusMessage("You need to login first.");
            return;
        }

        setIsLoading(true);
        try {
            // Call API to delete assignment
            await deleteAssignment(assignment.id!.toString(), token);
            
            // Remove the deleted assignment from the state
            setAssignments(assignments.filter((a) => a.id !== assignment.id));
            setStatusMessage("Shift assignment deleted successfully!");
        } catch (err) {
            console.error('Error deleting shift assignment:', err);
            setStatusMessage("Failed to delete shift assignment. Please try again.");
        } finally {
            setIsLoading(false);
        }

    };

    const handleUpdate = async (assignment: Assignment) => {
        if (!token) { 
            setStatusMessage("You need to login first.");
            return;
        }
        
        if (!assignment.id) {
            setStatusMessage("Cannot update assignment without ID.");
            return;
        }
        
        setIsLoading(true);
        try {
            // Get the latest user and shift data
            const user = users.find((u) => u.id === assignment.userId);
            if (!user) {
                setStatusMessage("Invalid user.");
                setIsLoading(false);
                return;
            }
            
            // Make sure we have a valid shift object with all required properties
            const shift = shifts.find(s => s.id === assignment.shift.id) || assignment.shift;
            if (!shift || !shift.id) {
                setStatusMessage("Invalid shift.");
                setIsLoading(false);
                return;
            }
            
            // Prepare payload for API with correct user_id and shift_id values
            const payload = {
                user_id: assignment.userId,
                shift_id: shift.id,
                start_date: format(assignment.startDate, 'yyyy-MM-dd'),
                end_date: format(assignment.endDate, 'yyyy-MM-dd')
            };
            
            // Call API to update assignment
            await updateAssignment(assignment.id, payload, token);
            
            // Update the assignment in the local state
            setAssignments(assignments.map(a => 
                a.id === assignment.id ? 
                {
                    ...assignment,
                    userName: user.userName,
                    shift: shift
                } : a
            ));
            
            // Reset form and edit mode
            setFormData({
                userId: 0,
                userName: '',
                shift: { id: 0, name: '', startTime: new Date(), endTime: new Date(), breakDuration: 0, recurringDays: [] },
                startDate: new Date(),
                endDate: new Date(),
            });
            setIsEditing(false);
            setStatusMessage("Shift assignment updated successfully!");
        } catch (err) {
            console.error('Error updating shift assignment:', err);
            setStatusMessage("Failed to update shift assignment. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleUpdateSubmit = async () => {
        if (!isEditing) return;
        setIsLoading(true);
        try {
            // Call the update handler with the current formData
            await handleUpdate(formData);
            setIsEditing(false); // Exit edit mode on success
        } catch (err) {
            console.error('Error updating assignment:', err);
            setStatusMessage("Failed to update assignment. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (assignment: Assignment) => {
        setFormData(assignment);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormData({
            userId: 0,
            userName: '',
            shift: { id: 0, name: '', startTime: new Date(), endTime: new Date(), breakDuration: 0, recurringDays: [] },
            startDate: new Date(),
            endDate: new Date(),
        });
    };

    // Only JSX changes inside return statement:

// Authentication check
if (!token) {
    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Alert severity="warning">
                    You need to login first to manage shift assignments.
                </Alert>
                <Button 
                    variant="contained" 
                    onClick={() => navigate('/')}
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
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" textAlign="center" gutterBottom>
                    Assign Shift to User
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 4,
                        alignItems: 'stretch',
                    }}
                >
                    {/* Form Section */}
                    <Paper elevation={4} sx={{ p: 4, flex: 1, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Shift Assignment Form
                        </Typography>
                        <TextField
                            label="Select User"
                            value={formData.userId}
                            onChange={(e) => setFormData({ ...formData, userId: parseInt(e.target.value) })}
                            select
                            fullWidth
                            sx={{ mb: 2 }}
                        >
                            {users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.userName}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Select Shift"
                            value={formData.shift.id}
                            onChange={(e) => {
                                const selectedShift = shifts.find(s => s.id === parseInt(e.target.value));
                                if (selectedShift) setFormData({ ...formData, shift: selectedShift });
                            }}
                            select
                            fullWidth
                            sx={{ mb: 2 }}
                        >
                            {shifts.map((shift) => (
                                <MenuItem key={shift.id} value={shift.id}>
                                    {shift.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <DatePicker
                                label="Start Date"
                                value={formData.startDate}
                                onChange={(newDate) => setFormData({ ...formData, startDate: newDate! })}
                            />
                            <DatePicker
                                label="End Date"
                                value={formData.endDate}
                                onChange={(newDate) => setFormData({ ...formData, endDate: newDate! })}
                            />
                        </Box>

                        <Button
                            variant="contained"
                            sx={{ mt: 3 }}
                            fullWidth
                            onClick={isEditing ? handleUpdateSubmit : handleAssign}
                            disabled={isLoading || !formData.userId || !formData.shift.id || !formData.startDate || !formData.endDate}
                        >
                            {isLoading ? 'Processing...' : isEditing ? 'Update Assignment' : 'Assign Shift'}
                        </Button>
                        
                        {isEditing && (
                            <Button
                                variant="outlined"
                                sx={{ mt: 2 }}
                                fullWidth
                                onClick={handleCancelEdit}
                            >
                                Cancel Edit
                            </Button>
                        )}
                    </Paper>

                    {/* Assigned Shifts Section */}
                    <Paper elevation={4} sx={{ p: 4, flex: 1, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Assigned Shifts
                        </Typography>
                        <List dense>
                            {assignments.map((assignment, index) => (
                                <ListItem key={assignment.id || index} divider>
                                    <ListItemText
                                        primary={`Email: ${users.find(user => user.id === assignment.userId)?.userName || 'Unknown'}`}
                                        secondary={
                                            <>
                                                <Typography variant="body2">Shift: {assignment.shift.name}</Typography>
                                                <Typography variant="body2">Start Date: {assignment.startDate.toDateString()}</Typography>
                                                <Typography variant="body2">End Date: {assignment.endDate.toDateString()}</Typography>
                                                <Typography variant="body2">Start Time: {assignment.shift.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                                                <Typography variant="body2">End Time: {assignment.shift.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                                                <Typography variant="body2">Break: {assignment.shift.breakDuration} mins</Typography>
                                                <Typography variant="body2">Days: {Array.isArray(assignment.shift.recurringDays) ? assignment.shift.recurringDays.join(', ') : 'None'}</Typography>
                                            </>
                                        }
                                    />
                                    <IconButton onClick={() => {
                                        setFormData(assignment);
                                        setIsEditing(true);
                                    }}>
                                        <EditIcon/>
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(assignment)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Box>

                {/* Snackbar */}
                <Snackbar
                    open={statusMessage !== null || error !== null}
                    autoHideDuration={3000}
                    onClose={() => {
                        setStatusMessage(null);
                        setError(null);
                    }}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={() => {
                            setStatusMessage(null);
                            setError(null);
                        }}
                        severity={statusMessage?.includes('success') ? 'success' : 'error'}
                        sx={{ width: '100%' }}
                    >
                        {statusMessage || error}
                    </Alert>
                </Snackbar>
            </Box>
        </Container>
    </LocalizationProvider>
);
};
    
export default ShiftAssignment;

