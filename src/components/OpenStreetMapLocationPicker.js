import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';

const OpenStreetMapLocationPicker = ({ open, onClose, onLocationSelect, initialLocation }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (open && mapRef.current && !map) {
      // Load Leaflet dynamically to avoid SSR issues
      import('leaflet').then((L) => {
        // Fix for default markers
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        const newMap = L.map(mapRef.current).setView(
          initialLocation ? [initialLocation.lat, initialLocation.lng] : [44.4268, 26.1025], // Bucharest
          13
        );

        // Primary tile layer (CartoDB - more permissive)
        const primaryLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        });

        // Fallback tile layer (OpenStreetMap with proper attribution)
        const fallbackLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        });

        // Try primary layer first, fallback if it fails
        primaryLayer.addTo(newMap);
        
        // Add fallback layer as backup
        primaryLayer.on('tileerror', () => {
          if (newMap.hasLayer(primaryLayer)) {
            newMap.removeLayer(primaryLayer);
            fallbackLayer.addTo(newMap);
          }
        });

        // Add initial marker if location exists
        if (initialLocation) {
          const initialMarker = L.marker([initialLocation.lat, initialLocation.lng])
            .addTo(newMap)
            .bindPopup(initialLocation.name);
          setMarker(initialMarker);
        }

        // Add click event listener
        newMap.on('click', (e) => {
          const { lat, lng } = e.latlng;
          
          // Remove existing marker
          if (marker) {
            newMap.removeLayer(marker);
          }

          // Add new marker
          const newMarker = L.marker([lat, lng]).addTo(newMap);
          setMarker(newMarker);

          // Reverse geocoding using Nominatim (free)
          setLoading(true);
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
            .then(response => response.json())
            .then(data => {
              const address = data.display_name || 'Adresa nu a putut fi determinată';
              const locationName = data.name || data.display_name?.split(',')[0] || 'Locație selectată';
              
              newMarker.bindPopup(locationName).openPopup();
              
              onLocationSelect({
                name: locationName,
                address: address,
                lat: lat,
                lng: lng
              });
              setLoading(false);
            })
            .catch(error => {
              console.error('Geocoding error:', error);
              // Fallback with coordinates only
              const fallbackName = `Locație (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
              const fallbackAddress = `Coordonate: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
              
              newMarker.bindPopup(fallbackName).openPopup();
              
              onLocationSelect({
                name: fallbackName,
                address: fallbackAddress,
                lat: lat,
                lng: lng
              });
              setLoading(false);
            });
        });

        setMap(newMap);
      }).catch(error => {
        console.error('Failed to load Leaflet:', error);
        setMapError(true);
      });
    }

    return () => {
      if (map) {
        map.remove();
        setMap(null);
        setMarker(null);
      }
    };
  }, [open, initialLocation, onLocationSelect, map, marker]);

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
          Faceți clic pe hartă pentru a selecta locația evenimentului (OpenStreetMap - gratuit)
        </Typography>
        
        {mapError ? (
          <Box textAlign="center" py={4}>
            <Alert severity="error" sx={{ mb: 2 }}>
              Nu s-a putut încărca harta. Vă rugăm să introduceți manual locația.
            </Alert>
            <ManualLocationInput onLocationSelect={onLocationSelect} />
          </Box>
        ) : (
          <Box sx={{ height: '400px', width: '100%', position: 'relative' }}>
            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1000
                }}
              >
                <CircularProgress />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Se procesează locația...
                </Typography>
              </Box>
            )}
            
            <div 
              ref={mapRef} 
              style={{ 
                height: '100%', 
                width: '100%',
                minHeight: '400px'
              }} 
            />
          </Box>
        )}

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

export default OpenStreetMapLocationPicker;