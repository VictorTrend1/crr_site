import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { registerForEvent, getEventByCode } from '../api';
import { useAuth } from '../AuthContext';

export default function EventRegisterForm({ onRegistered }) {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const res = await registerForEvent(code);
      setSuccess('Te-ai înscris cu succes la eveniment!');
      setCode('');
      // Unhide the event and add to visibleEvents
      if (user && res.data.event && res.data.event._id) {
        const eventId = res.data.event._id.toString();
        const hiddenKey = `hiddenEvents_${user.id}`;
        const visibleKey = `visibleEvents_${user.id}`;
        // Remove from hidden
        const hidden = JSON.parse(localStorage.getItem(hiddenKey) || '[]');
        const newHidden = hidden.filter(id => id.toString() !== eventId);
        localStorage.setItem(hiddenKey, JSON.stringify(newHidden));
        // Add to visible
        const visible = JSON.parse(localStorage.getItem(visibleKey) || '[]');
        if (!visible.includes(eventId)) {
          const newVisible = [...visible, eventId];
          localStorage.setItem(visibleKey, JSON.stringify(newVisible));
        }
      }
      if (onRegistered) onRegistered();
    } catch (err) {
      setError(err.response?.data?.msg || 'Eroare la înscriere');
      // If already registered, unhide the event
      if (err.response?.data?.msg === 'Already registered' && user && code) {
        try {
          const res = await getEventByCode(code);
          if (res.data && res.data._id) {
            const eventId = res.data._id.toString();
            const hiddenKey = `hiddenEvents_${user.id}`;
            const visibleKey = `visibleEvents_${user.id}`;
            // Remove from hidden
            const hidden = JSON.parse(localStorage.getItem(hiddenKey) || '[]');
            const newHidden = hidden.filter(id => id.toString() !== eventId);
            localStorage.setItem(hiddenKey, JSON.stringify(newHidden));
            // Add to visible
            const visible = JSON.parse(localStorage.getItem(visibleKey) || '[]');
            if (!visible.includes(eventId)) {
              const newVisible = [...visible, eventId];
              localStorage.setItem(visibleKey, JSON.stringify(newVisible));
            }
            if (onRegistered) onRegistered();
          }
        } catch {}
      }
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={4}>
      <Typography variant="h6" mb={2}>Înscrie-te la un eveniment cu cod</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField label="Cod eveniment" fullWidth margin="normal" value={code} onChange={e => setCode(e.target.value)} required />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Înscriere</Button>
      </form>
    </Box>
  );
} 