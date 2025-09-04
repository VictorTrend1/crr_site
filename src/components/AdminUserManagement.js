import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, Typography, Box, CircularProgress, Alert, Card, CardContent, Grid, Button, IconButton } from '@mui/material';
import { Download } from '@mui/icons-material';
import { getUsers, updateUserRole, downloadVolunteerPdf } from '../api';
import { useAuth } from '../AuthContext';
import AlarmIcon from './AlarmIcon';

const roles = ['Vizitator', 'Voluntar', 'Organizator', 'Admin'];

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

export default function AdminUserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDownloadVolunteerPdf = async (userId) => {
    try {
      const response = await downloadVolunteerPdf(userId);
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `volunteer-${userId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Eroare la descărcarea PDF-ului');
    }
  };

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await getUsers();
        setUsers(res.data);
      } catch (err) {
        setError('Nu s-au putut încărca utilizatorii');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [user, success]);

  const handleRoleChange = async (userId, newRole) => {
    setError(''); setSuccess('');
    try {
      await updateUserRole(userId, newRole);
      setSuccess('Rol actualizat!');
    } catch {
      setError('Eroare la actualizarea rolului');
    }
  };

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box mt={4}>
      <Typography variant="h5" mb={2}>Gestionare utilizatori</Typography>
      {success && <Alert severity="success">{success}</Alert>}
      
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
                  <Typography variant="body2">Logistic</Typography>
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
              <TableCell>Rol</TableCell>
              <TableCell>Detasament</TableCell>
              <TableCell>Certificate</TableCell>
              <TableCell>Experiențe</TableCell>
              <TableCell>Acțiuni</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {user.role === 'Voluntar' && user.inactive && <AlarmIcon active={true} message="Voluntar inactiv de peste 3 luni!" />}
                    {user.indicator}
                  </Box>
                </TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onChange={e => handleRoleChange(user.id, e.target.value)}
                    disabled={user.role === 'Admin' && user.name === 'VictorTrend'}
                  >
                    {roles.map(role => (
                      <MenuItem key={role} value={role}>{role}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: getDetasamentColor(user.detasament),
                      fontWeight: 'bold'
                    }}
                  >
                    {user.detasament}
                  </Typography>
                </TableCell>
                <TableCell>
                  {user.hasFirstAidCertificate && user.certificates && user.certificates.length > 0 ? (
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {user.certificates.map((cert, index) => (
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
                  {user.experiences && user.experiences.length > 0 ? (
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {user.experiences.map((exp, index) => (
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
                <TableCell>
                  {user.volunteerPdf && (
                    <IconButton
                      onClick={() => handleDownloadVolunteerPdf(user.id)}
                      color="primary"
                      size="small"
                      title="Descarcă PDF voluntar"
                    >
                      <Download />
                    </IconButton>
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