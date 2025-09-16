import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent
} from '@mui/material';
import { checkInWithQR } from '../api';
import { useAuth } from '../AuthContext';

const EventCheckInRedirect = () => {
  const { checkInCode } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [eventInfo, setEventInfo] = useState(null);

  useEffect(() => {
    if (!checkInCode) {
      setError('Cod de eveniment invalid.');
      setLoading(false);
      return;
    }

    if (!isAuthenticated) {
      setError('Trebuie să fii autentificat pentru a te înregistra la evenimente.');
      setLoading(false);
      return;
    }

    processCheckIn();
  }, [checkInCode, isAuthenticated]);

  const processCheckIn = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Create QR data for API
      const qrData = JSON.stringify({
        checkInCode: checkInCode,
        type: 'event_checkin'
      });

      // Process the check-in
      const response = await checkInWithQR(qrData);
      
      if (response.data.autoRegistered) {
        setSuccess('Te-ai înregistrat automat la eveniment!');
        setEventInfo({
          title: response.data.event?.title || 'Eveniment',
          date: response.data.event?.date || new Date(),
          location: response.data.event?.location || 'Nu este specificată'
        });
      } else if (response.data.completedPartialRegistration) {
        setSuccess('Înregistrarea a fost completată cu succes!');
        setEventInfo({
          title: response.data.event?.title || 'Eveniment',
          date: response.data.event?.date || new Date(),
          location: response.data.event?.location || 'Nu este specificată'
        });
      } else if (response.data.wasAlreadyRegistered) {
        setSuccess('Erai deja înregistrat la acest eveniment!');
        setEventInfo({
          title: response.data.event?.title || 'Eveniment',
          date: response.data.event?.date || new Date(),
          location: response.data.event?.location || 'Nu este specificată'
        });
      } else {
        setSuccess(response.data.msg || 'Înregistrare procesată cu succes!');
        setEventInfo({
          title: response.data.event?.title || 'Eveniment',
          date: response.data.event?.date || new Date(),
          location: response.data.event?.location || 'Nu este specificată'
        });
      }

    } catch (err) {
      console.error('Check-in error:', err);
      setError(err.response?.data?.msg || 'Eroare la procesarea înregistrării');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToProfile = () => {
    if (user?.indicator) {
      navigate(`/profile/${user.indicator}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Se procesează înregistrarea...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Te rugăm să aștepți...
        </Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh" p={2}>
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
              {!isAuthenticated && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleLogin}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    Autentificare
                  </Button>
                </Box>
              )}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {eventInfo && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom textAlign="center">
                {eventInfo.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 1 }}>
                <strong>Data:</strong> {new Date(eventInfo.date).toLocaleDateString('ro-RO')}
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                <strong>Locația:</strong> {eventInfo.location}
              </Typography>
            </Box>
          )}

          {!isAuthenticated && !eventInfo && checkInCode && (
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Eveniment găsit!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pentru a te înregistra la acest eveniment, trebuie să te autentifici mai întâi.
              </Typography>
            </Box>
          )}

          <Box display="flex" flexDirection="column" gap={2}>
            {isAuthenticated ? (
              <>
                <Button
                  variant="contained"
                  onClick={handleGoToDashboard}
                  fullWidth
                  size="large"
                >
                  Mergi la Dashboard
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={handleGoToProfile}
                  fullWidth
                  size="large"
                >
                  Vezi Profilul
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  onClick={handleLogin}
                  fullWidth
                  size="large"
                >
                  Autentificare
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => navigate('/register')}
                  fullWidth
                  size="large"
                >
                  Înregistrare
                </Button>
              </>
            )}
          </Box>

          {success && (
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 3 }}>
              Înregistrarea a fost procesată cu succes!
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EventCheckInRedirect;
