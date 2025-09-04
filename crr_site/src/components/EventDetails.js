import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEventDetails, removeVolunteerFromEvent, addEventAdmin, removeEventAdmin } from '../api';
import { useAuth } from '../AuthContext';
import { Box, Typography, Avatar, Chip, List, ListItem, ListItemAvatar, ListItemText, CircularProgress, Alert, Button } from '@mui/material';

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