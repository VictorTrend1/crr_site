import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { register } from '../api';

export default function VisitorRegistration() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const res = await register({ 
        name, 
        password, 
        role: 'Vizitator',
        isVisitor: true 
      });
      setSuccess(`Cont creat cu succes! Bine ai venit, ${res.data.user.name}!`);
      // Clear form
      setName('');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Înregistrare eșuată');
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={4}>
      <Typography variant="h5" mb={2} align="center">
        Înregistrare Vizitator
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField 
          label="Nume complet" 
          fullWidth 
          margin="normal" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          required 
        />
        <TextField 
          label="Parolă" 
          type="password" 
          fullWidth 
          margin="normal" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth 
          sx={{ mt: 2 }}
        >
          Creează Cont Vizitator
        </Button>
      </form>
      <Box mt={2}>
        <Typography variant="body2" color="text.secondary" align="center">
          Contul de vizitator îți permite să accesezi informații publice și să vizualizezi evenimentele.
        </Typography>
      </Box>
    </Box>
  );
}
