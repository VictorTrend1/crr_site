import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  Menu,
  MenuItem,
  IconButton
} from '@mui/material';
import { Map as MapIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';

const MapAppSelector = ({ lat, lng }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openInApp = (appType) => {
    let url = '';
    
    switch (appType) {
      case 'google':
        url = `https://www.google.com/maps?q=${lat},${lng}`;
        break;
      case 'apple':
        url = `http://maps.apple.com/?q=${lat},${lng}`;
        break;
      case 'waze':
        url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
        break;
      case 'osm':
        url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;
        break;
      case 'here':
        url = `https://wego.here.com/directions/mylocation/${lat},${lng}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank');
    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        color="primary"
        sx={{ 
          border: '1px solid',
          borderColor: 'primary.main',
          borderRadius: 1,
          minWidth: '120px',
          height: '40px'
        }}
      >
        <MapIcon sx={{ mr: 1 }} />
        <Typography variant="button" sx={{ fontSize: '0.75rem' }}>
          Deschide în hartă
        </Typography>
        <MoreVertIcon sx={{ ml: 1, fontSize: '1rem' }} />
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={() => openInApp('google')}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              component="img"
              src="https://maps.gstatic.com/mapfiles/api-3/images/icon_71.png"
              alt="Google Maps"
              sx={{ width: 20, height: 20 }}
            />
            Google Maps
          </Box>
        </MenuItem>
        
        <MenuItem onClick={() => openInApp('apple')}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              component="img"
              src="https://developer.apple.com/assets/elements/icons/maps/maps-96x96_2x.png"
              alt="Apple Maps"
              sx={{ width: 20, height: 20 }}
            />
            Apple Maps
          </Box>
        </MenuItem>
        
        <MenuItem onClick={() => openInApp('waze')}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              component="img"
              src="https://static.waze.com/static/images/favicon.ico"
              alt="Waze"
              sx={{ width: 20, height: 20 }}
            />
            Waze
          </Box>
        </MenuItem>
        
        <MenuItem onClick={() => openInApp('osm')}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              component="img"
              src="https://www.openstreetmap.org/favicon.ico"
              alt="OpenStreetMap"
              sx={{ width: 20, height: 20 }}
            />
            OpenStreetMap
          </Box>
        </MenuItem>
        
        <MenuItem onClick={() => openInApp('here')}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              component="img"
              src="https://wego.here.com/favicon.ico"
              alt="HERE Maps"
              sx={{ width: 20, height: 20 }}
            />
            HERE Maps
          </Box>
        </MenuItem>
      </Menu>
    </>
  );
};

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
      
      <Box display="flex" gap={2} sx={{ mb: 2 }}>
        <Button
          type="button"
          variant="outlined"
          onClick={handleGeocode}
          disabled={!formData.address}
          sx={{ flex: 1 }}
        >
          Obține coordonatele GPS automat
        </Button>
        {formData.lat && formData.lng && (
          <MapAppSelector lat={formData.lat} lng={formData.lng} />
        )}
      </Box>
      
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
      
      <Box display="flex" gap={2} sx={{ mt: 2 }}>
        <Button type="submit" variant="contained" sx={{ flex: 1 }}>
          Confirmă Locația
        </Button>
        {formData.lat && formData.lng && (
          <MapAppSelector lat={formData.lat} lng={formData.lng} />
        )}
      </Box>
    </Box>
  );
};

export default SimpleMapLocationPicker;
