import React, { useRef, useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';

export default function DigitalSignature({ onSave, onCancel }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL('image/png');
    onSave(signatureData);
  };

  return (
    <Box maxWidth={600} mx="auto" mt={4} p={3}>
      <Typography variant="h5" align="center" gutterBottom>
        Semnătură Digitală
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" align="center" gutterBottom>
          Semnează în caseta de mai jos pentru a confirma înregistrarea ca voluntar
        </Typography>
        
        <Box
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 2,
            mb: 2,
            backgroundColor: '#fafafa'
          }}
        >
          <canvas
            ref={canvasRef}
            width={500}
            height={200}
            style={{
              border: '1px solid #ddd',
              borderRadius: 4,
              backgroundColor: 'white',
              cursor: 'crosshair'
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </Box>
        
        <Box display="flex" justifyContent="center" gap={2}>
          <Button
            variant="outlined"
            onClick={clearSignature}
            disabled={!hasSignature}
          >
            Șterge
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={saveSignature}
            disabled={!hasSignature}
          >
            Salvează Semnătura
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onCancel}
          >
            Anulează
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
