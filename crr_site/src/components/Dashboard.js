import React from 'react';
import { Typography, Box, Alert, Button, TextField } from '@mui/material';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import EventList from './EventList';
import AlarmIcon from './AlarmIcon';
import { useEffect, useState } from 'react';
import EventCreateForm from './EventCreateForm';
import EventRegisterForm from './EventRegisterForm';

export default function Dashboard() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [inactive, setInactive] = useState(false);
  const [refresh, setRefresh] = useState(0);





  useEffect(() => {
    async function checkInactive() {
      if (user.role === 'Voluntar') {
        setInactive(user.inactive);
      }
    }
    checkInactive();
  }, [user]);

  if (!user) return null;

  return (
    <Box mt={4}>
      <Typography variant="h4" mb={2}>
        Bun venit, {user.name}!
        {user.role === 'Voluntar' && <AlarmIcon active={inactive} message="Nu ai activitate de peste 3 luni!" />}
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Rolul tău: <strong>{user.role}</strong> | Indicator: <strong>{user.indicator}</strong>
      </Alert>

      {/* Profile section */}
      <Box mt={3} p={2} sx={{ border: '1px solid #eee', borderRadius: 1 }}>
        <Typography variant="h6" mb={1}>Profil</Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Vizualizează și partajează profilul tău cu un cod QR unic
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate(`/profile/${user.indicator}`)}
        >
          Vezi Profilul Meu
        </Button>
              </Box>


      {/* Event creation for Organizator/Admin */}
      {(user.role === 'Organizator' || user.role === 'Admin') && (
        <EventCreateForm onCreated={() => setRefresh(r => r + 1)} />
      )}
      {/* Event registration for Voluntar/Organizator/Admin */}
      {(user.role === 'Voluntar' || user.role === 'Organizator' || user.role === 'Admin') && (
        <EventRegisterForm onRegistered={() => setRefresh(r => r + 1)} />
      )}
      {/* Event list */}
      {user.role !== 'Vizitator' && (
        <Box mt={4}>
          <Typography variant="h5" mb={2}>Evenimente</Typography>
          <EventList key={refresh} />
        </Box>
      )}
      {user.role === 'Vizitator' && (
        <Box mt={4}>
          <Typography variant="h5" mb={2}>Evenimente publice</Typography>
          <Typography>Doar vizualizare. Înscrierea necesită cont Voluntar.</Typography>
          <EventList />
        </Box>
      )}


    </Box>
  );
} 