import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

const MapComponent = ({ onLocationSelect, initialLocation }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [geocoder, setGeocoder] = useState(null);

  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: initialLocation ? { lat: initialLocation.lat, lng: initialLocation.lng } : { lat: 44.4268, lng: 26.1025 }, // Bucharest coordinates
        zoom: 13,
        mapTypeId: 'roadmap'
      });
      setMap(newMap);

      // Initialize geocoder
      const newGeocoder = new window.google.maps.Geocoder();
      setGeocoder(newGeocoder);

      // Add click listener to map
      newMap.addListener('click', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        // Remove existing marker
        if (marker) {
          marker.setMap(null);
        }

        // Add new marker
        const newMarker = new window.google.maps.Marker({
          position: { lat, lng },
          map: newMap,
          title: 'Selected Location'
        });
        setMarker(newMarker);

        // Reverse geocode to get address
        newGeocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const result = results[0];
            const address = result.formatted_address;
            const locationName = result.name || result.formatted_address.split(',')[0];
            
            onLocationSelect({
              name: locationName,
              address: address,
              lat: lat,
              lng: lng
            });
          }
        });
      });
    }
  }, [map, marker, geocoder, onLocationSelect, initialLocation]);

  return <div ref={mapRef} style={{ width: '100%', height: '400px' }} />;
};

const render = (status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Se încarcă harta...
          </Typography>
        </Box>
      );
    case Status.FAILURE:
      return (
        <Box textAlign="center" py={4}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Nu s-a putut încărca harta Google Maps. Vă rugăm să introduceți manual locația.
          </Alert>
          <ManualLocationInput onLocationSelect={onLocationSelect} />
        </Box>
      );
    default:
      return null;
  }
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

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Introduceți manual locația
      </Typography>
      <TextField
        fullWidth
        label="Numele locației"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="Adresa completă"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        margin="normal"
        required
      />
      <Box display="flex" gap={2}>
        <TextField
          fullWidth
          label="Latitudine"
          type="number"
          value={formData.lat}
          onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Longitudine"
          type="number"
          value={formData.lng}
          onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
          margin="normal"
          required
        />
      </Box>
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Confirmă Locația
      </Button>
    </Box>
  );
};

const GoogleMapLocationPicker = ({ open, onClose, onLocationSelect, initialLocation }) => {
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
          Selectați Locația pe Hartă
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Faceți clic pe hartă pentru a selecta locația evenimentului
        </Typography>
        
        <Wrapper
          apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'demo-key'}
          render={render}
        >
          <MapComponent
            onLocationSelect={handleLocationSelect}
            initialLocation={initialLocation}
          />
        </Wrapper>

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

export default GoogleMapLocationPicker;
