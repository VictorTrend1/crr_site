import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { getEventByCode, editEventByCode } from '../api';

import { useParams, useNavigate } from 'react-router-dom';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import roLocale from 'date-fns/locale/ro';

export default function EventEditForm() {
  const { code } = useParams();

  const [event, setEvent] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(null);

  const [actionReportLink, setActionReportLink] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await getEventByCode(code);
        setEvent(res.data);
        setTitle(res.data.title);
        setDescription(res.data.description);
        setDate(res.data.date ? new Date(res.data.date) : null);
        setActionReportLink(res.data.actionReport || '');
      } catch {
        setError('Nu s-a putut încărca evenimentul');
      }
    }
    fetchEvent();
  }, [code]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await editEventByCode(code, { title, description, date: date ? date.toISOString() : '', actionReport: actionReportLink });
      setSuccess('Eveniment actualizat!');
      setTimeout(() => navigate(`/events/${event._id}`), 1000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Eroare la actualizare');
    }
  };

  if (!event) return <Typography>Se încarcă...</Typography>;

  return (
    <Box maxWidth={500} mx="auto" mt={4}>
      <Typography variant="h6" mb={2}>Editează evenimentul</Typography>
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
        <Box mt={2} mb={2}>
          <Typography variant="body2">Link Fișa de intervenție:</Typography>
          <TextField fullWidth placeholder="https://..." value={actionReportLink} onChange={e => setActionReportLink(e.target.value)} />
        </Box>
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Salvează</Button>
      </form>
    </Box>
  );
} 