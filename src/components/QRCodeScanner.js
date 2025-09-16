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
    
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return;
    
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data for QR detection
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Debug: Log every 50th frame to avoid spam
    if (Math.random() < 0.02) {
      console.log('Scanning frame:', canvas.width, 'x', canvas.height);
    }
    
    try {
      // Try to detect QR code patterns in the image
      const qrData = detectQRPattern(imageData);
      if (qrData) {
        console.log('QR Code found!', qrData);
        processQRData(qrData);
        stopCamera();
      }
    } catch (err) {
      console.log('QR detection error:', err);
    }
  };

  const detectQRPattern = (imageData) => {
    // Use jsQR library for proper QR code detection
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
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
      
      // Check if it's a redirecting URL (new format)
      if (qrData.includes('crr-site.online/event-checkin/')) {
        // Extract check-in code from URL
        const checkInCodeMatch = qrData.match(/\/event-checkin\/([a-fA-F0-9]+)/);
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
      
      // Check if it's the old backend URL format (for backward compatibility)
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
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={window.innerWidth < 768}
      sx={{
        '& .MuiDialog-paper': {
          margin: window.innerWidth < 768 ? 0 : 24,
          maxHeight: window.innerWidth < 768 ? '100vh' : '85vh',
          borderRadius: window.innerWidth < 768 ? 0 : 12
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2, 
        fontSize: '1.5rem',
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'primary.main'
      }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ p: 3, pt: 1 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ width: '100%' }}>{success}</Alert>}
          
          {scanning ? (
            <Box 
              position="relative" 
              width="100%" 
              maxWidth="600px"
              sx={{ 
                aspectRatio: '4/3',
                maxHeight: '500px',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 3
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover'
                }}
              />
              
              {/* Scanning overlay */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                sx={{
                  background: 'rgba(0, 0, 0, 0.4)',
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
                    borderRadius: 2,
                    boxShadow: '0 0 20px rgba(25, 118, 210, 0.5)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-6px',
                      left: '-6px',
                      right: '-6px',
                      bottom: '-6px',
                      border: '2px solid #1976d2',
                      borderRadius: 2,
                      animation: 'pulse 2s infinite',
                      opacity: 0.6
                    }
                  }}
                >
                  {/* Corner indicators */}
                  <Box
                    position="absolute"
                    top="15px"
                    left="15px"
                    width="30px"
                    height="30px"
                    sx={{
                      borderTop: '4px solid #1976d2',
                      borderLeft: '4px solid #1976d2',
                      borderRadius: '4px 0 0 0'
                    }}
                  />
                  <Box
                    position="absolute"
                    top="15px"
                    right="15px"
                    width="30px"
                    height="30px"
                    sx={{
                      borderTop: '4px solid #1976d2',
                      borderRight: '4px solid #1976d2',
                      borderRadius: '0 4px 0 0'
                    }}
                  />
                  <Box
                    position="absolute"
                    bottom="15px"
                    left="15px"
                    width="30px"
                    height="30px"
                    sx={{
                      borderBottom: '4px solid #1976d2',
                      borderLeft: '4px solid #1976d2',
                      borderRadius: '0 0 0 4px'
                    }}
                  />
                  <Box
                    position="absolute"
                    bottom="15px"
                    right="15px"
                    width="30px"
                    height="30px"
                    sx={{
                      borderBottom: '4px solid #1976d2',
                      borderRight: '4px solid #1976d2',
                      borderRadius: '0 0 4px 0'
                    }}
                  />
                </Box>
              </Box>
              
              {/* Hidden canvas for QR detection */}
              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
              />
              
              <Typography 
                variant="body1" 
                textAlign="center" 
                sx={{ 
                  mt: 3, 
                  color: 'text.secondary',
                  fontWeight: 500,
                  px: 2
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
              sx={{ mt: 3, py: 1.5 }}
            >
              Introducere manuală QR code
            </Button>
          ) : (
            <Box sx={{ mt: 3, width: '100%', maxWidth: 500 }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 2, 
                  color: 'text.secondary',
                  textAlign: 'center'
                }}
              >
                Introduceți manual datele QR code:
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <input
                  type="text"
                  value={manualInput}
                  onChange={handleManualInputChange}
                  placeholder="Introduceți QR code aici..."
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    onClick={handleManualSubmit}
                    disabled={!manualInput.trim()}
                    fullWidth
                    sx={{ py: 1.5 }}
                  >
                    Procesează
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setShowManualInput(false)}
                    sx={{ py: 1.5 }}
                  >
                    Anulează
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        p: 3,
        gap: 2,
        justifyContent: 'center'
      }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          sx={{ 
            minWidth: 120,
            py: 1.5
          }}
        >
          Anulează
        </Button>
        <Button 
          onClick={startCamera} 
          variant="contained"
          disabled={scanning}
          sx={{ 
            minWidth: 120,
            py: 1.5
          }}
        >
          {scanning ? 'Se scanează...' : 'Începe scanarea'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeScanner;
