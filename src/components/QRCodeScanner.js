import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { checkInWithQR } from '../api';

const QRCodeScanner = ({ open, onClose, onSuccess }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [open]);

  const startCamera = async () => {
    try {
      setScanning(true);
      setError('');
      setSuccess('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera if available
        } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Nu s-a putut accesa camera. Verificați permisiunile.');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const handleClose = () => {
    stopCamera();
    setError('');
    setSuccess('');
    onClose();
  };

  const handleManualQR = () => {
    const qrData = prompt('Introduceți datele QR code:');
    if (qrData) {
      processQRData(qrData);
    }
  };

  const processQRData = async (qrData) => {
    try {
      setError('');
      setSuccess('');
      
      const response = await checkInWithQR(qrData);
      
      setSuccess(response.data.msg);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.msg || 'Eroare la procesarea QR code-ului');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Scanare QR Code pentru Check-in</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          
          {scanning ? (
            <Box position="relative" width="100%" maxWidth={400}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
              />
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                width="200px"
                height="200px"
                border="2px solid #1976d2"
                borderRadius="8px"
                sx={{
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-2px',
                    left: '-2px',
                    right: '-2px',
                    bottom: '-2px',
                    border: '2px solid #1976d2',
                    borderRadius: '8px',
                    animation: 'pulse 2s infinite'
                  }
                }}
              />
              <Typography 
                variant="body2" 
                textAlign="center" 
                sx={{ mt: 2, color: 'text.secondary' }}
              >
                Poziționați QR code-ul în cadrul de scanare
              </Typography>
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Se inițializează camera...
              </Typography>
            </Box>
          )}
          
          <Button
            variant="outlined"
            onClick={handleManualQR}
            fullWidth
            sx={{ mt: 2 }}
          >
            Introducere manuală QR code
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          Anulează
        </Button>
        <Button 
          onClick={startCamera} 
          variant="contained"
          disabled={scanning}
        >
          {scanning ? 'Se scanează...' : 'Începe scanarea'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeScanner;
