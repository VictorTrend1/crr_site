import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEventDetails, removeVolunteerFromEvent, addEventAdmin, removeEventAdmin } from '../api';
import { useAuth } from '../AuthContext';
import { Box, Typography, Avatar, Chip, List, ListItem, ListItemAvatar, ListItemText, CircularProgress, Alert, Button } from '@mui/material';
import { Navigation } from '@mui/icons-material';

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await getEventDetails(id);
        setEvent(res.data);
      } catch (err) {
        setError('Nu s-au putut încărca detaliile evenimentului');
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id, refresh]);

  const canManage = user.role === 'Admin' || (user.role === 'Organizator' && event && (event.createdBy === user.id || (event.admins || []).some(a => (a.id || a._id) === user.id)));

  const handleRemove = async (volId) => {
    if (!window.confirm('Sigur vrei să elimini acest voluntar din eveniment?')) return;
    try {
      await removeVolunteerFromEvent(id, volId);
      setRefresh(r => r + 1);
    } catch {}
  };

  const handleExit = async () => {
    if (!window.confirm('Sigur vrei să te retragi de la acest eveniment?')) return;
    try {
      console.log('Attempting to exit event:', id, 'for user:', user.id);
      await removeVolunteerFromEvent(id, user.id);
      setRefresh(r => r + 1);
      console.log('Successfully exited event');
    } catch (err) {
      console.error('Failed to exit event:', err);
      alert('A apărut o eroare la retragere. Încearcă din nou.');
    }
  };

  const handleNavigation = (event) => {
    if (!event.location) {
      alert('Locația evenimentului nu este disponibilă');
      return;
    }

    const { coordinates, address, name } = event.location;
    
    // Check if we have coordinates
    if (coordinates && coordinates.lat && coordinates.lng) {
      const lat = coordinates.lat;
      const lng = coordinates.lng;
      
      // Detect if user is on iOS or Android
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /android/i.test(userAgent);
      
      if (isIOS) {
        // Open Apple Maps on iOS
        window.open(`maps://maps.google.com/maps?daddr=${lat},${lng}&amp;ll=`);
      } else if (isAndroid) {
        // Open Google Maps on Android
        window.open(`https://maps.google.com/maps?daddr=${lat},${lng}`);
      } else {
        // Desktop or other devices - open Google Maps in new tab
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
      }
    } else if (address) {
      // Fallback to address search if no coordinates
      const encodedAddress = encodeURIComponent(address);
      
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /android/i.test(userAgent);
      
      if (isIOS) {
        // Open Apple Maps on iOS with address search
        window.open(`maps://maps.google.com/maps?q=${encodedAddress}`);
      } else if (isAndroid) {
        // Open Google Maps on Android with address search
        window.open(`https://maps.google.com/maps?q=${encodedAddress}`);
      } else {
        // Desktop or other devices - open Google Maps in new tab
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
      }
    } else {
      alert('Locația evenimentului nu este disponibilă');
    }
  };

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!event) return null;

  if (user.role === 'Voluntar' && !event.volunteers?.some(v => (v.id || v._id) === user.id)) {
    return <Alert severity="warning" sx={{ mt: 4 }}>Nu ai acces la acest eveniment.</Alert>;
  }

  const isRegistered = event.volunteers?.some(v => (v.id || v._id) === user.id);

  return (
    <Box maxWidth={600} mx="auto" mt={4}>
      <Box display="flex" alignItems="center" mb={2}>
        {event.avatar && <Avatar src={event.avatar} sx={{ width: 64, height: 64, mr: 2 }} />}
        <Box>
          <Typography variant="h4">{event.title}</Typography>
          <Typography variant="body2" color="text.secondary">{new Date(event.date).toLocaleString()}</Typography>
          {event.creator && (
            <Chip size="small" color="primary" label={`Creat de: ${event.creator.name}`} sx={{ mt: 1 }} />
          )}
        </Box>
      </Box>
      <Typography variant="body1" mb={2}>{event.description}</Typography>
      <Typography variant="body2" mb={2}><strong>Cod eveniment:</strong> {event.code}</Typography>
      
      {/* Location display with navigation button */}
      {event.location && (event.location.coordinates || event.location.address) && (
        <Box mb={2}>
          <Typography variant="body2" mb={1}>
            <strong>Locație:</strong> {event.location.name || event.location.address || 'Locație specificată'}
          </Typography>
          <Button 
            onClick={() => handleNavigation(event)} 
            variant="outlined" 
            size="small"
            color="info"
            startIcon={<Navigation />}
          >
            Navighează
          </Button>
        </Box>
      )}
      
      {event.actionReport && (
        <Button component="a" href={event.actionReport} target="_blank" rel="noopener noreferrer" variant="outlined" sx={{ mb: 2 }}>
          Fișa de intervenție
        </Button>
      )}
      {user.role === 'Voluntar' && (
        isRegistered ? (
          <Chip label="Ești înscris la acest eveniment" color="success" sx={{ mb: 2 }} />
        ) : (
          <Chip label="Nu ești înscris la acest eveniment" color="warning" sx={{ mb: 2 }} />
        )
      )}
      {user.role === 'Voluntar' && isRegistered && (
        <Button onClick={handleExit} variant="contained" color="warning" sx={{ mb: 2, ml: 2 }}>
          Retrage-te
        </Button>
      )}
      <Box mt={3}>
        <Typography variant="h6">Voluntari înscriși ({event.volunteers?.length || 0}):</Typography>
        <List>
          {event.volunteers?.map(v => {
            const isEventAdmin = (event.admins || []).some(a => (a.id || a._id) === (v.id || v._id));
            return (
              <ListItem key={v._id} secondaryAction={canManage && (
                <>
                  {!isEventAdmin && (
                    <Button onClick={async () => {
                      try {
                        await addEventAdmin(id, v.id || v._id);
                        setRefresh(r => r + 1);
                      } catch {}
                    }} sx={{ mr: 1 }}>Fă admin eveniment</Button>
                  )}
                  {isEventAdmin && (
                    <Button color="warning" onClick={async () => {
                      try {
                        await removeEventAdmin(id, v.id || v._id);
                        setRefresh(r => r + 1);
                      } catch {}
                    }} sx={{ mr: 1 }}>Revocă admin</Button>
                  )}
                  <Button color="error" onClick={() => handleRemove(v.id || v._id)}>
                    Elimină
                  </Button>
                </>
              )}>
                <ListItemAvatar><Avatar>{v.name[0]}</Avatar></ListItemAvatar>
                <ListItemText primary={v.name} secondary={v.email} />
              </ListItem>
            );
          })}
        </List>
      </Box>
      <Box mt={3}>
        <Typography variant="h6">Organizatori/Admini:</Typography>
        <List>
          {event.organizers?.map(o => (
            <ListItem key={o._id}>
              <ListItemAvatar><Avatar>{o.name[0]}</Avatar></ListItemAvatar>
              <ListItemText primary={o.name} secondary={`${o.email} (${o.role})`} />
            </ListItem>
          ))}
          {event.admins?.map(a => (
            <ListItem key={a._id}>
              <ListItemAvatar><Avatar>{a.name[0]}</Avatar></ListItemAvatar>
              <ListItemText primary={a.name} secondary={`${a.email} (Admin eveniment)`} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
} 