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
import jsQR from 'jsqr';

const QRCodeScanner = ({ open, onClose, onSuccess, title = "Scanare QR Code" }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const scanningInterval = useRef(null);

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
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Start QR code detection when video is ready
        videoRef.current.onloadedmetadata = () => {
          startQRDetection();
        };
      }
    } catch (err) {
      setError('Nu s-a putut accesa camera. Verificați permisiunile.');
      setScanning(false);
    }
  };

  const startQRDetection = () => {
    if (scanningInterval.current) {
      clearInterval(scanningInterval.current);
    }
    
    scanningInterval.current = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        detectQRCode();
      }
    }, 100); // Check every 100ms
  };

  const detectQRCode = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;
    
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data for QR detection
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simple QR code detection - look for square patterns
    // This is a basic implementation, in production you'd use a proper QR library
    try {
      // Try to detect QR code patterns in the image
      const qrData = detectQRPattern(imageData);
      if (qrData) {
        processQRData(qrData);
        stopCamera();
      }
    } catch (err) {
      // Silently continue scanning
    }
  };

  const detectQRPattern = (imageData) => {
    // Use jsQR library for proper QR code detection
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        console.log('QR Code detected:', code.data);
        return code.data;
      }
    } catch (err) {
      console.log('QR detection error:', err);
    }
    return null;
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanningInterval.current) {
      clearInterval(scanningInterval.current);
      scanningInterval.current = null;
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
    setShowManualInput(true);
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      processQRData(manualInput.trim());
    }
  };

  const handleManualInputChange = (event) => {
    setManualInput(event.target.value);
  };

  const processQRData = async (qrData) => {
    try {
      setError('');
      setSuccess('');
      
      // Check if it's a redirecting URL
      if (qrData.includes('backend.crr-site.online/api/events/qr/')) {
        // Extract check-in code from URL
        const checkInCodeMatch = qrData.match(/\/qr\/([a-fA-F0-9]+)/);
        if (checkInCodeMatch) {
          const checkInCode = checkInCodeMatch[1];
          const qrDataForAPI = JSON.stringify({
            checkInCode: checkInCode,
            type: 'event_checkin'
          });
          
          // Process with API
          const response = await checkInWithQR(qrDataForAPI);
          
          if (response.data.autoRegistered) {
            setSuccess('Te-ai înregistrat automat la eveniment!');
          } else if (response.data.completedPartialRegistration) {
            setSuccess('Înregistrarea a fost completată cu succes!');
          } else if (response.data.wasAlreadyRegistered) {
            setSuccess('Erai deja înregistrat la acest eveniment!');
          } else {
            setSuccess(response.data.msg);
          }
          
          if (onSuccess) {
            onSuccess(response.data);
          }
          
          setTimeout(() => handleClose(), 3000);
          return;
        }
      }
      
      // Try to parse QR data to determine type
      let qrInfo;
      try {
        qrInfo = JSON.parse(qrData);
      } catch (err) {
        // If not JSON, treat as plain text
        setSuccess(`QR Code detectat: ${qrData}`);
        if (onSuccess) {
          onSuccess({ data: qrData, type: 'text' });
        }
        setTimeout(() => handleClose(), 2000);
        return;
      }
      
      // Handle different QR code types
      if (qrInfo.type === 'event_checkin') {
        // Event QR code
        const response = await checkInWithQR(qrData);
        
        if (response.data.autoRegistered) {
          setSuccess('Te-ai înregistrat automat la eveniment!');
        } else if (response.data.completedPartialRegistration) {
          setSuccess('Înregistrarea a fost completată cu succes!');
        } else if (response.data.wasAlreadyRegistered) {
          setSuccess('Erai deja înregistrat la acest eveniment!');
        } else {
          setSuccess(response.data.msg);
        }
        
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        // Other QR code types
        setSuccess(`QR Code procesat: ${qrData}`);
        if (onSuccess) {
          onSuccess({ data: qrData, type: qrInfo.type || 'unknown' });
        }
      }
      
      // Close dialog after 3 seconds
      setTimeout(() => {
        handleClose();
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.msg || 'Eroare la procesarea QR code-ului');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          
          {scanning ? (
            <Box position="relative" width="100%" maxWidth={600} sx={{ aspectRatio: '16/9' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
              
              {/* Full camera overlay with scanning effect */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                sx={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Scanning frame */}
                <Box
                  position="relative"
                  width="250px"
                  height="250px"
                  sx={{
                    border: '3px solid #1976d2',
                    borderRadius: '12px',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-3px',
                      left: '-3px',
                      right: '-3px',
                      bottom: '-3px',
                      border: '3px solid #1976d2',
                      borderRadius: '12px',
                      animation: 'pulse 1.5s infinite',
                      opacity: 0.7
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '20px',
                      height: '20px',
                      background: '#1976d2',
                      borderRadius: '50%',
                      animation: 'pulse 0.8s infinite'
                    }
                  }}
                />
                
                {/* Corner indicators */}
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  width="250px"
                  height="250px"
                  sx={{
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      width: '30px',
                      height: '30px',
                      borderTop: '4px solid #1976d2',
                      borderLeft: '4px solid #1976d2',
                      borderRadius: '4px 0 0 0'
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      width: '30px',
                      height: '30px',
                      borderTop: '4px solid #1976d2',
                      borderRight: '4px solid #1976d2',
                      borderRadius: '0 4px 0 0'
                    }
                  }}
                />
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  width="250px"
                  height="250px"
                  sx={{
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                      width: '30px',
                      height: '30px',
                      borderBottom: '4px solid #1976d2',
                      borderLeft: '4px solid #1976d2',
                      borderRadius: '0 0 0 4px'
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      width: '30px',
                      height: '30px',
                      borderBottom: '4px solid #1976d2',
                      borderRight: '4px solid #1976d2',
                      borderRadius: '0 0 4px 0'
                    }
                  }}
                />
              </Box>
              
              {/* Hidden canvas for QR detection */}
              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
              />
              
              <Typography 
                variant="body2" 
                textAlign="center" 
                sx={{ 
                  mt: 2, 
                  color: 'text.secondary',
                  fontWeight: 'bold'
                }}
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
          
          {!showManualInput ? (
            <Button
              variant="outlined"
              onClick={handleManualQR}
              fullWidth
              sx={{ mt: 2 }}
            >
              Introducere manuală QR code
            </Button>
          ) : (
            <Box sx={{ mt: 2, width: '100%' }}>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Introduceți manual datele QR code:
              </Typography>
              <Box display="flex" gap={1}>
                <input
                  type="text"
                  value={manualInput}
                  onChange={handleManualInputChange}
                  placeholder="Introduceți QR code aici..."
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleManualSubmit}
                  disabled={!manualInput.trim()}
                  sx={{ minWidth: '100px' }}
                >
                  Procesează
                </Button>
              </Box>
              <Button
                variant="text"
                onClick={() => setShowManualInput(false)}
                sx={{ mt: 1 }}
              >
                Înapoi la scanare
              </Button>
            </Box>
          )}
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
