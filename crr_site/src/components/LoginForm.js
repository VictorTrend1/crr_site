import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { login as loginApi, verify2FALogin } from '../api';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import { useAuth } from '../AuthContext';

export default function LoginForm() {
  const [indicator, setIndicator] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (!requires2FA) {
        const res = await loginApi({ indicator, password });
        if (res.data.requires2FA) {
          setRequires2FA(true);
          setTempToken(res.data.tempToken);
          return;
        }
        login(res.data.user);
        navigate('/dashboard');
      } else {
        const res = await verify2FALogin({ tempToken, code });
        login(res.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.data?.msg === 'Invalid credentials') {
        setError('Parolă incorectă sau utilizator inexistent');
      } else if (err.response?.data?.msg === 'Invalid 2FA code') {
        setError('Cod 2FA invalid');
      } else {
        setError(err.response?.data?.msg || 'Autentificare eșuată');
      }
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={4}>
      <Typography variant="h5" mb={2}>Autentificare</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <form onSubmit={handleSubmit}>
        {!requires2FA && (
          <>
            <TextField label="Indicator (CRDB00000)" fullWidth margin="normal" value={indicator} onChange={e => setIndicator(e.target.value)} required />
            <TextField label="Parolă" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} required />
          </>
        )}
        {requires2FA && (
          <>
            <Alert severity="info">Introduceți codul 2FA din aplicația dvs. de autentificare.</Alert>
            <TextField label="Cod 2FA" fullWidth margin="normal" value={code} onChange={e => setCode(e.target.value)} required />
          </>
        )}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>{requires2FA ? 'Verifică 2FA' : 'Autentificare'}</Button>
      </form>
      <Box mt={2} textAlign="center">
        <Link component={RouterLink} to="/register">
          Nu ai cont? Înregistrează-te
        </Link>
      </Box>
    </Box>
  );
} 
