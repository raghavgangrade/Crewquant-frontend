// src/components/Header.tsx
import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const { logout, appUser } = useAuth();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };

  const navigateTo = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
    handleMenuClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccessTimeIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CrewQuant
          </Typography>
        </Box>
        
        {appUser && (
          <Typography variant="body2" sx={{ mx: 2, display: { xs: 'none', md: 'block' } }}>
            {appUser.email}
          </Typography>
        )}
        
        {isMobile ? (
          <>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuOpen}
              sx={{ ml: 'auto' }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchorEl}
              open={Boolean(mobileMenuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => navigateTo('/time-events')}>
                <AccessTimeIcon sx={{ mr: 1 }} /> Time Events
              </MenuItem>
              <MenuItem onClick={() => navigateTo('/shift-creation')}>
                <CalendarMonthIcon sx={{ mr: 1 }} /> Shift Creation
              </MenuItem>
              <MenuItem onClick={() => navigateTo('/shift-assignment')}>
                <AssignmentIcon sx={{ mr: 1 }} /> Shift Assignment
              </MenuItem>
              <MenuItem onClick={() => navigateTo('/work-policy')}>
                <SettingsIcon sx={{ mr: 1 }} /> Work Policy
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                color="inherit" 
                startIcon={<AccessTimeIcon />}
                onClick={() => navigateTo('/time-events')}
              >
                Time Events
              </Button>
              <Button 
                color="inherit" 
                startIcon={<CalendarMonthIcon />}
                onClick={() => navigateTo('/shift-creation')}
              >
                Shifts
              </Button>
              <Button 
                color="inherit" 
                startIcon={<AssignmentIcon />}
                onClick={() => navigateTo('/shift-assignment')}
              >
                Assignments
              </Button>
              <Button 
                color="inherit" 
                startIcon={<SettingsIcon />}
                onClick={() => navigateTo('/work-policy')}
              >
                Work Policy
              </Button>
            </Box>
            <Button 
              color="inherit" 
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;