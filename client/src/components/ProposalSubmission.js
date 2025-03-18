import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Paper, 
  CircularProgress,
  Typography,
  Box,
  Chip
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import useVotingStore from '../store/votingStore';

/**
 * Composant réutilisable pour la soumission des propositions
 */
function ProposalSubmission() {
  // États locaux
  const [proposalDescription, setProposalDescription] = useState('');
  const [userProposal, setUserProposal] = useState(null);

  // États du store
  const { 
    isLoading,
    hasProposed,
    proposals,
    submitProposal,
    loadVoterState
  } = useVotingStore();

  // Recharger l'état du votant à l'initialisation
  useEffect(() => {
    loadVoterState();
  }, []);

  // Trouver la proposition de l'utilisateur
  useEffect(() => {
    const findUserProposal = async () => {
      if (hasProposed && proposals.length > 0) {
        const { accounts } = await import('../store/web3Store').then(m => m.default.getState());
        // Trouver la proposition dont l'utilisateur est le proposeur (ce n'est pas dans l'UI actuelle)
        // Pour le moment, on prend la dernière proposition comme approximation
        setUserProposal(proposals[proposals.length - 1]);
      }
    };
    
    findUserProposal();
  }, [hasProposed, proposals]);

  // Soumission d'une nouvelle proposition
  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    if (await submitProposal(proposalDescription)) {
      setProposalDescription('');
    }
  };

  // Si l'utilisateur a déjà soumis une proposition, afficher celle-ci au lieu du formulaire
  if (hasProposed && userProposal) {
    return (
      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, mb: 3, bgcolor: 'rgba(76, 175, 80, 0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CheckCircleIcon sx={{ color: 'success.main', mr: 1, fontSize: '1.1rem' }} />
          <Typography variant="subtitle2" fontWeight="bold" color="success.main">
            Vous avez déjà soumis une proposition
          </Typography>
        </Box>
        <Paper elevation={0} sx={{ p: 2, bgcolor: 'white', borderRadius: 1, mb: 1 }}>
          <Typography variant="body2">
            {userProposal.description}
          </Typography>
        </Paper>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Chip 
            size="small" 
            label={`Proposition #${userProposal.id}`} 
            sx={{ fontSize: '0.7rem', bgcolor: 'rgba(76, 175, 80, 0.1)', color: 'success.main' }} 
          />
        </Box>
      </Paper>
    );
  }

  // Sinon, afficher le formulaire de soumission
  return (
    <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, mb: 3 }}>
      <form onSubmit={handleProposalSubmit}>
        <TextField
          fullWidth
          label="Description de votre proposition"
          variant="outlined"
          size="small"
          value={proposalDescription}
          onChange={(e) => setProposalDescription(e.target.value)}
          multiline
          rows={2}
          sx={{ mb: 2 }}
          disabled={isLoading}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={<DescriptionIcon />}
          disabled={isLoading}
          fullWidth={true}
          sx={{
            py: 0.8,
            textTransform: 'none',
            borderRadius: 2,
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Soumettre'}
        </Button>
      </form>
    </Paper>
  );
}

export default ProposalSubmission; 