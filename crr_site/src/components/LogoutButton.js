import React from 'react';
import { Button } from '@mui/material';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <Button color="inherit" onClick={handleLogout} sx={{ ml: 2 }}>
      Deconectare
    </Button>
  );
} 