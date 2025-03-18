import React from 'react';
import { Box, Typography, Step, Stepper, StepLabel, StepConnector, styled, useMediaQuery, useTheme } from '@mui/material';
import useWeb3Store from '../store/web3Store';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

// Connecteur personnalisé pour la timeline
const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.MuiStepConnector-root`]: {
    top: 10,
  },
  [`&.Mui-active`]: {
    [`& .MuiStepConnector-line`]: {
      borderColor: theme.palette.primary.main,
    },
  },
  [`&.Mui-completed`]: {
    [`& .MuiStepConnector-line`]: {
      borderColor: theme.palette.primary.main,
    },
  },
  [`& .MuiStepConnector-line`]: {
    borderColor: theme.palette.grey[300],
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

// Icône personnalisée pour les étapes
const StepIcon = ({ active, completed }) => {
  if (completed) {
    return <CheckCircleIcon fontSize="small" color="primary" />;
  }
  if (active) {
    return (
      <Box
        sx={{
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <RadioButtonUncheckedIcon fontSize="small" />
      </Box>
    );
  }
  return (
    <Box
      sx={{
        color: 'text.disabled',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <RadioButtonUncheckedIcon fontSize="small" />
    </Box>
  );
};

/**
 * Composant affichant l'état du processus de vote
 */
function WorkflowTimeline() {
  const workflowStatus = useWeb3Store(state => state.workflowStatus);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const steps = [
    "Enregistrement votants",
    "Propositions ouvertes",
    "Propositions fermées",
    "Vote en cours",
    "Vote terminé",
    "Résultats"
  ];
  
  // Versions abrégées pour mobile
  const mobileSteps = [
    "Votants",
    "Prop. ouv.",
    "Prop. ferm.",
    "Vote",
    "Terminé",
    "Résultats"
  ];
  
  return (
    <Box sx={{ width: '100%', mt: 2, mb: 3, overflowX: 'auto', pb: 1 }}>
      <Stepper
        activeStep={workflowStatus}
        connector={<CustomConnector />}
        alternativeLabel
        sx={{ minWidth: isMobile ? 500 : 'auto' }}
      >
        {steps.map((label, index) => (
          <Step key={index} completed={workflowStatus > index}>
            <StepLabel
              StepIconComponent={(props) => 
                <StepIcon 
                  active={props.active} 
                  completed={props.completed} 
                />
              }
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: workflowStatus === index ? 'bold' : 'normal',
                  color: workflowStatus >= index ? 'primary.main' : 'text.secondary',
                  fontSize: isMobile ? '0.65rem' : '0.75rem'
                }}
              >
                {isMobile ? mobileSteps[index] : label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}

export default WorkflowTimeline; 