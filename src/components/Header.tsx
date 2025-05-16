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
  useTheme,
  Avatar,
  Tooltip,
  Fade,
  Divider,
  alpha
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const { logout, appUser } = useAuth();
  
  // Check if a route is active
  const isActive = (path: string) => location.pathname === path;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const navigateTo = (path: string) => {
    navigate(path);
    handleMenuClose();
    handleProfileMenuClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
    handleMenuClose();
    handleProfileMenuClose();
  };
  return (
    <AppBar 
      position="static" 
      elevation={3}
      sx={{
        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            '&:hover': { 
              cursor: 'pointer',
              '& .MuiTypography-root': { color: 'white' }
            },
            transition: 'all 0.3s ease'
          }}
          onClick={() => navigateTo('/')}
        >
          <AccessTimeIcon sx={{ mr: 1.5, fontSize: 28 }} />
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 600, 
              letterSpacing: '0.5px',
              transition: 'color 0.3s ease',
            }}
          >
            CrewQuant
          </Typography>
        </Box>        
        {/* User avatar/info */}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          {appUser && (
            <Tooltip title={appUser.email} arrow>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mr: { xs: 1, md: 3 },
                  cursor: 'pointer',
                  borderRadius: 1,
                  '&:hover': {
                    background: alpha(theme.palette.common.white, 0.1),
                  },
                  transition: 'all 0.2s',
                  py: 0.5,
                  px: 1
                }}
                onClick={handleProfileMenuOpen}
              >
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36, 
                    bgcolor: theme.palette.secondary.main,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}
                >
                  {appUser.email?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    ml: 1.5, 
                    display: { xs: 'none', md: 'block' },
                    fontWeight: 500
                  }}
                >
                  {appUser.email?.split('@')[0] || 'User'}
                </Typography>
              </Box>
            </Tooltip>
          )}

          {/* Profile Menu */}
          <Menu
            anchorEl={profileMenuAnchorEl}
            open={Boolean(profileMenuAnchorEl)}
            onClose={handleProfileMenuClose}
            TransitionComponent={Fade}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1,
                minWidth: 200,
                overflow: 'visible',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              }
            }}
          >
            <MenuItem dense sx={{ py: 1.5 }}>
              <AccountCircleIcon sx={{ mr: 2, color: 'primary.main' }} fontSize="small" />
              My Profile
            </MenuItem>
            <MenuItem dense sx={{ py: 1.5 }}>
              <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} fontSize="small" />
              Settings
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleLogout} dense sx={{ py: 1.5 }}>
              <LogoutIcon sx={{ mr: 2, color: 'error.main' }} fontSize="small" />
              Logout
            </MenuItem>
          </Menu>
        
          {/* Mobile menu */}
          {isMobile ? (
            <>
              <IconButton
                size="medium"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenuOpen}
                sx={{
                  border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
                  borderRadius: 1,
                  p: 0.5,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.white, 0.1)
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={mobileMenuAnchorEl}
                open={Boolean(mobileMenuAnchorEl)}
                onClose={handleMenuClose}
                TransitionComponent={Fade}
                PaperProps={{ 
                  elevation: 3,
                  sx: { mt: 1.5, width: 200 }
                }}
              >
                <MenuItem 
                  onClick={() => navigateTo('/time-events')}
                  sx={{ 
                    py: 1.5,
                    bgcolor: isActive('/time-events') ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    borderLeft: isActive('/time-events') ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                  }}
                >
                  <AccessTimeIcon sx={{ mr: 2, color: 'primary.main' }} /> 
                  <Typography variant="body2" fontWeight={500}>Time Events</Typography>
                </MenuItem>
                <MenuItem 
                  onClick={() => navigateTo('/shift-creation')}
                  sx={{ 
                    py: 1.5,
                    bgcolor: isActive('/shift-creation') ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    borderLeft: isActive('/shift-creation') ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                  }}
                >
                  <CalendarMonthIcon sx={{ mr: 2, color: 'primary.main' }} /> 
                  <Typography variant="body2" fontWeight={500}>Shift Creation</Typography>
                </MenuItem>
                <MenuItem 
                  onClick={() => navigateTo('/shift-assignment')}
                  sx={{ 
                    py: 1.5,
                    bgcolor: isActive('/shift-assignment') ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    borderLeft: isActive('/shift-assignment') ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                  }}
                >
                  <AssignmentIcon sx={{ mr: 2, color: 'primary.main' }} /> 
                  <Typography variant="body2" fontWeight={500}>Shift Assignment</Typography>
                </MenuItem>
                <MenuItem 
                  onClick={() => navigateTo('/work-policy')}
                  sx={{ 
                    py: 1.5,
                    bgcolor: isActive('/work-policy') ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    borderLeft: isActive('/work-policy') ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                  }}
                >
                  <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} /> 
                  <Typography variant="body2" fontWeight={500}>Work Policy</Typography>
                </MenuItem>
              </Menu>
            </>
          ) : (
            /* Desktop menu */
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 1.5, mr: 2 }}>
                <Button 
                  color="inherit" 
                  startIcon={<AccessTimeIcon />}
                  onClick={() => navigateTo('/time-events')}
                  sx={{
                    borderRadius: 2,
                    px: 1.8,
                    py: 0.8,
                    textTransform: 'none',
                    fontWeight: 600,
                    position: 'relative',
                    bgcolor: isActive('/time-events') ? alpha(theme.palette.common.white, 0.1) : 'transparent',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.common.white, 0.15)
                    },
                    '&::after': isActive('/time-events') ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '15%',
                      width: '70%',
                      height: 2,
                      bgcolor: theme.palette.secondary.main,
                      borderRadius: 2
                    } : {}
                  }}
                >
                  Time Events
                </Button>
                <Button 
                  color="inherit" 
                  startIcon={<SettingsIcon />}
                  onClick={() => navigateTo('/work-policy')}
                  sx={{
                    borderRadius: 2,
                    px: 1.8,
                    py: 0.8,
                    textTransform: 'none',
                    fontWeight: 600,
                    position: 'relative',
                    bgcolor: isActive('/work-policy') ? alpha(theme.palette.common.white, 0.1) : 'transparent',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.common.white, 0.15)
                    },
                    '&::after': isActive('/work-policy') ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '15%',
                      width: '70%',
                      height: 2,
                      bgcolor: theme.palette.secondary.main,
                      borderRadius: 2
                    } : {}
                  }}
                >
                  Work Policy
                </Button>
                <Button 
                  color="inherit" 
                  startIcon={<CalendarMonthIcon />}
                  onClick={() => navigateTo('/shift-creation')}
                  sx={{
                    borderRadius: 2,
                    px: 1.8,
                    py: 0.8,
                    textTransform: 'none',
                    fontWeight: 600,
                    position: 'relative',
                    bgcolor: isActive('/shift-creation') ? alpha(theme.palette.common.white, 0.1) : 'transparent',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.common.white, 0.15)
                    },
                    '&::after': isActive('/shift-creation') ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '15%',
                      width: '70%',
                      height: 2,
                      bgcolor: theme.palette.secondary.main,
                      borderRadius: 2
                    } : {}
                  }}
                >
                  Shifts
                </Button>
                <Button 
                  color="inherit" 
                  startIcon={<AssignmentIcon />}
                  onClick={() => navigateTo('/shift-assignment')}
                  sx={{
                    borderRadius: 2,
                    px: 1.8,
                    py: 0.8,
                    textTransform: 'none', 
                    fontWeight: 600,
                    position: 'relative',
                    bgcolor: isActive('/shift-assignment') ? alpha(theme.palette.common.white, 0.1) : 'transparent',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.common.white, 0.15)
                    },
                    '&::after': isActive('/shift-assignment') ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '15%',
                      width: '70%',
                      height: 2,
                      bgcolor: theme.palette.secondary.main,
                      borderRadius: 2
                    } : {}
                  }}
                >
                  Assignments
                </Button>
                
              </Box>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;