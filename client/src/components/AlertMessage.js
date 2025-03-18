import React, { useEffect } from 'react';
import { Alert } from '@mui/material';

/**
 * Composant pour afficher des messages d'alerte avec auto-disparition
 */
function AlertMessage({ message, severity, onClose, autoHideDuration = 5000 }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [message, onClose, autoHideDuration]);
  
  if (!message) return null;
  
  return (
    <Alert 
      severity={severity || 'info'}
      onClose={onClose}
      sx={{
        width: '100%',
        mb: 2,
        '& .MuiAlert-message': {
          fontSize: '1rem'
        }
      }}
    >
      {message}
    </Alert>
  );
}

export default AlertMessage; 