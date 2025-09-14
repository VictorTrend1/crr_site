import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Alert, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { register, generateVolunteerPdf, saveSignedPdf } from '../api';
import DigitalSignature from './DigitalSignature';

export default function VolunteerRegistration() {
  const [formData, setFormData] = useState({
    // Informații personale
    numePrenume: '',
    telefon: '',
    email: '',
    localitate: '',
    strada: '',
    numar: '',
    bloc: '',
    scara: '',
    etaj: '',
    apartament: '',
    cnp: '',
    serieBuletin: '',
    numarBuletin: '',
    eliberatDe: '',
    dataEliberare: '',
    dataExpirare: '',
    durataContract: 'Nedeterminat',
    esteMinor: 'Nu',
    password: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [generatedPdf, setGeneratedPdf] = useState(null);

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required fields
    const requiredFields = [
      'numePrenume', 'telefon', 'email', 'localitate', 'strada', 'numar',
      'cnp', 'serieBuletin', 'numarBuletin', 'eliberatDe', 'dataEliberare', 'dataExpirare', 'password'
    ];

    const missingFields = requiredFields.filter(field => !formData[field].trim());
    if (missingFields.length > 0) {
      setError('Toate câmpurile marcate cu * sunt obligatorii');
      return;
    }

    try {
      const res = await register({
        name: formData.numePrenume,
        password: formData.password,
        role: 'Voluntar',
        isVolunteer: true,
        volunteerData: formData
      });
      
      // Generate PDF
      const pdfResponse = await generateVolunteerPdf();
      setGeneratedPdf(pdfResponse.data);
      setShowSignatureDialog(true);
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.msg || err.response?.data?.error || 'Înregistrare eșuată');
    }
  };

  return (
    <Box maxWidth={800} mx="auto" mt={4} p={3}>
      <Typography variant="h4" align="center" gutterBottom color="primary">
        Înregistrare Voluntar
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <form onSubmit={handleSubmit}>
        {/* Informații personale */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Informații personale
          </Typography>
          
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={2}>
            <TextField
              label="Nume și prenume *"
              value={formData.numePrenume}
              onChange={handleInputChange('numePrenume')}
              fullWidth
              required
            />
            <TextField
              label="Număr de telefon *"
              value={formData.telefon}
              onChange={handleInputChange('telefon')}
              fullWidth
              required
            />
            <TextField
              label="Adresa de email *"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              fullWidth
              required
            />
            <TextField
              label="Parolă *"
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              fullWidth
              required
            />
            <TextField
              label="Localitate *"
              value={formData.localitate}
              onChange={handleInputChange('localitate')}
              fullWidth
              required
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            Adresa detaliată
          </Typography>
          
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
            <TextField
              label="Strada *"
              value={formData.strada}
              onChange={handleInputChange('strada')}
              fullWidth
              required
            />
            <TextField
              label="Nr. *"
              value={formData.numar}
              onChange={handleInputChange('numar')}
              fullWidth
              required
            />
            <TextField
              label="Bloc"
              value={formData.bloc}
              onChange={handleInputChange('bloc')}
              fullWidth
            />
            <TextField
              label="Scara"
              value={formData.scara}
              onChange={handleInputChange('scara')}
              fullWidth
            />
            <TextField
              label="Etaj"
              value={formData.etaj}
              onChange={handleInputChange('etaj')}
              fullWidth
            />
            <TextField
              label="Apartament"
              value={formData.apartament}
              onChange={handleInputChange('apartament')}
              fullWidth
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            Date buletin de identitate
          </Typography>
          
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
            <TextField
              label="C.N.P. *"
              value={formData.cnp}
              onChange={handleInputChange('cnp')}
              fullWidth
              required
            />
            <TextField
              label="Serie buletin *"
              value={formData.serieBuletin}
              onChange={handleInputChange('serieBuletin')}
              fullWidth
              required
            />
            <TextField
              label="Număr buletin *"
              value={formData.numarBuletin}
              onChange={handleInputChange('numarBuletin')}
              fullWidth
              required
            />
            <TextField
              label="De cine e eliberat buletinul *"
              value={formData.eliberatDe}
              onChange={handleInputChange('eliberatDe')}
              fullWidth
              required
            />
            <TextField
              label="La ce dată a fost eliberat *"
              type="date"
              value={formData.dataEliberare}
              onChange={handleInputChange('dataEliberare')}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Data la care expiră *"
              type="date"
              value={formData.dataExpirare}
              onChange={handleInputChange('dataExpirare')}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend">Durata contractului</FormLabel>
            <RadioGroup
              value={formData.durataContract}
              onChange={handleInputChange('durataContract')}
              row
            >
              <FormControlLabel value="Nedeterminat" control={<Radio />} label="Nedeterminat" />
              <FormControlLabel value="Determinat" control={<Radio />} label="Determinat" />
            </RadioGroup>
          </FormControl>

          <FormControl component="fieldset">
            <FormLabel component="legend">Ești minor?</FormLabel>
            <RadioGroup
              value={formData.esteMinor}
              onChange={handleInputChange('esteMinor')}
              row
            >
              <FormControlLabel value="Da" control={<Radio />} label="Da" />
              <FormControlLabel value="Nu" control={<Radio />} label="Nu" />
            </RadioGroup>
          </FormControl>
        </Paper>

        <Box display="flex" justifyContent="center" mt={3}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{ px: 4 }}
          >
            Trimite Înregistrarea
          </Button>
        </Box>
      </form>

      {/* Digital Signature Dialog */}
      <Dialog 
        open={showSignatureDialog} 
        onClose={() => setShowSignatureDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Semnează Documentul</DialogTitle>
        <DialogContent>
          <DigitalSignature
            onSave={handleSignatureSave}
            onCancel={() => setShowSignatureDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );

  async function handleSignatureSave(signatureData) {
    try {
      // Save the signed PDF
      const result = await saveSignedPdf(signatureData);
      setSuccess(`Înregistrare completă! Indicativul tău este: ${result.data.indicator}`);
      setShowSignatureDialog(false);
      
      // Automatically download the contract
      if (generatedPdf) {
        const url = window.URL.createObjectURL(generatedPdf);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contract-voluntar-${result.data.indicator}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
              // Clear form
        setFormData({
          numePrenume: '',
          telefon: '',
          email: '',
          localitate: '',
          strada: '',
          numar: '',
          bloc: '',
          scara: '',
          etaj: '',
          apartament: '',
          cnp: '',
          serieBuletin: '',
          numarBuletin: '',
          eliberatDe: '',
          dataEliberare: '',
          dataExpirare: '',
          durataContract: 'Nedeterminat',
          esteMinor: 'Nu',
          password: ''
        });
    } catch (err) {
      setError(err.response?.data?.msg || 'Eroare la salvarea semnăturii');
    }
  }
}
