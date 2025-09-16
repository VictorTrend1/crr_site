import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, List, CircularProgress, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Chip } from '@mui/material';
import { getEvents, deleteEvent, removeVolunteerFromEvent, getEventDetails, registerForEvent, checkInWithQR } from '../api';
import { useAuth } from '../AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { QrCode, LocationOn, AccessTime, QrCodeScanner, Navigation } from '@mui/icons-material';
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
  const [registrationStatus, setRegistrationStatus] = useState({});
  const [eventDetails, setEventDetails] = useState({});
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationCode, setRegistrationCode] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState('');
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

  const handleShowQR = async (event) => {
    try {
      // Get event details to check if user is creator
      const response = await getEventDetails(event._id);
      setEventDetails(response.data);
      setSelectedEvent(event);
      setShowQRCode(true);
    } catch (err) {
      console.error('Error fetching event details:', err);
    }
  };

  const handleScanQR = () => {
    setShowQRScanner(true);
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setRegistrationError('');
    setRegistrationSuccess('');
    
    try {
      const response = await registerForEvent(registrationCode);
      setRegistrationSuccess(response.data.msg);
      setRegistrationCode('');
      
      // Update registration status
      if (response.data.event) {
        setRegistrationStatus(prev => ({
          ...prev,
          [response.data.event._id]: 'partial'
        }));
      }
      
      // Refresh events
      loadEvents();
    } catch (err) {
      setRegistrationError(err.response?.data?.msg || 'Eroare la înscriere');
    }
  };

  const handleQRScanSuccess = (data) => {
    console.log('QR scan successful:', data);
    setShowQRScanner(false);
    
    // Update registration status based on response
    if (data.event) {
      setRegistrationStatus(prev => ({
        ...prev,
        [data.event._id]: 'complete'
      }));
    }
    
    // Refresh events
    loadEvents();
  };

  const loadEvents = async () => {
    try {
      const res = await getEvents();
      if (!Array.isArray(res.data)) {
        setEvents([]);
        return;
      }
      setEvents(res.data);
    } catch (err) {
      setEvents([]);
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
    <>
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
                <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                  <Button component={Link} to={`/events/${event._id}`} variant="outlined" size="small">
                    Detalii
                  </Button>
                  
                  {/* Navigation button - show if event has location */}
                  {event.location && (event.location.coordinates || event.location.address) && (
                    <Button 
                      onClick={() => handleNavigation(event)} 
                      variant="outlined" 
                      size="small"
                      color="info"
                      startIcon={<Navigation />}
                    >
                      Navighează
                    </Button>
                  )}
                  
                  {/* QR Code button - only visible to event creator */}
                  {event.createdBy === user.id && (
                    <Button 
                      onClick={() => handleShowQR(event)} 
                      variant="outlined" 
                      size="small"
                      startIcon={<QrCode />}
                    >
                      QR Code
                    </Button>
                  )}
                  
                  {/* Registration buttons for volunteers */}
                  {user.role === 'Voluntar' && (
                    <>
                      {!isRegistered && registrationStatus[event._id] !== 'partial' && (
                        <Button 
                          onClick={() => setShowRegistrationForm(true)} 
                          variant="contained" 
                          size="small"
                          color="primary"
                        >
                          Înscriere
                        </Button>
                      )}
                      
                      {registrationStatus[event._id] === 'partial' && (
                        <Chip 
                          label="Înscris parțial - scanează QR" 
                          color="warning" 
                          size="small"
                        />
                      )}
                      
                      {/* QR scan button - always visible for volunteers */}
                      <Button 
                        onClick={handleScanQR} 
                        variant="contained" 
                        size="small"
                        color="success"
                        startIcon={<QrCodeScanner />}
                      >
                        Scanează QR
                      </Button>
                    </>
                  )}
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

      {/* QR Code Display Dialog - Only for event creators */}
      <Dialog open={showQRCode} onClose={() => setShowQRCode(false)} maxWidth="sm" fullWidth>
        <DialogTitle>QR Code pentru Check-in</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Typography variant="h6">{selectedEvent?.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              Cod eveniment: {selectedEvent?.code}
            </Typography>
            {eventDetails?.qrCode ? (
              <Box>
                <img 
                  src={eventDetails.qrCode} 
                  alt="QR Code" 
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
                  Acest QR code poate fi scanat de oricine pentru a se înregistra automat la eveniment (până la începerea evenimentului)
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="error">
                Nu aveți permisiunea de a vedea QR code-ul acestui eveniment. Doar creatorul evenimentului poate vedea QR code-ul.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQRCode(false)}>Închide</Button>
        </DialogActions>
      </Dialog>

      {/* Registration Form Dialog */}
      <Dialog open={showRegistrationForm} onClose={() => setShowRegistrationForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Înscriere la eveniment</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleRegistrationSubmit} sx={{ mt: 2 }}>
            {registrationError && (
              <Typography color="error" sx={{ mb: 2 }}>
                {registrationError}
              </Typography>
            )}
            {registrationSuccess && (
              <Typography color="success.main" sx={{ mb: 2 }}>
                {registrationSuccess}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Introdu codul evenimentului pentru a te înscrie parțial. După înscriere, va trebui să scanezi QR code-ul pentru a completa înregistrarea.
            </Typography>
            <Box display="flex" gap={1}>
              <input
                type="text"
                placeholder="Cod eveniment"
                value={registrationCode}
                onChange={(e) => setRegistrationCode(e.target.value)}
                required
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <Button type="submit" variant="contained" color="primary">
                Înscriere
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRegistrationForm(false)}>Anulează</Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Scanner Dialog */}
      <QRCodeScanner
        open={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onSuccess={handleQRScanSuccess}
      />
    </>
  );
} 
