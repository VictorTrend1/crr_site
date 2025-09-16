import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, Alert, CircularProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicUserProfile } from '../api';
import QRCode from 'qrcode';

export default function PublicProfile() {
  const { indicator } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError('');
        
        if (!indicator) {
          setError('Indicativul nu a fost găsit');
          setLoading(false);
          return;
        }

        // Fetch public user profile from backend
        const response = await getPublicUserProfile(indicator);
        const userData = response.data;
        setProfileUser(userData);
        
        // Generate QR code
        const profileUrl = `${window.location.origin}/public/profile/${indicator}`;
        const qrCodeDataUrl = await QRCode.toDataURL(profileUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrCodeDataUrl);
      } catch (err) {
        console.error('Error loading public profile:', err);
        if (err.response?.status === 404) {
          setError('Profilul nu a fost găsit');
        } else if (err.response?.status === 400) {
          setError('Format indicativ invalid');
        } else {
          setError('Eroare la încărcarea profilului');
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [indicator]);

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `profile-${profileUser?.indicator}-qr.png`;
      link.href = qrCodeUrl;
      link.click();
    }
  };

  const getDetasamentColor = (detasament) => {
    const colors = {
      'Voluntar': '#666666', // Basic gray
      'Acordare PA': '#f44336', // Red
      'Acordare PAP': '#ffeb3b', // Yellow
      'Detasament': '#000000', // Black
      'Comunicare': '#e91e63', // Pink
      'Logistică': '#4caf50', // Green
      'Management': '#2196f3' // Blue
    };
    return colors[detasament] || '#666666';
  };

  const getCertificateEmoji = (type) => {
    const emojis = {
      'PA': '⛑️',
      'PAP': '🫂',
      'Detasament': '⚫'
    };
    return emojis[type] || '';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box maxWidth={600} mx="auto" mt={4}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Înapoi la Pagina Principală
        </Button>
      </Box>
    );
  }

  if (!profileUser) {
    return (
      <Box maxWidth={600} mx="auto" mt={4}>
        <Alert severity="warning">Profilul nu a fost găsit</Alert>
        <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Înapoi la Pagina Principală
        </Button>
      </Box>
    );
  }

  return (
    <Box maxWidth={800} mx="auto" mt={4}>
      <Typography variant="h4" mb={3}>
        Profil Public - Crucea Roșie Dâmbovița
      </Typography>
      
      <Box display="flex" gap={3} flexWrap="wrap">
        {/* Profile Information */}
        <Card sx={{ flex: 1, minWidth: 300 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>
              Informații Personale
            </Typography>
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Indicativ
              </Typography>
              <Typography variant="h5" color="primary" fontWeight="bold">
                {profileUser.indicator}
              </Typography>
            </Box>
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Nume Complet
              </Typography>
              <Typography variant="body1">
                {profileUser.name}
              </Typography>
            </Box>
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Detasament
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: getDetasamentColor(profileUser.detasament),
                  fontWeight: 'bold'
                }}
              >
                {profileUser.detasament}
              </Typography>
            </Box>
            
            {profileUser.hasFirstAidCertificate && profileUser.certificates && profileUser.certificates.length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Certificate
                </Typography>
                {profileUser.certificates.map((cert, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="h6">
                      {getCertificateEmoji(cert.type)}
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      {cert.type} - {cert.number}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            
            {profileUser.twoFactorEnabled && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Securitate
                </Typography>
                <Typography variant="body1" color="success.main">
                  ✓ Autentificare în doi pași activată
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card sx={{ flex: 0, minWidth: 300 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>
              Cod QR Profil
            </Typography>
            
            {qrCodeUrl && (
              <Box textAlign="center">
                <Box 
                  component="img" 
                  src={qrCodeUrl} 
                  alt="Profile QR Code"
                  sx={{ 
                    maxWidth: '100%', 
                    height: 'auto',
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    mb: 2
                  }}
                />
                
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Scanează acest cod QR pentru a accesa acest profil
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
      
      <Box mt={3}>
        <Button 
          variant="contained" 
          onClick={() => navigate('/login')}
        >
          Autentificare
        </Button>
      </Box>
    </Box>
  );
}
