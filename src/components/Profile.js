import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, Alert, CircularProgress, Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getUserProfile, updateMyDetasament, addCertificate, removeCertificate, downloadIndicativ, downloadIdCard, uploadPhoto, updatePersonalInfo, setup2FA, enable2FA, disable2FA, getUserEvents, downloadMyActivity, addExperience, removeExperience, downloadMyVolunteerContract } from '../api';
import QRCode from 'qrcode';
import ScutireForm from './ScutireForm';

export default function Profile() {
  const { indicator } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [editingDetasament, setEditingDetasament] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(false);
  const [certificateType, setCertificateType] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [domiciliu, setDomiciliu] = useState('');
  const [resedinta, setResedinta] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [userEvents, setUserEvents] = useState([]);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [editingExperience, setEditingExperience] = useState(false);
  const [experienceType, setExperienceType] = useState('');
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showScutireForm, setShowScutireForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError('');
        
        // If no indicator in URL, use current user's indicator
        const targetIndicator = indicator || currentUser?.indicator;
        
        if (!targetIndicator) {
          setError('Indicativul nu a fost găsit');
          setLoading(false);
          return;
        }

        // Fetch user profile from backend
        const response = await getUserProfile(targetIndicator);
        const userData = response.data;
        setProfileUser(userData);
        setDomiciliu(userData.domiciliu || '');
        setResedinta(userData.resedinta || '');
        
        // Fetch user events
        try {
          const eventsResponse = await getUserEvents(targetIndicator);
          setUserEvents(eventsResponse.data || []);
        } catch (err) {
          console.error('Error fetching user events:', err);
          setUserEvents([]);
        }
        
        // Generate QR code (pointing to public profile for sharing)
        const profileUrl = `${window.location.origin}/public/profile/${targetIndicator}`;
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
        console.error('Error loading profile:', err);
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

    if (currentUser) {
      loadProfile();
    }
  }, [indicator, currentUser]);

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `profile-${profileUser?.indicator}-qr.png`;
      link.href = qrCodeUrl;
      link.click();
    }
  };

  const handleUpdateDetasament = async (newDetasament) => {
    try {
      await updateMyDetasament(newDetasament);
      setProfileUser(prev => ({ ...prev, detasament: newDetasament }));
      setEditingDetasament(false);
    } catch (err) {
      setError('Eroare la actualizarea detasamentului');
    }
  };

  const handleAddCertificate = async () => {
    try {
      if (!certificateType || !certificateNumber) {
        setError('Completați toate câmpurile');
        return;
      }
      await addCertificate(certificateType, certificateNumber);
      setProfileUser(prev => ({ 
        ...prev, 
        certificates: [...(prev.certificates || []), {
          type: certificateType,
          number: certificateNumber,
          addedAt: new Date()
        }],
        hasFirstAidCertificate: true 
      }));
      setEditingCertificate(false);
      setCertificateType('');
      setCertificateNumber('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Eroare la salvarea certificatului');
    }
  };

  const handleRemoveCertificate = async (type) => {
    try {
      await removeCertificate(type);
      setProfileUser(prev => ({ 
        ...prev, 
        certificates: (prev.certificates || []).filter(cert => cert.type !== type),
        hasFirstAidCertificate: (prev.certificates || []).filter(cert => cert.type !== type).length > 0
      }));
    } catch (err) {
      setError(err.response?.data?.msg || 'Eroare la ștergerea certificatului');
    }
  };

  const getDetasamentColor = (detasament) => {
    const colors = {
      'Voluntar': '#666666', // Basic gray
      'Acordare PA': '#f44336', // Red
      'Acordare PAP': '#ffeb3b', // Yellow
      'Detasament': '#000000', // Black
      'Comunicare': '#e91e63', // Pink
      'Logistic': '#4caf50', // Green
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

  const handleDownloadIndicativ = async () => {
    try {
      const response = await downloadIndicativ();
      
      // Create blob from response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `indicativ_${profileUser?.indicator || 'user'}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading indicative:', err);
      setError('Eroare la descărcarea indicativului');
    }
  };

  const handleDownloadIdCard = async () => {
    try {
      // Check if user has a photo, if not show upload modal
      if (!profileUser.photo) {
        setShowPhotoUpload(true);
        return;
      }
      
      const response = await downloadIdCard();
      
      // Create blob from response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ecuson_${profileUser?.indicator || 'user'}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading ID card:', err);
      setError('Eroare la descărcarea ecusonului');
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhoto) {
      setError('Selectati o fotografie');
      return;
    }

    try {
      setUploadingPhoto(true);
      const response = await uploadPhoto(selectedPhoto);
      
      // Update profile user with new photo
      setProfileUser(prev => ({ ...prev, photo: response.data.photo }));
      setSelectedPhoto(null);
      setShowPhotoUpload(false);
      
      // Show success message
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError(err.response?.data?.msg || 'Eroare la incarcarea fotografiei');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedPhoto(file);
    }
  };

  const handleUpdatePersonalInfo = async () => {
    try {
      await updatePersonalInfo(domiciliu, resedinta);
      setProfileUser(prev => ({ ...prev, domiciliu, resedinta }));
      setEditingPersonalInfo(false);
    } catch (err) {
      setError('Eroare la actualizarea informațiilor personale');
    }
  };

  const handleSetup2FA = async () => {
    try {
      const res = await setup2FA();
      if (res?.data?.qrDataUrl) {
        setQrDataUrl(res.data.qrDataUrl);
      }
    } catch (err) {
      console.error('Error setting up 2FA:', err);
      setError('Eroare la configurarea 2FA');
    }
  };

  const handleEnable2FA = async () => {
    try {
      const res = await enable2FA(twoFactorCode);
      if (res?.data?.user) {
        setProfileUser(prev => ({ ...prev, twoFactorEnabled: true }));
        setTwoFactorCode('');
        setQrDataUrl('');
      }
    } catch (err) {
      console.error('Error enabling 2FA:', err);
      setError('Eroare la activarea 2FA');
    }
  };

  const handleDisable2FA = async () => {
    try {
      const res = await disable2FA();
      if (res?.data?.user) {
        setProfileUser(prev => ({ ...prev, twoFactorEnabled: false }));
      }
    } catch (err) {
      setError('Eroare la dezactivarea 2FA');
    }
  };

  const handleDownloadActivity = async () => {
    try {
      const response = await downloadMyActivity(fromDate, toDate);
      
      // Create blob from response (PDF data)
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `activitatea_${profileUser?.indicator || 'user'}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading activity:', err);
      setError('Eroare la descărcarea activității');
    }
  };

  const handleDownloadContract = async () => {
    try {
      const response = await downloadMyVolunteerContract();
      
      // Create blob from response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contract-voluntar-${profileUser?.indicator || 'user'}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading contract:', err);
      setError('Eroare la descărcarea contractului');
    }
  };

  const handleAddExperience = async () => {
    try {
      if (!experienceType) {
        setError('Selectați tipul de experiență');
        return;
      }
      await addExperience(experienceType);
      setProfileUser(prev => ({ 
        ...prev, 
        experiences: [...(prev.experiences || []), {
          type: experienceType,
          addedAt: new Date()
        }]
      }));
      setEditingExperience(false);
      setExperienceType('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Eroare la salvarea experienței');
    }
  };

  const handleRemoveExperience = async (type) => {
    try {
      await removeExperience(type);
      setProfileUser(prev => ({ 
        ...prev, 
        experiences: (prev.experiences || []).filter(exp => exp.type !== type)
      }));
    } catch (err) {
      setError(err.response?.data?.msg || 'Eroare la ștergerea experienței');
    }
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
        <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Înapoi la Dashboard
        </Button>
      </Box>
    );
  }

  if (!profileUser) {
    return (
      <Box maxWidth={600} mx="auto" mt={4}>
        <Alert severity="warning">Profilul nu a fost găsit</Alert>
        <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Înapoi la Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box maxWidth={800} mx="auto" mt={4}>
      <Typography variant="h4" mb={3}>
        Profil Utilizator
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
              {editingDetasament ? (
                <FormControl fullWidth size="small">
                  <Select
                    value={profileUser.detasament}
                    onChange={(e) => handleUpdateDetasament(e.target.value)}
                    onClose={() => setEditingDetasament(false)}
                  >
                    <MenuItem value="Voluntar">Voluntar</MenuItem>
                    <MenuItem value="Comunicare">Comunicare</MenuItem>
                    <MenuItem value="Logistic">Logistic</MenuItem>
                    <MenuItem value="Detasament">Detasament</MenuItem>
                    <MenuItem value="Acordare PA">Acordare PA</MenuItem>
                    <MenuItem value="Acordare PAP">Acordare PAP</MenuItem>
                    <MenuItem value="Management">Management</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: getDetasamentColor(profileUser.detasament),
                      fontWeight: 'bold'
                    }}
                  >
                    {profileUser.detasament}
                  </Typography>
                  {currentUser && currentUser.indicator === profileUser.indicator && (
                    <Button 
                      size="small" 
                      onClick={() => setEditingDetasament(true)}
                    >
                      Editează
                    </Button>
                  )}
                </Box>
              )}
            </Box>
            
            {/* Personal Information Section */}
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Informații Personale
              </Typography>
              {editingPersonalInfo ? (
                <Box>
                  <TextField
                    label="Domiciliu (din buletin)"
                    value={domiciliu}
                    onChange={(e) => setDomiciliu(e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    label="Reședința (unde locuiești)"
                    value={resedinta}
                    onChange={(e) => setResedinta(e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Box display="flex" gap={1}>
                    <Button 
                      size="small" 
                      variant="contained"
                      onClick={handleUpdatePersonalInfo}
                    >
                      Salvează
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => setEditingPersonalInfo(false)}
                    >
                      Anulează
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" mb={1}>
                    <strong>Domiciliu (din buletin):</strong> {profileUser.domiciliu || 'Nu este specificat'}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Reședința (unde locuiești):</strong> {profileUser.resedinta || 'Nu este specificat'}
                  </Typography>
                  {currentUser && currentUser.indicator === profileUser.indicator && (
                    <Button 
                      size="small" 
                      onClick={() => setEditingPersonalInfo(true)}
                    >
                      Editează
                    </Button>
                  )}
                </Box>
              )}
            </Box>
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Certificate
              </Typography>
              {profileUser.hasFirstAidCertificate && profileUser.certificates && profileUser.certificates.length > 0 ? (
                <Box>
                  {profileUser.certificates.map((cert, index) => (
                    <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="h6">
                        {getCertificateEmoji(cert.type)}
                      </Typography>
                      <Typography variant="body2">
                        {cert.type} - {cert.number}
                      </Typography>
                      {currentUser && currentUser.indicator === profileUser.indicator && (
                        <Button 
                          size="small" 
                          color="error"
                          onClick={() => handleRemoveCertificate(cert.type)}
                        >
                          Șterge
                        </Button>
                      )}
                    </Box>
                  ))}
                  {currentUser && currentUser.indicator === profileUser.indicator && profileUser.certificates.length < 3 && (
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => setEditingCertificate(true)}
                      sx={{ mt: 1 }}
                    >
                      Adaugă Certificat
                    </Button>
                  )}
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Nu aveți certificate
                  </Typography>
                  {currentUser && currentUser.indicator === profileUser.indicator && (
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => setEditingCertificate(true)}
                    >
                      Adaugă Certificat
                    </Button>
                  )}
                </Box>
              )}
            </Box>
            
            {/* Certificate Editing Form */}
            {editingCertificate && (
              <Box mt={3}>
                <Typography variant="h6" mb={2}>
                  Adaugă Certificat Prim Ajutor
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Tip Certificat</InputLabel>
                    <Select
                      value={certificateType}
                      onChange={(e) => setCertificateType(e.target.value)}
                      label="Tip Certificat"
                    >
                      <MenuItem value="PA">Certificat PA ⛑️</MenuItem>
                      <MenuItem value="PAP">Certificat PAP 🫂</MenuItem>
                      <MenuItem value="Detasament">Certificat Detasament ⚫</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Număr Certificat"
                    value={certificateNumber}
                    onChange={(e) => setCertificateNumber(e.target.value)}
                    sx={{ minWidth: 200 }}
                  />
                  <Box display="flex" gap={1} alignItems="center">
                    <Button 
                      variant="contained" 
                      onClick={handleAddCertificate}
                      disabled={!certificateType || !certificateNumber}
                    >
                      Salvează
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => {
                        setEditingCertificate(false);
                        setCertificateType('');
                        setCertificateNumber('');
                      }}
                    >
                      Anulează
                    </Button>
                  </Box>
                </Box>
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
                
                <Box display="flex" gap={1} flexDirection="column">
                  <Button 
                    variant="outlined" 
                    onClick={handleDownloadQR}
                    fullWidth
                  >
                    Descarcă Cod QR
                  </Button>
                  {currentUser && currentUser.indicator === profileUser.indicator && (
                    <>
                      <Button 
                        variant="contained" 
                        onClick={handleDownloadIndicativ}
                        fullWidth
                      >
                        Descarcă Indicativ
                      </Button>
                      <Button 
                        variant="contained" 
                        color="error"
                        onClick={handleDownloadIdCard}
                        fullWidth
                      >
                        Descarcă Ecuson
                      </Button>
                      {profileUser.volunteerPdf && (
                        <>
                          <Button
                            variant="contained" 
                            color="success"
                            onClick={handleDownloadContract}
                            fullWidth
                            sx={{ mb: 1 }}
                          >
                            Descarcă Contract
                          </Button>
                          <Button
                            variant="contained" 
                            color="primary"
                            onClick={() => setShowScutireForm(true)}
                            fullWidth
                          >
                            Generează Scutire
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Experience Card */}
        <Card sx={{ flex: 1, minWidth: 300 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>
              Experiență
            </Typography>
            
            {profileUser.experiences && profileUser.experiences.length > 0 ? (
              <Box>
                {profileUser.experiences.map((exp, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: exp.type === 'Permis de conducere' ? '#2196f3' : 
                                       exp.type === 'Apt sa acorzi PA' ? '#f44336' : '#e91e63',
                        borderRadius: 1
                      }}
                    />
                    <Typography variant="body2">
                      {exp.type}
                    </Typography>
                    {currentUser && currentUser.indicator === profileUser.indicator && (
                      <Button 
                        size="small" 
                        color="error"
                        onClick={() => handleRemoveExperience(exp.type)}
                        sx={{ ml: 'auto' }}
                      >
                        Șterge
                      </Button>
                    )}
                  </Box>
                ))}
                {currentUser && currentUser.indicator === profileUser.indicator && (
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => setEditingExperience(true)}
                    sx={{ mt: 1 }}
                  >
                    Adaugă Experiență
                  </Button>
                )}
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Nu există experiență înregistrată
                </Typography>
                {currentUser && currentUser.indicator === profileUser.indicator && (
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => setEditingExperience(true)}
                  >
                    Adaugă Experiență
                  </Button>
                )}
              </Box>
            )}
            
            {/* Experience Editing Form */}
            {editingExperience && (
              <Box mt={3}>
                <Typography variant="h6" mb={2}>
                  Adaugă Experiență
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Tip Experiență</InputLabel>
                    <Select
                      value={experienceType}
                      onChange={(e) => setExperienceType(e.target.value)}
                      label="Tip Experiență"
                    >
                      <MenuItem value="Permis de conducere">Permis de conducere</MenuItem>
                      <MenuItem value="Apt sa acorzi PA">Apt sa acorzi PA</MenuItem>
                      <MenuItem value="Apt sa acorzi PAP">Apt sa acorzi PAP</MenuItem>
                    </Select>
                  </FormControl>
                  <Box display="flex" gap={1}>
                    <Button 
                      variant="contained" 
                      onClick={handleAddExperience}
                      disabled={!experienceType}
                    >
                      Salvează
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => {
                        setEditingExperience(false);
                        setExperienceType('');
                      }}
                    >
                      Anulează
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>



        {/* 2FA Card */}
        <Card sx={{ flex: 1, minWidth: 300 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>
              Securitate (2FA)
            </Typography>
            {profileUser.twoFactorEnabled ? (
              <Box>
                <Typography variant="body1" color="success.main" mb={1}>
                  ✓ Autentificare în doi pași activată
                </Typography>
                {currentUser && currentUser.indicator === profileUser.indicator && (
                  <Button 
                    size="small" 
                    color="error"
                    variant="outlined"
                    onClick={handleDisable2FA}
                  >
                    Dezactivează 2FA
                  </Button>
                )}
              </Box>
            ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Autentificare în doi pași dezactivată
                  </Typography>
                  {currentUser && currentUser.indicator === profileUser.indicator && (
                    <Box>
                      {!qrDataUrl ? (
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={handleSetup2FA}
                          sx={{ mb: 1 }}
                        >
                          Configurează 2FA
                        </Button>
                      ) : (
                        <Box>
                          <Typography variant="body2" mb={2}>
                            Scanează acest QR în aplicația ta 2FA, apoi introdu codul generat:
                          </Typography>
                          <Box mb={2} display="flex" justifyContent="center">
                            <img src={qrDataUrl} alt="2FA QR" style={{ maxWidth: '200px' }} />
                          </Box>
                          <Box display="flex" gap={1} alignItems="center" mb={1}>
                            <TextField
                              label="Cod 2FA"
                              value={twoFactorCode}
                              onChange={(e) => setTwoFactorCode(e.target.value)}
                              size="small"
                              fullWidth
                            />
                            <Button 
                              size="small" 
                              variant="contained"
                              onClick={handleEnable2FA}
                              disabled={!twoFactorCode}
                            >
                              Activează
                            </Button>
                          </Box>
                          <Button 
                            size="small" 
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                              setQrDataUrl('');
                              setTwoFactorCode('');
                            }}
                          >
                            Anulează
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              )}
          </CardContent>
        </Card>
      </Box>

      {/* Full Width Events Section */}
      <Box mt={4}>
        <Typography variant="h5" mb={3}>
          Evenimente
        </Typography>
        
        {userEvents.length > 0 ? (
          <Box>
            {userEvents.map((event, index) => (
              <Box key={index} mb={3} p={3} sx={{ border: '1px solid #ddd', borderRadius: 2, backgroundColor: '#fafafa' }}>
                {/* Event Title */}
                <Typography variant="h6" fontWeight="bold" color="primary" mb={1}>
                  {event.name}
                </Typography>
                
                {/* Event Description */}
                {event.details && (
                  <Typography variant="body1" mb={2} sx={{ lineHeight: 1.6 }}>
                    {event.details}
                  </Typography>
                )}
                
                {/* Event Details */}
                <Box display="flex" flexWrap="wrap" gap={2} mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Data eveniment:</strong> {new Date(event.date).toLocaleDateString('ro-RO')}
                  </Typography>
                </Box>
                
                {/* Registration Info */}
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Înregistrat la: {new Date(event.registeredAt).toLocaleDateString('ro-RO')}
                </Typography>
              </Box>
            ))}
            
            {/* Activity Download Section */}
            {currentUser && currentUser.indicator === profileUser.indicator && (
              <Box mt={4} p={3} sx={{ border: '1px solid #ddd', borderRadius: 2, backgroundColor: '#f9f9f9' }}>
                <Typography variant="h6" mb={2}>
                  Descarcă Activitatea (PDF)
                </Typography>
                <Box display="flex" gap={2} mb={2} flexWrap="wrap" alignItems="center">
                  <TextField
                    label="De la data"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 150 }}
                  />
                  <TextField
                    label="Până la data"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 150 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleDownloadActivity}
                    disabled={!fromDate || !toDate}
                    sx={{ minWidth: 200 }}
                  >
                    Descarcă Activitatea (PDF)
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Nu există evenimente înregistrate
            </Typography>
            
            {/* Activity Download Section - even when no events */}
            {currentUser && currentUser.indicator === profileUser.indicator && (
              <Box p={3} sx={{ border: '1px solid #ddd', borderRadius: 2, backgroundColor: '#f9f9f9' }}>
                <Typography variant="h6" mb={2}>
                  Descarcă Activitatea (PDF)
                </Typography>
                <Box display="flex" gap={2} mb={2} flexWrap="wrap" alignItems="center">
                  <TextField
                    label="De la data"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 150 }}
                  />
                  <TextField
                    label="Până la data"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 150 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleDownloadActivity}
                    disabled={!fromDate || !toDate}
                    sx={{ minWidth: 200 }}
                  >
                    Descarcă Activitatea (PDF)
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
      
      <Box mt={3}>
        <Button 
          variant="contained" 
          onClick={() => navigate('/dashboard')}
        >
          Înapoi la Dashboard
        </Button>
      </Box>

      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowPhotoUpload(false)}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              padding: 3,
              borderRadius: 2,
              maxWidth: 400,
              width: '90%',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography variant="h6" mb={2}>
              Incarca Fotografia pentru Ecuson
            </Typography>
            
            <Typography variant="body2" color="text.secondary" mb={3}>
              Selectati o fotografie pentru a genera ecusonul personalizat
            </Typography>
            
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="photo-upload"
              type="file"
              onChange={handlePhotoSelect}
            />
            <label htmlFor="photo-upload">
              <Button
                variant="outlined"
                component="span"
                sx={{ mb: 2 }}
                fullWidth
              >
                Selecteaza Fotografia
              </Button>
            </label>
            
            {selectedPhoto && (
              <Box mb={2}>
                <Typography variant="body2" color="primary">
                  Fotografie selectata: {selectedPhoto.name}
                </Typography>
              </Box>
            )}
            
            <Box display="flex" gap={2} justifyContent="center">
              <Button
                variant="contained"
                onClick={handlePhotoUpload}
                disabled={!selectedPhoto || uploadingPhoto}
                color="primary"
              >
                {uploadingPhoto ? 'Se incarca...' : 'Incarca'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowPhotoUpload(false);
                  setSelectedPhoto(null);
                }}
              >
                Anuleaza
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Success Message */}
      {successMessage && (
        <Alert 
          severity="success" 
          onClose={() => setSuccessMessage('')}
          sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}
        >
          {successMessage}
        </Alert>
      )}

      {/* Scutire Form Dialog */}
      <ScutireForm
        open={showScutireForm}
        onClose={() => setShowScutireForm(false)}
        onSuccess={setSuccessMessage}
      />
    </Box>
  );
}
