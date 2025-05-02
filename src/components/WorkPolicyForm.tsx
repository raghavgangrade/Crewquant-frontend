import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Switch, 
  FormControlLabel, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  Alert,
  Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { WorkPolicyService, WorkPolicy, WorkUrl } from '../services/workPolicyService';

const WorkPolicyForm: React.FC = () => {
  const [workPolicy, setWorkPolicy] = useState<WorkPolicy>({
    workUrls: [],
    monitorIdleTime: false,
    monitorNonWorkTime: false
  });

  const [newUrlPattern, setNewUrlPattern] = useState('');
  const [newWorkIdExtractor, setNewWorkIdExtractor] = useState('');
  const [editingPattern, setEditingPattern] = useState<WorkUrl | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  // Fetch work policy on component mount
  useEffect(() => {
    fetchWorkPolicy();
  }, []);

  // UI HANDLERS
  const handleAddPattern = () => {
    if (!newUrlPattern || !newWorkIdExtractor) return;
    
    // Create new pattern
    const newPattern: WorkUrl = {
      urlPattern: newUrlPattern,
      workIdExtractor: newWorkIdExtractor
    };

    // Update local state only - no API call
    setWorkPolicy(prev => ({
      ...prev,
      workUrls: [...prev.workUrls, newPattern]
    }));
    
    // Clear form
    setNewUrlPattern('');
    setNewWorkIdExtractor('');
    setSuccess('URL pattern added locally');
  };

  const handleDeletePattern = (index: number) => {
    // Update local state only - no API call
    setWorkPolicy(prev => ({
      ...prev,
      workUrls: prev.workUrls.filter((_, i) => i !== index)
    }));
    
    setSuccess('URL pattern removed locally - click Save Settings to persist');
  };

  const handleEditPattern = (pattern: WorkUrl, index: number) => {
    setEditingPattern({ ...pattern });
    setNewUrlPattern(pattern.urlPattern);
    setNewWorkIdExtractor(pattern.workIdExtractor);
    setIsDialogOpen(true);
  };

  const handleUpdatePattern = async () => {
    if (!token || !editingPattern || !newUrlPattern || !newWorkIdExtractor || !workPolicy.id) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Update local state first for responsive UI
      const updatedPattern: WorkUrl = {
        urlPattern: newUrlPattern,
        workIdExtractor: newWorkIdExtractor
      };

      // Find the pattern to update
      const updatedWorkUrls = [...workPolicy.workUrls];
      const index = updatedWorkUrls.findIndex(
        pattern => pattern.urlPattern === editingPattern.urlPattern && 
                  pattern.workIdExtractor === editingPattern.workIdExtractor
      );
      
      if (index !== -1) {
        updatedWorkUrls[index] = updatedPattern;
      }
      
      // Create updated policy data
      const updatedPolicy: WorkPolicy = {
        ...workPolicy,
        workUrls: updatedWorkUrls
      };
      
      // Make direct PUT request to update the work policy
      await WorkPolicyService.updateWorkPolicy(token, updatedPolicy);
      
      // Update local state after successful API call
      setWorkPolicy(updatedPolicy);
      
      setSuccess('URL pattern updated successfully!');
      setIsDialogOpen(false);
      setNewUrlPattern('');
      setNewWorkIdExtractor('');
      setEditingPattern(null);
    } catch (err) {
      console.error('Error updating URL pattern:', err);
      setError('Failed to update URL pattern');
      // Refresh to ensure UI is in sync with server
      await fetchWorkPolicy();
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMonitorIdleTime = () => {
    // Update local state only - no API call
    setWorkPolicy(prev => ({
      ...prev,
      monitorIdleTime: !prev.monitorIdleTime
    }));
    
    setSuccess('Monitor idle time setting updated locally - click Save Settings to persist');
  };

  const handleToggleMonitorNonWorkTime = () => {
    // Update local state only - no API call
    setWorkPolicy(prev => ({
      ...prev,
      monitorNonWorkTime: !prev.monitorNonWorkTime
    }));
    
    setSuccess('Monitor non-work time setting updated locally - click Save Settings to persist');
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  // API CALLS
  const fetchWorkPolicy = async () => {
    // Return early if no token is available
    if (!token) {
      setError('You need to login first');
      return;
    }

    setIsLoading(true);
    try {
      const workPolicyData = await WorkPolicyService.fetchWorkPolicy(token);
      
      if (workPolicyData) {
        setWorkPolicy(workPolicyData);
      }
    } catch (err) {
      console.error('Error fetching work policy:', err);
      setError('Failed to load work policy settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePolicy = async () => {
    // Return early if no token is available
    if (!token) {
      setError('You need to login first');
      return;
    }

    setIsLoading(true);
    try {
      // Always use POST for the Save Settings button
      const response = await WorkPolicyService.createWorkPolicy(token, workPolicy);
      setSuccess('Work policy settings saved successfully!');
      
      // Refresh data to ensure UI is synced with server
      await fetchWorkPolicy();
    } catch (err) {
      console.error('Error saving work policy:', err);
      setError('Failed to save work policy settings');
    } finally {
      setIsLoading(false);
    }
  };

  // RENDER UI
  if (!token) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="warning">
            You need to login first to access work policy settings.
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
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h5" textAlign="center" gutterBottom>Work Policy Settings</Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, }}>
          {/* Left column - Input forms and monitoring settings */}
          <Box sx={{ flex: 1 }}>
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Add URL Pattern</Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                <TextField
                  label="URL Pattern"
                  placeholder="e.g., github.com/*"
                  value={newUrlPattern}
                  onChange={(e) => setNewUrlPattern(e.target.value)}
                  fullWidth
                />
                
                <TextField
                  label="Work ID Extractor"
                  placeholder="e.g., /issues/(\d+)"
                  value={newWorkIdExtractor}
                  onChange={(e) => setNewWorkIdExtractor(e.target.value)}
                  fullWidth
                />
                
                <Button 
                  variant="contained" 
                  onClick={handleAddPattern}
                  disabled={!newUrlPattern || !newWorkIdExtractor || isLoading}
                >
                  Add URL Pattern
                </Button>
              </Box>
            </Paper>
            
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Monitoring Settings</Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={workPolicy.monitorIdleTime}
                    onChange={handleToggleMonitorIdleTime}
                    disabled={isLoading}
                  />
                }
                label="Monitor Idle Time"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={workPolicy.monitorNonWorkTime}
                    onChange={handleToggleMonitorNonWorkTime}
                    disabled={isLoading}
                  />
                }
                label="Monitor Non-Work Time"
              />
            </Paper>
            
            <Button 
              variant="contained" 
              onClick={handleSavePolicy}
              sx={{ mt: 3 }}
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
          
          {/* Right column - List of URL patterns */}
          <Box sx={{ flex: 1 }}>
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Work URL Patterns</Typography>
              
              <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                {(!workPolicy.workUrls || workPolicy.workUrls.length === 0) ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    No URL patterns added yet
                  </Typography>
                ) : (
                  // Make sure workUrls exists and is an array before mapping
                  Array.isArray(workPolicy.workUrls) && workPolicy.workUrls.map((pattern, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <Box>
                          <IconButton edge="end" onClick={() => handleEditPattern(pattern, index)} disabled={isLoading}>
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" onClick={() => handleDeletePattern(index)} disabled={isLoading}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={pattern.urlPattern}
                        secondary={`Extractor: ${pattern.workIdExtractor}`}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Dialog open={isDialogOpen} onClose={() => !isLoading && setIsDialogOpen(false)}>
        <DialogTitle>Edit URL Pattern</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="URL Pattern"
              value={newUrlPattern}
              onChange={(e) => setNewUrlPattern(e.target.value)}
              fullWidth
              disabled={isLoading}
            />
            
            <TextField
              label="Work ID Extractor"
              value={newWorkIdExtractor}
              onChange={(e) => setNewWorkIdExtractor(e.target.value)}
              fullWidth
              disabled={isLoading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleUpdatePattern} variant="contained" disabled={isLoading}>Update</Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for showing success/error messages */}
      <Snackbar 
        open={!!error || !!success} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? 'error' : 'success'} 
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default WorkPolicyForm; 