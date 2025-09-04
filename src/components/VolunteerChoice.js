import React from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function VolunteerChoice() {
  const navigate = useNavigate();

  const handleVolunteerChoice = (isVolunteer) => {
    if (isVolunteer) {
      navigate('/volunteer-registration');
    } else {
      // Create account as Vizitator without indicator
      navigate('/register-visitor');
    }
  };

  return (
    <Box maxWidth={600} mx="auto" mt={4} p={3}>
      <Typography variant="h4" align="center" gutterBottom color="primary">
        Bun venit la Crucea Roșie Română!
      </Typography>
      
      <Typography variant="h6" align="center" gutterBottom sx={{ mb: 4 }}>
        Alege tipul de cont pe care dorești să îl creezi:
      </Typography>

      <Box display="flex" flexDirection="column" gap={3}>
        <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }} 
              onClick={() => handleVolunteerChoice(true)}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" color="primary" gutterBottom>
              Vreau să devin voluntar!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Completează formularul de înscriere pentru a deveni voluntar activ
              și a participa la activitățile Crucii Roșii Române.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              sx={{ mt: 2 }}
              onClick={() => handleVolunteerChoice(true)}
            >
              Înscriere Voluntar
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }} 
              onClick={() => handleVolunteerChoice(false)}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" color="secondary" gutterBottom>
              Nu vreau să devin voluntar
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Creează un cont simplu pentru a accesa informații și a vizualiza
              evenimentele publice ale Crucii Roșii Române.
            </Typography>
            <Button 
              variant="outlined" 
              color="secondary" 
              size="large" 
              sx={{ mt: 2 }}
              onClick={() => handleVolunteerChoice(false)}
            >
              Cont Vizitator
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
