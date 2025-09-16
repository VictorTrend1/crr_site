import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, IconButton, Menu, MenuItem, Box, useMediaQuery, useTheme } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import { AuthProvider, useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import LogoutButton from './components/LogoutButton';
import Dashboard from './components/Dashboard';
import EventEditForm from './components/EventEditForm';
import EventDetails from './components/EventDetails';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import logo from './assets/logo.png';
import AdminUserManagement from './components/AdminUserManagement';
import OrganizerVolunteers from './components/OrganizerVolunteers';
import Profile from './components/Profile';
import PublicProfile from './components/PublicProfile';
import VolunteerChoice from './components/VolunteerChoice';
import VolunteerRegistration from './components/VolunteerRegistration';
import VisitorRegistration from './components/VisitorRegistration';
import EventCheckInRedirect from './components/EventCheckInRedirect';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';

function AppBarContent() {
  const { user, isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const mobileMenuItems = [];
  
  if (isAuthenticated && user) {
    if (user.role === 'Admin') {
      mobileMenuItems.push({ label: 'Utilizatori', path: '/admin/users' });
    }
    if (user.role === 'Organizator') {
      mobileMenuItems.push({ label: 'Voluntari', path: '/organizer/volunteers' });
    }
    mobileMenuItems.push({ label: 'Profil', path: `/profile/${user.indicator}` });
  }

  return (
    <Toolbar sx={{ bgcolor: '#fff', color: 'primary.main', boxShadow: 1, minHeight: { xs: 56, sm: 64 } }}>
      <Link component={RouterLink} to="/" sx={{ display: 'inline-flex', alignItems: 'center', mr: 2 }}>
        <img 
          src={logo} 
          alt="Red Cross Logo" 
          style={{ 
            height: isMobile ? 32 : 48,
            width: 'auto'
          }} 
        />
      </Link>
      
      <Typography 
        variant={isMobile ? "subtitle1" : "h6"} 
        component="div" 
        sx={{ 
          flexGrow: 1, 
          color: 'primary.main', 
          fontWeight: 700, 
          letterSpacing: 1,
          fontSize: { xs: '0.9rem', sm: '1.25rem' },
          display: { xs: 'none', sm: 'block' }
        }}
      >
        Crucea Roșie Dâmbovița
      </Typography>
      
      <Typography 
        variant="subtitle2" 
        component="div" 
        sx={{ 
          flexGrow: 1, 
          color: 'primary.main', 
          fontWeight: 700, 
          letterSpacing: 1,
          fontSize: '0.8rem',
          display: { xs: 'block', sm: 'none' }
        }}
      >
        CRR Dâmbovița
      </Typography>

      {isMobile ? (
        // Mobile menu
        <>
          {isAuthenticated && user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'primary.main', 
                  fontWeight: 500,
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                {user.name} ({user.role})
              </Typography>
              <IconButton
                color="inherit"
                onClick={handleMobileMenuOpen}
                sx={{ p: 1 }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}
          
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleMobileMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            {mobileMenuItems.map((item) => (
              <MenuItem 
                key={item.path}
                onClick={handleMobileMenuClose}
                component={RouterLink}
                to={item.path}
                sx={{ color: 'primary.main' }}
              >
                {item.label}
              </MenuItem>
            ))}
            {isAuthenticated && user && (
              <MenuItem onClick={handleMobileMenuClose}>
                <LogoutButton />
              </MenuItem>
            )}
          </Menu>
        </>
      ) : (
        // Desktop menu
        <>
          {isAuthenticated && user && user.role === 'Admin' && (
            <Link component={RouterLink} to="/admin/users" sx={{ color: 'primary.main', fontWeight: 600, mr: 2 }}>
              Utilizatori
            </Link>
          )}
          {isAuthenticated && user && user.role === 'Organizator' && (
            <Link component={RouterLink} to="/organizer/volunteers" sx={{ color: 'primary.main', fontWeight: 600, mr: 2 }}>
              Voluntari
            </Link>
          )}
          {isAuthenticated && user && (
            <>
              <Link component={RouterLink} to={`/profile/${user.indicator}`} sx={{ color: 'primary.main', fontWeight: 600, mr: 2 }}>
                Profil
              </Link>
              <Typography sx={{ mr: 2, color: 'primary.main', fontWeight: 500 }}>
                {user.name} ({user.role})
              </Typography>
              <LogoutButton />
            </>
          )}
        </>
      )}
    </Toolbar>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <AppBar position="static" elevation={2} sx={{ bgcolor: '#fff', color: 'primary.main' }}>
            <AppBarContent />
          </AppBar>
          <Container sx={{ mt: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<VolunteerChoice />} />
              <Route path="/volunteer-registration" element={<VolunteerRegistration />} />
              <Route path="/register-visitor" element={<VisitorRegistration />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/events/code/:code/edit" element={<EventEditForm />} />
              <Route path="/admin/users" element={<ProtectedRoute><AdminUserManagement /></ProtectedRoute>} />
              <Route path="/organizer/volunteers" element={<ProtectedRoute><OrganizerVolunteers /></ProtectedRoute>} />
              <Route path="/profile/:indicator" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/public/profile/:indicator" element={<PublicProfile />} />
              <Route path="/event-checkin/:checkInCode" element={<EventCheckInRedirect />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            </Routes>
          </Container>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
