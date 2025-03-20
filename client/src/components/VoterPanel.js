import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  Chip,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Collapse,
  IconButton
} from '@mui/material';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CodeIcon from '@mui/icons-material/Code';
import useWeb3Store from '../store/web3Store';
import useVotingStore from '../store/votingStore';
import AlertMessage from './AlertMessage';
import ProposalSubmission from './ProposalSubmission';

/**
 * Panneau pour les votants inscrits
 */
function VoterPanel() {
  // États du store
  const { workflowStatus, devMode, contract } = useWeb3Store();
  const { 
    proposals, 
    hasVoted, 
    votedProposalId, 
    winningProposal,
    isLoading,
    error,
    success,
    loadProposals,
    loadVoterState,
    loadWinningProposal,
    voteForProposal,
    clearMessages
  } = useVotingStore();

  // État local pour le debug
  const [expandedProposals, setExpandedProposals] = useState({});

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      await loadVoterState();
      await loadProposals();
      
      if (workflowStatus === 5) {
        await loadWinningProposal();
      }
    };
    
    loadData();
  }, [workflowStatus, loadVoterState, loadProposals, loadWinningProposal]);

  // Vote pour une proposition
  const handleVote = async (proposalId) => {
    await voteForProposal(proposalId);
  };

  // Toggle debug info
  const toggleDebugInfo = (proposalId) => {
    setExpandedProposals(prev => ({
      ...prev,
      [proposalId]: !prev[proposalId]
    }));
  };

  // Informations spécifiques à chaque étape du workflow
  const phases = {
    1: {
      title: "Propositions ouvertes",
      description: "Vous pouvez soumettre vos idées pour le vote"
    },
    3: {
      title: "Vote en cours",
      description: "Sélectionnez une proposition et votez"
    },
    5: {
      title: "Résultats",
      description: "Découvrez la proposition gagnante"
    }
  };

  // Message personnalisé en fonction de l'étape
  const getPhaseInfo = () => {
    if (phases[workflowStatus]) {
      return phases[workflowStatus];
    } else if (workflowStatus === 0) {
      return {
        title: "Enregistrement des votants",
        description: "L'administrateur doit valider votre inscription"
      };
    } else if (workflowStatus === 2) {
      return {
        title: "Propositions fermées",
        description: "En attente du début de la phase de vote"
      };
    } else if (workflowStatus === 4) {
      return {
        title: "Vote terminé",
        description: "En attente du décompte des votes"
      };
    }
  };

  const phaseInfo = getPhaseInfo();

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
      {/* Titre du panneau avec information de phase */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center', 
        mb: 3,
        pb: 2,
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          width: { xs: '100%', sm: 'auto' } 
        }}>
          <HowToVoteIcon sx={{ color: '#3f51b5', fontSize: 28 }} />
          <Typography variant="h5" color="primary" fontWeight="bold">
            Espace Votant
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {devMode && (
            <Chip 
              label={`Status: ${workflowStatus}`}
              size="small"
              sx={{ 
                bgcolor: 'rgba(0,0,0,0.08)',
                fontSize: '0.75rem'
              }}
            />
          )}
          <Chip 
            label={phaseInfo?.title} 
            color="primary" 
            sx={{ 
              fontSize: '0.85rem', 
              fontWeight: 'medium',
              width: { xs: '100%', sm: 'auto' }
            }}
          />
        </Box>
      </Box>
      
      {/* Messages d'alerte */}
      <AlertMessage 
        message={error} 
        severity="error" 
        onClose={clearMessages} 
      />
      <AlertMessage 
        message={success} 
        severity="success" 
        onClose={clearMessages} 
      />

      {/* Description de la phase actuelle */}
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        {phaseInfo?.description}
      </Typography>

      {/* Phase 1: Propositions ouvertes */}
      {workflowStatus === 1 && (
        <ProposalSubmission />
      )}

      {/* Liste des propositions */}
      {workflowStatus >= 1 && proposals.length > 0 && (
        <Grid container spacing={2}>
          {proposals.map((proposal) => (
            <Grid item key={proposal.id} xs={12} sm={6} lg={4}>
              <Card 
                elevation={2}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: { xs: 'none', sm: 'translateY(-3px)' },
                    boxShadow: { xs: '0 2px 4px rgba(0,0,0,0.05)', sm: '0 4px 8px rgba(0,0,0,0.1)' }
                  },
                  ...(proposal.id === votedProposalId && {
                    border: '2px solid #4caf50',
                    boxShadow: '0 0 8px rgba(76,175,80,0.2)'
                  }),
                  ...(workflowStatus === 5 && winningProposal && proposal.id === winningProposal.id && {
                    border: '2px solid #f50057',
                    boxShadow: '0 0 8px rgba(245,0,87,0.2)'
                  })
                }}
              >
                <CardContent sx={{ flexGrow: 1, pb: workflowStatus === 3 && !hasVoted ? 0 : undefined }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={`#${proposal.id}`} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(63,81,181,0.1)', 
                          color: '#3f51b5',
                          fontSize: '0.7rem',
                          height: 20
                        }} 
                      />
                      {devMode && (
                        <IconButton 
                          size="small" 
                          onClick={() => toggleDebugInfo(proposal.id)}
                          sx={{ p: 0.5 }}
                        >
                          <CodeIcon sx={{ fontSize: '1rem' }} />
                        </IconButton>
                      )}
                    </Box>
                    
                    {workflowStatus >= 3 && (
                      <Chip 
                        label={`${proposal.voteCount} vote${proposal.voteCount !== 1 ? 's' : ''}`}
                        size="small"
                        color={workflowStatus === 5 && winningProposal && proposal.id === winningProposal.id ? 'secondary' : 'default'}
                        sx={{ 
                          fontSize: '0.7rem', 
                          height: 20,
                          ...(workflowStatus === 5 && winningProposal && proposal.id === winningProposal.id && {
                            fontWeight: 'medium'
                          })
                        }}
                      />
                    )}
                  </Box>
                  
                  {devMode && expandedProposals[proposal.id] && (
                    <Box sx={{ 
                      mb: 1, 
                      p: 1, 
                      bgcolor: 'rgba(0,0,0,0.03)', 
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontFamily: 'monospace'
                    }}>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {JSON.stringify(proposal, null, 2)}
                      </pre>
                    </Box>
                  )}
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {proposal.description}
                  </Typography>
                  
                  {proposal.id === votedProposalId && workflowStatus >= 3 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}>
                      <HowToVoteIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                      <Typography variant="caption">Votre vote</Typography>
                    </Box>
                  )}
                  
                  {workflowStatus === 5 && winningProposal && proposal.id === winningProposal.id && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'secondary.main' }}>
                      <EmojiEventsIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                      <Typography variant="caption" fontWeight="bold">Gagnant</Typography>
                    </Box>
                  )}
                </CardContent>
                
                {workflowStatus === 3 && !hasVoted && (
                  <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => handleVote(proposal.id)}
                      disabled={isLoading}
                      sx={{ 
                        textTransform: 'none', 
                        borderRadius: 4,
                        py: 0,
                        fontSize: '0.75rem',
                        minWidth: 'auto'
                      }}
                    >
                      {isLoading ? <CircularProgress size={16} color="inherit" /> : 'Voter'}
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Message si aucune proposition */}
      {workflowStatus >= 1 && proposals.length === 0 && (
        <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Aucune proposition n'a encore été soumise.
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default VoterPanel;
