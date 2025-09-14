import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert
} from '@mui/material';

const SimpleMapLocationPicker = ({ open, onClose, onLocationSelect, initialLocation }) => {
  const [loading, setLoading] = useState(false);

  const handleLocationSelect = (location) => {
    setLoading(true);
    setTimeout(() => {
      onLocationSelect(location);
      setLoading(false);
    }, 500);
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          borderRadius: 2,
          padding: 3,
          maxWidth: '90vw',
          maxHeight: '90vh',
          width: '800px',
          overflow: 'auto'
        }}
      >
        <Typography variant="h5" gutterBottom>
          Selectați Locația
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Introduceți manual locația evenimentului sau folosiți coordonatele GPS
        </Typography>
        
        <ManualLocationInput onLocationSelect={handleLocationSelect} />
        
        <Box display="flex" gap={2} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => onLocationSelect(null)}
            disabled={loading}
          >
            Anulează
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const ManualLocationInput = ({ onLocationSelect }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: '',
    lng: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.address && formData.lat && formData.lng) {
      onLocationSelect({
        name: formData.name,
        address: formData.address,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng)
      });
    }
  };

  const handleGeocode = async () => {
    if (!formData.address) {
      alert('Vă rugăm să introduceți adresa pentru a obține coordonatele GPS');
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        setFormData({
          ...formData,
          lat: result.lat,
          lng: result.lon
        });
      } else {
        alert('Adresa nu a putut fi găsită. Vă rugăm să introduceți manual coordonatele GPS.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Eroare la obținerea coordonatelor GPS. Vă rugăm să introduceți manual coordonatele.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Introduceți locația evenimentului
      </Typography>
      
      <TextField
        fullWidth
        label="Numele locației"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        margin="normal"
        required
        placeholder="ex: Sala Polivalentă, Centrul Civic, etc."
      />
      
      <TextField
        fullWidth
        label="Adresa completă"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        margin="normal"
        required
        placeholder="ex: Strada Mihai Viteazu 12, București, România"
      />
      
      <Button
        type="button"
        variant="outlined"
        onClick={handleGeocode}
        sx={{ mb: 2 }}
        disabled={!formData.address}
      >
        Obține coordonatele GPS automat
      </Button>
      
      <Box display="flex" gap={2}>
        <TextField
          fullWidth
          label="Latitudine"
          type="number"
          value={formData.lat}
          onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
          margin="normal"
          required
          placeholder="ex: 44.4268"
        />
        <TextField
          fullWidth
          label="Longitudine"
          type="number"
          value={formData.lng}
          onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
          margin="normal"
          required
          placeholder="ex: 26.1025"
        />
      </Box>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Coordonate GPS pentru România:</strong><br/>
          • București: 44.4268, 26.1025<br/>
          • Cluj-Napoca: 46.7712, 23.6236<br/>
          • Timișoara: 45.7471, 21.2087<br/>
          • Iași: 47.1585, 27.6014
        </Typography>
      </Alert>
      
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Confirmă Locația
      </Button>
    </Box>
  );
};

export default SimpleMapLocationPicker;
