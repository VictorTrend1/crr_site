import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert, Card, CardContent } from '@mui/material';
import { createEvent } from '../api';

import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import roLocale from 'date-fns/locale/ro';

export default function EventCreateForm({ onCreated }) {

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [locationLat, setLocationLat] = useState('');
  const [locationLng, setLocationLng] = useState('');
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
        location: {
          name: locationName,
          address: locationAddress,
          coordinates: {
            lat: parseFloat(locationLat) || 0,
            lng: parseFloat(locationLng) || 0
          }
        }
      };
      await createEvent(eventData);
      setSuccess('Eveniment creat cu succes!');
      setTitle(''); setDescription(''); setDate(null); setEndDate(null);
      setLocationName(''); setLocationAddress(''); setLocationLat(''); setLocationLng('');
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.response?.data?.msg || 'Eroare la crearea evenimentului');
    }
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
            <TextField 
              label="Numele locației" 
              fullWidth 
              margin="normal" 
              value={locationName} 
              onChange={e => setLocationName(e.target.value)} 
              placeholder="ex: Sala de conferințe, Parcul Central"
            />
            <TextField 
              label="Adresa" 
              fullWidth 
              margin="normal" 
              value={locationAddress} 
              onChange={e => setLocationAddress(e.target.value)} 
              placeholder="ex: Strada Principală nr. 123, București"
            />
            <Box display="flex" gap={2} mt={2}>
              <TextField 
                label="Latitudine" 
                type="number"
                value={locationLat} 
                onChange={e => setLocationLat(e.target.value)} 
                placeholder="44.4268"
                sx={{ flex: 1 }}
              />
              <TextField 
                label="Longitudine" 
                type="number"
                value={locationLng} 
                onChange={e => setLocationLng(e.target.value)} 
                placeholder="26.1025"
                sx={{ flex: 1 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              💡 Folosește Google Maps pentru a găsi coordonatele exacte ale locației
            </Typography>
          </CardContent>
        </Card>

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Creează Eveniment
        </Button>
      </form>
    </Box>
  );
} 