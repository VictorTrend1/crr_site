import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, CircularProgress, Alert, Card, CardContent, Grid } from '@mui/material';
import { getVolunteers } from '../api';
import { useAuth } from '../AuthContext';

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

export default function OrganizerVolunteers() {
  const { user } = useAuth();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchVolunteers() {
      try {
        const res = await getVolunteers();
        setVolunteers(res.data);
      } catch (err) {
        setError('Nu s-au putut încărca voluntarii');
      } finally {
        setLoading(false);
      }
    }
    fetchVolunteers();
  }, [user]);

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box mt={4}>
      <Typography variant="h5" mb={2}>Voluntari</Typography>
      
      {/* Legend */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>Legendă</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" mb={1} color="primary">Detasamente:</Typography>
              <Box display="flex" flexWrap="wrap" gap={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box width={16} height={16} bgcolor="#666666" borderRadius="50%" />
                  <Typography variant="body2">Voluntar</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box width={16} height={16} bgcolor="#f44336" borderRadius="50%" />
                  <Typography variant="body2">Acordare PA</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box width={16} height={16} bgcolor="#ffeb3b" borderRadius="50%" />
                  <Typography variant="body2">Acordare PAP</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box width={16} height={16} bgcolor="#000000" borderRadius="50%" />
                  <Typography variant="body2">Detasament</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box width={16} height={16} bgcolor="#e91e63" borderRadius="50%" />
                  <Typography variant="body2">Comunicare</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box width={16} height={16} bgcolor="#4caf50" borderRadius="50%" />
                  <Typography variant="body2">Logistică</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box width={16} height={16} bgcolor="#2196f3" borderRadius="50%" />
                  <Typography variant="body2">Management</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" mb={1} color="primary">Certificate:</Typography>
              <Box display="flex" flexWrap="wrap" gap={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6">⛑️</Typography>
                  <Typography variant="body2">Certificat PA</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6">🫂</Typography>
                  <Typography variant="body2">Certificat PAP</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6">⚫</Typography>
                  <Typography variant="body2">Certificat Detasament</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" mb={1} color="primary">Experiențe:</Typography>
              <Box display="flex" flexWrap="wrap" gap={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box width={12} height={12} bgcolor="#2196f3" borderRadius={1} />
                  <Typography variant="body2">Permis de conducere</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box width={12} height={12} bgcolor="#f44336" borderRadius={1} />
                  <Typography variant="body2">Apt sa acorzi PA</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box width={12} height={12} bgcolor="#e91e63" borderRadius={1} />
                  <Typography variant="body2">Apt sa acorzi PAP</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Indicator</TableCell>
              <TableCell>Detasament</TableCell>
              <TableCell>Activ</TableCell>
              <TableCell>Certificate</TableCell>
              <TableCell>Experiențe</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {volunteers.map(v => (
              <TableRow key={v.id}>
                <TableCell>{v.indicator}</TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: getDetasamentColor(v.detasament),
                      fontWeight: 'bold'
                    }}
                  >
                    {v.detasament}
                  </Typography>
                </TableCell>
                <TableCell>{v.inactive ? 'Nu' : 'Da'}</TableCell>
                <TableCell>
                  {v.hasFirstAidCertificate && v.certificates && v.certificates.length > 0 ? (
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {v.certificates.map((cert, index) => (
                        <Typography 
                          key={index} 
                          variant="h6" 
                          title={`Certificat ${cert.type} - ${cert.number}`}
                        >
                          {getCertificateEmoji(cert.type)}
                        </Typography>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {v.experiences && v.experiences.length > 0 ? (
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {v.experiences.map((exp, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: 12,
                            height: 12,
                            backgroundColor: exp.type === 'Permis de conducere' ? '#2196f3' : 
                                           exp.type === 'Apt sa acorzi PA' ? '#f44336' : '#e91e63',
                            borderRadius: 1
                          }}
                          title={exp.type}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}


