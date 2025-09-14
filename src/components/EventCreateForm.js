import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { createEvent } from '../api';
import GoogleMapLocationPicker from './GoogleMapLocationPicker';

import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import roLocale from 'date-fns/locale/ro';

export default function EventCreateForm({ onCreated }) {

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [location, setLocation] = useState(null);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const eventData = {
        title,
        description,
        date: date ? date.toISOString() : '',
        endDate: endDate ? endDate.toISOString() : '',
        location: location
      };
      await createEvent(eventData);
      setSuccess('Eveniment creat cu succes!');
      setTitle(''); setDescription(''); setDate(null); setEndDate(null);
      setLocation(null);
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.response?.data?.msg || 'Eroare la crearea evenimentului');
    }
  };

  const handleLocationSelect = (selectedLocation) => {
    if (selectedLocation) {
      setLocation(selectedLocation);
    }
    setShowMapDialog(false);
  };

  return (
    <Box maxWidth={600} mx="auto" mt={4}>
      <Typography variant="h6" mb={2}>Creează un eveniment nou</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField 
          label="Titlu" 
          fullWidth 
          margin="normal" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required 
        />
        <TextField 
          label="Descriere" 
          fullWidth 
          margin="normal" 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          multiline
          rows={3}
        />
        
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={roLocale}>
          <DateTimePicker
            label="Data și ora de început"
            value={date}
            onChange={setDate}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
          />
          <DateTimePicker
            label="Data și ora de sfârșit"
            value={endDate}
            onChange={setEndDate}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          />
        </LocalizationProvider>

        <Card sx={{ mt: 2, mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>📍 Locația evenimentului</Typography>
            
            {location ? (
              <Box>
                <TextField 
                  label="Numele locației" 
                  fullWidth 
                  margin="normal" 
                  value={location.name} 
                  disabled
                />
                <TextField 
                  label="Adresa completă" 
                  fullWidth 
                  margin="normal" 
                  value={location.address} 
                  disabled
                />
                <Box display="flex" gap={2} mt={2}>
                  <TextField 
                    label="Latitudine" 
                    type="number"
                    value={location.lat} 
                    disabled
                    sx={{ flex: 1 }}
                  />
                  <TextField 
                    label="Longitudine" 
                    type="number"
                    value={location.lng} 
                    disabled
                    sx={{ flex: 1 }}
                  />
                </Box>
                <Button 
                  variant="outlined" 
                  onClick={() => setShowMapDialog(true)}
                  sx={{ mt: 2 }}
                >
                  Schimbă Locația
                </Button>
              </Box>
            ) : (
              <Box textAlign="center" py={2}>
                <Button 
                  variant="contained" 
                  onClick={() => setShowMapDialog(true)}
                  size="large"
                >
                  Selectează Locația pe Hartă
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Faceți clic pentru a selecta locația evenimentului pe hartă
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Creează Eveniment
        </Button>
      </form>

      {/* Google Maps Location Picker Dialog */}
      <GoogleMapLocationPicker
        open={showMapDialog}
        onClose={() => setShowMapDialog(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={location}
      />
    </Box>
  );
} 