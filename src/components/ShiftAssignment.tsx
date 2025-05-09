import React, { useState } from 'react';
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface Shift {
    id: number;
    name: string;
    startTime: Date;
    endTime: Date;
    breakDuration: number;
    recurringDays: string[];
}

interface User {
    id: number;
    userName: string;
}

interface Assignment {
    userId: number;
    userName: string;
    shift: Shift;
    startDate: Date;
    endDate: Date;
}

const ShiftAssignment: React.FC = () => {
    const [shifts, setShifts] = useState<Shift[]>([
        {
            id: 1,
            name: 'Morning Shift',
            startTime: new Date('1970-01-01T08:00:00'),
            endTime: new Date('1970-01-01T16:00:00'),
            breakDuration: 30,
            recurringDays: ['Monday', 'Tuesday'],
        },
        {
            id: 2,
            name: 'Evening Shift',
            startTime: new Date('1970-01-01T16:00:00'),
            endTime: new Date('1970-01-02T00:00:00'),
            breakDuration: 30,
            recurringDays: ['Wednesday', 'Thursday'],
        },
        {
            id: 3,
            name: 'Night Shift',
            startTime: new Date('1970-01-01T00:00:00'),
            endTime: new Date('1970-01-01T08:00:00'),
            breakDuration: 30,
            recurringDays: ['Friday', 'Saturday'],
        },

        {
            id: 4,
            name: 'Weekend Shift',
            startTime: new Date('1970-01-01T08:00:00'),
            endTime: new Date('1970-01-01T16:00:00'),
            breakDuration: 30,
            recurringDays: ['Sunday'],
        },
        {
            id: 5,
            name: ' Shift',
            startTime: new Date('1970-01-01T08:00:00'),
            endTime: new Date('1970-01-01T16:00:00'),
            breakDuration: 30,
            recurringDays: ['Monday', 'Tuesday'],
        },


    ]);

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

    const users: User[] = [
        { id: 1, userName: 'sam' },
        { id: 2, userName: 'jhon' },
        { id: 3, userName: 'doe' },
        { id: 4, userName: 'jane' },
        { id: 5, userName: 'smith' },
        { id: 6, userName: 'james' },
        { id: 7, userName: 'mike' },
        { id: 8, userName: 'sara' },
        { id: 9, userName: 'lisa' },
        { id: 10, userName: 'bob' },
        { id: 11, userName: 'alice' },
        { id: 12, userName: 'charlie' },
        { id: 13, userName: 'dave' },
        { id: 14, userName: 'eve' },
        { id: 15, userName: 'frank' },
        { id: 16, userName: 'grace' },
        { id: 17, userName: 'henry' },
        { id: 18, userName: 'irene' },
        { id: 19, userName: 'jack' },
        { id: 20, userName: 'karen' },


    ];

    

    const handleAssign = () => {
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

        const newAssignment: Assignment = { 
            ...formData,
            userName: user.userName,
        };

        // Check if the shift is already assigned
        const exists = assignments.some((a) => a.userId === userId && a.shift.id === shift.id);
        if (exists) {
            setStatusMessage("This shift is already assigned.");
            setIsLoading(false);
            return;
        }

        setAssignments([...assignments, newAssignment]);
        setFormData({
            userId: 0,
            userName: '',
            shift: { id: 0, name: '', startTime: new Date(), endTime: new Date(), breakDuration: 0, recurringDays: [] },
            startDate: new Date(),
            endDate: new Date(),
        });
        setStatusMessage("Shift assigned successfully!");
        setIsLoading(false);
    };

    const handleDelete = (assignment: Assignment) => {
        setAssignments(assignments.filter((a) => a !== assignment));
        setStatusMessage("Shift assignment deleted successfully!");
    };

    // Only JSX changes inside return statement:

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
                            onClick={handleAssign}
                            disabled={isLoading || !formData.userId || !formData.shift.id || !formData.startDate || !formData.endDate}
                        >
                            {isLoading ? 'Assigning...' : 'Assign Shift'}
                        </Button>
                    </Paper>

                    {/* Assigned Shifts Section */}
                    <Paper elevation={4} sx={{ p: 4, flex: 1, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Assigned Shifts
                        </Typography>
                        <List dense>
                            {assignments.map((assignment, index) => (
                                <ListItem key={index} divider>
                                    <ListItemText
                                        primary={`User: ${assignment.userName}`}
                                        secondary={
                                            <>
                                                <Typography variant="body2">Shift: {assignment.shift.name}</Typography>
                                                <Typography variant="body2">Start Date: {assignment.startDate.toDateString()}</Typography>
                                                <Typography variant="body2">End Date: {assignment.endDate.toDateString()}</Typography>
                                                <Typography variant="body2">Start Time: {assignment.shift.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                                                <Typography variant="body2">End Time: {assignment.shift.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                                                <Typography variant="body2">Break: {assignment.shift.breakDuration} mins</Typography>
                                                <Typography variant="body2">Days: {assignment.shift.recurringDays.join(', ')}</Typography>
                                            </>
                                        }
                                    />
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
                    open={statusMessage !== null}
                    autoHideDuration={3000}
                    onClose={() => setStatusMessage(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={() => setStatusMessage(null)}
                        severity={statusMessage?.includes('success') ? 'success' : 'error'}
                        sx={{ width: '100%' }}
                    >
                        {statusMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </Container>
    </LocalizationProvider>
);

    
};
    
export default ShiftAssignment;

                        