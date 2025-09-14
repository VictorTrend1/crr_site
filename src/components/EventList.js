import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, List, CircularProgress, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { getEvents, deleteEvent, removeVolunteerFromEvent } from '../api';
import { useAuth } from '../AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { QrCode, LocationOn, AccessTime } from '@mui/icons-material';
import QRCodeScanner from './QRCodeScanner';

export default function EventList() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(() => {
    // Persist hidden events in localStorage per user
    const key = user ? `hiddenEvents_${user.id}` : null;
    return key ? JSON.parse(localStorage.getItem(key) || '[]') : [];
  });
  const [visible, setVisible] = useState(() => {
    const key = user ? `visibleEvents_${user.id}` : null;
    return key ? JSON.parse(localStorage.getItem(key) || '[]') : [];
  });
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Update hidden and visible state if user changes
    if (user) {
      const hiddenKey = `hiddenEvents_${user.id}`;
      setHidden(JSON.parse(localStorage.getItem(hiddenKey) || '[]'));
      const visibleKey = `visibleEvents_${user.id}`;
      setVisible(JSON.parse(localStorage.getItem(visibleKey) || '[]'));
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Sigur vrei să ștergi acest eveniment?')) return;
    try {
      await deleteEvent(id);
      setEvents(events => events.filter(e => e._id !== id));
    } catch {}
  };

  const handleHide = (id) => {
    const hiddenKey = `hiddenEvents_${user.id}`;
    const visibleKey = `visibleEvents_${user.id}`;
    const newHidden = [...hidden, id];
    setHidden(newHidden);
    localStorage.setItem(hiddenKey, JSON.stringify(newHidden));
    // Remove from visible
    const newVisible = visible.filter(v => v !== id);
    setVisible(newVisible);
    localStorage.setItem(visibleKey, JSON.stringify(newVisible));
  };

  const handleExit = async (eventId) => {
    if (!window.confirm('Sigur vrei să te retragi de la acest eveniment?')) return;
    try {
      await removeVolunteerFromEvent(eventId, user.id);
      // Optionally, refresh events from backend
      setEvents(events => events.map(e => e._id === eventId ? { ...e, volunteers: (e.volunteers || []).filter(v => (v.id || v._id) !== user.id) } : e));
    } catch {}
  };

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await getEvents();
        if (!Array.isArray(res.data)) {
          setEvents([]);
          return;
        }
        setEvents(res.data);
      } catch (err) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [user]);

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  // Only show events in visible for volunteers, all for others
  let visibleEvents = events;
  if (user.role === 'Voluntar') {
    visibleEvents = events.filter(event => visible.includes(event._id));
  } else {
    visibleEvents = events.filter(event => !hidden.includes(event._id));
  }
  if (!visibleEvents.length) return <Typography mt={4}>Nu există evenimente.</Typography>;

  return (
    <List>
      {visibleEvents.map(event => {
        // Check if volunteer is registered
        const isRegistered = user.role === 'Voluntar' && event.volunteers && event.volunteers.some(v => (v.id || v._id) === user.id);
        return (
          <Card key={event._id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{event.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccessTime fontSize="small" />
                {new Date(event.date).toLocaleString('ro-RO')}
              </Typography>
              {event.endDate && (
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AccessTime fontSize="small" />
                  Până la: {new Date(event.endDate).toLocaleString('ro-RO')}
                </Typography>
              )}
              {event.location && (
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationOn fontSize="small" />
                  {event.location.name || event.location.address || 'Locație specificată'}
                </Typography>
              )}
              {event.description && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {event.description}
                </Typography>
              )}
              <Box display="flex" gap={1} flexWrap="wrap">
                <Button component={Link} to={`/events/${event._id}`} variant="outlined" size="small">
                  Detalii
                </Button>
                <Button 
                  onClick={() => { setSelectedEvent(event); setShowQRCode(true); }} 
                  variant="outlined" 
                  size="small"
                  startIcon={<QrCode />}
                >
                  QR Code
                </Button>
                <Button 
                  onClick={() => setShowQRScanner(true)} 
                  variant="contained" 
                  size="small"
                  color="success"
                  startIcon={<QrCode />}
                >
                  Check-in
                </Button>
              </Box>
              {(user.role === 'Admin' || (user.role === 'Organizator' && event.createdBy === user.id)) && (
                <>
                  <Button onClick={() => navigate(`/events/code/${event.code}/edit`)} variant="contained" color="primary" sx={{ mt: 1, mr: 1 }}>
                    Editează
                  </Button>
                  <Button onClick={() => handleDelete(event._id)} variant="contained" color="error" sx={{ mt: 1 }}>
                    Șterge
                  </Button>
                </>
              )}
              {user.role === 'Voluntar' && (
                <>
                  <Button onClick={() => handleHide(event._id)} variant="outlined" color="secondary" sx={{ mt: 1, mr: 1 }}>
                    Ascunde
                  </Button>
                  {isRegistered && (
                    <Button onClick={() => handleExit(event._id)} variant="contained" color="warning" sx={{ mt: 1 }}>
                      Retrage-te
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </List>

    {/* QR Code Display Dialog */}
    <Dialog open={showQRCode} onClose={() => setShowQRCode(false)} maxWidth="sm" fullWidth>
      <DialogTitle>QR Code pentru Check-in</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Typography variant="h6">{selectedEvent?.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            Cod eveniment: {selectedEvent?.code}
          </Typography>
          {selectedEvent?.qrCode && (
            <Box>
              <img 
                src={selectedEvent.qrCode} 
                alt="QR Code" 
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </Box>
          )}
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Scanați acest QR code pentru a vă înregistra la eveniment
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowQRCode(false)}>Închide</Button>
      </DialogActions>
    </Dialog>

    {/* QR Code Scanner Dialog */}
    <QRCodeScanner
      open={showQRScanner}
      onClose={() => setShowQRScanner(false)}
      onSuccess={(data) => {
        console.log('Check-in successful:', data);
        // Optionally refresh events or show success message
      }}
    />
  );
} 
