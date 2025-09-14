import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert
} from '@mui/material';
import { generateScutirePdf } from '../api';

const ScutireForm = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    scoala: '',
    clasa: '',
    numarContract: '',
    data: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.scoala || !formData.clasa || !formData.numarContract || !formData.data) {
        setError('Toate câmpurile sunt obligatorii');
        setLoading(false);
        return;
      }

      // Generate the scutire PDF
      const response = await generateScutirePdf(formData);
      
      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Scutire_${formData.scoala.replace(/\s+/g, '_')}_${formData.clasa}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Reset form and close dialog
      setFormData({
        scoala: '',
        clasa: '',
        numarContract: '',
        data: ''
      });
      onSuccess('Scutirea a fost generată cu succes!');
      onClose();
    } catch (err) {
      setError(err.response?.data?.msg || 'Eroare la generarea scutirii');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        scoala: '',
        clasa: '',
        numarContract: '',
        data: ''
      });
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Generează Scutire</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            
            <TextField
              label="Școala/Liceul *"
              value={formData.scoala}
              onChange={handleInputChange('scoala')}
              fullWidth
              required
              disabled={loading}
            />
            
            <TextField
              label="Clasa *"
              value={formData.clasa}
              onChange={handleInputChange('clasa')}
              fullWidth
              required
              disabled={loading}
            />
            
            <TextField
              label="Numărul contractului de voluntariat *"
              value={formData.numarContract}
              onChange={handleInputChange('numarContract')}
              fullWidth
              required
              disabled={loading}
            />
            
            <TextField
              label="Data *"
              type="date"
              value={formData.data}
              onChange={handleInputChange('data')}
              fullWidth
              required
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Anulează
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
          >
            {loading ? 'Se generează...' : 'Generează Scutire'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ScutireForm;
