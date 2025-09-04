import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { createEvent } from '../api';

import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import roLocale from 'date-fns/locale/ro';

export default function EventCreateForm({ onCreated }) {

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await createEvent({ title, description, date: date ? date.toISOString() : '' });
      setSuccess('Eveniment creat cu succes!');
      setTitle(''); setDescription(''); setDate(null);
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.response?.data?.msg || 'Eroare la crearea evenimentului');
    }
  };

  return (
    <Box maxWidth={500} mx="auto" mt={4}>
      <Typography variant="h6" mb={2}>Creează un eveniment nou</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField label="Titlu" fullWidth margin="normal" value={title} onChange={e => setTitle(e.target.value)} required />
        <TextField label="Descriere" fullWidth margin="normal" value={description} onChange={e => setDescription(e.target.value)} />
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={roLocale}>
          <DateTimePicker
            label="Dată și oră"
            value={date}
            onChange={setDate}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
          />
        </LocalizationProvider>
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Creează</Button>
      </form>
    </Box>
  );
} 