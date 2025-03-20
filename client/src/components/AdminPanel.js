import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Stack,
  Avatar,
  CircularProgress,
  Chip,
  Card,
  alpha,
  Divider,
  Tooltip,
  Fade,
  IconButton,
  Collapse
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockIcon from '@mui/icons-material/Lock';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CodeIcon from '@mui/icons-material/Code';
import useWeb3Store from '../store/web3Store';
import useVotingStore from '../store/votingStore';
import useAdminStore from '../store/adminStore';
import AlertMessage from './AlertMessage';
import ProposalSubmission from './ProposalSubmission';

/**
 * Panneau d'administration pour gérer le processus de vote
 */
function AdminPanel() {
  // État local
  const [voterAddress, setVoterAddress] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // États de connexion
  const { workflowStatus, isVoter, devMode, contract } = useWeb3Store();
  
  // États des votants
  const { 
    registeredVoters, 
    loadRegisteredVoters, 
    registerVoter, 
    error: voterError, 
    success: voterSuccess, 
    isLoading: voterLoading,
    clearMessages: clearVoterMessages 
  } = useVotingStore();
  
  // États des actions admin
  const { 
    startProposalsRegistration, 
    endProposalsRegistration, 
    startVotingSession, 
    endVotingSession, 
    tallyVotes,
    resetVoting,
    error: adminError,
    success: adminSuccess,
    isLoading: adminLoading,
    clearMessages: clearAdminMessages
  } = useAdminStore();
  
  // Chargement initial des données
  useEffect(() => {
    loadRegisteredVoters();
    
    // Charger l'état du votant si l'administrateur est aussi votant
    if (isVoter) {
      const { loadVoterState } = useVotingStore.getState();
      loadVoterState();
    }
  }, [isVoter]);
  
  // Gestion de l'ajout d'un votant
  const handleAddVoter = async (e) => {
    e.preventDefault();
    if (await registerVoter(voterAddress)) {
      setVoterAddress('');
    }
  };
  
  // Gestion de la réinitialisation du vote
  const handleResetVoting = async () => {
    setIsResetting(true);
    await resetVoting();
    setIsResetting(false);
  };
  
  // Palette de couleurs du projet
  const colors = {
    lighter: '#FFF2F2',
    light: '#A9B5DF',
    medium: '#7886C7',
    dark: '#2D336B'
  };
  
  // Labels pour les étapes du workflow
  const workflowLabels = [
    "Enregistrement des votants",
    "Enregistrement des propositions",
    "Fin de l'enregistrement des propositions",
    "Session de vote en cours",
    "Session de vote terminée",
    "Votes comptabilisés"
  ];

  // Configuration des actions pour chaque statut
  const workflowActions = [
    {
      status: 0,
      action: startProposalsRegistration,
      label: "Démarrer l'enregistrement des propositions",
      color: colors.medium,
      method: "startProposalsRegistering"
    },
    {
      status: 1,
      action: endProposalsRegistration,
      label: "Terminer l'enregistrement des propositions",
      color: colors.medium,
      method: "endProposalsRegistering"
    },
    {
      status: 2,
      action: startVotingSession,
      label: "Démarrer la session de vote",
      color: colors.medium,
      method: "startVotingSession"
    },
    {
      status: 3,
      action: endVotingSession,
      label: "Terminer la session de vote",
      color: colors.medium,
      method: "endVotingSession"
    },
    {
      status: 4,
      action: tallyVotes,
      label: "Comptabiliser les votes",
      color: colors.medium,
      method: "tallyVotes"
    }
  ];

  // Action pour l'étape courante
  const currentAction = workflowActions.find(action => action.status === workflowStatus);

  // Obtenir une couleur pour l'étape actuelle
  const getStatusColor = () => {
    if (workflowStatus === 5) return colors.dark;
    return currentAction?.color || colors.dark;
  };

  return (
    <Card
      elevation={3}
      sx={{
        overflow: 'visible',
        borderRadius: 3, 
        mb: 4,
        position: 'relative',
        background: `linear-gradient(to bottom, ${colors.lighter}, ${colors.light})`
      }}
    >
      {/* Bannière supérieure colorée */}
      <Box 
        sx={{ 
          height: 12, 
          width: '100%', 
          bgcolor: getStatusColor(),
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }} 
      />

      {/* Messages d'alerte */}
      <Box sx={{ p: 3, pt: 4 }}>
        <AlertMessage 
          message={voterError || adminError} 
          severity="error" 
          onClose={() => {
            clearVoterMessages();
            clearAdminMessages();
          }} 
        />
        <AlertMessage 
          message={voterSuccess || adminSuccess} 
          severity="success" 
          onClose={() => {
            clearVoterMessages();
            clearAdminMessages();
          }} 
        />

        {/* Titre avec statut et action principale */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            width: { xs: '100%', sm: 'auto' }
          }}>
            <Avatar 
              sx={{ 
                bgcolor: alpha(getStatusColor(), 0.1), 
                color: getStatusColor(),
                mr: 2,
                width: 50,
                height: 50,
                boxShadow: `0 2px 8px ${alpha(colors.dark, 0.2)}`
              }}
            >
              <AdminPanelSettingsIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold" color={colors.dark}>
                Administration
              </Typography>
              <Typography variant="subtitle2" color={colors.medium}>
                {workflowStatus < 5 ? 'Gestion du processus de vote' : 'Vote terminé'}
              </Typography>
            </Box>
          </Box>
          
          {/* Dev Mode Indicator */}
          {devMode && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={<CodeIcon />}
                label={`Contract Status: ${workflowStatus}`}
                size="small"
                sx={{ 
                  bgcolor: alpha(colors.dark, 0.1),
                  color: colors.dark,
                  '& .MuiChip-icon': {
                    color: colors.dark
                  }
                }}
              />
              <IconButton
                size="small"
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                sx={{ 
                  color: colors.dark,
                  bgcolor: showDebugInfo ? alpha(colors.dark, 0.1) : 'transparent'
                }}
              >
                <CodeIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          
          {/* Action principale à droite du titre */}
          {currentAction && workflowStatus < 5 ? (
            <Box sx={{ width: { xs: '100%', sm: 'auto' }, position: 'relative' }}>
              <Tooltip title={devMode ? `Method: ${currentAction.method}` : ''}>
                <Button
                  variant="contained"
                  onClick={currentAction.action}
                  disabled={adminLoading || (workflowStatus === 0 && registeredVoters.length < 2)}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    py: 1.2,
                    px: 3,
                    textTransform: 'none',
                    bgcolor: colors.dark,
                    '&:hover': {
                      bgcolor: alpha(colors.dark, 0.9)
                    },
                    borderRadius: 2,
                    boxShadow: `0 4px 14px ${alpha(colors.dark, 0.4)}`,
                    color: colors.lighter,
                    width: '100%'
                  }}
                >
                  {adminLoading ? (
                    <CircularProgress size={22} sx={{ color: colors.lighter }} />
                  ) : (
                    currentAction.label
                  )}
                </Button>
              </Tooltip>
              {workflowStatus === 0 && registeredVoters.length < 2 && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    textAlign: 'center', 
                    mt: 1, 
                    color: alpha(colors.dark, 0.7),
                    fontSize: '0.75rem'
                  }}
                >
                  Il faut au moins 2 votants pour démarrer
                </Typography>
              )}
            </Box>
          ) : (
            <Chip 
              label={workflowLabels[workflowStatus]} 
              sx={{ 
                fontSize: '0.9rem', 
                fontWeight: 'medium',
                py: 2.5,
                bgcolor: colors.dark,
                color: colors.lighter,
                boxShadow: `0 2px 5px ${alpha(colors.dark, 0.3)}`,
                '& .MuiChip-label': {
                  px: 2
                },
                width: { xs: '100%', sm: 'auto' }
              }}
            />
          )}
        </Box>

        {/* Debug Information */}
        {devMode && showDebugInfo && (
          <Collapse in={showDebugInfo}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                bgcolor: alpha(colors.dark, 0.05),
                border: `1px solid ${alpha(colors.dark, 0.1)}`,
                borderRadius: 2
              }}
            >
              <Typography variant="subtitle2" gutterBottom color={colors.dark}>
                Debug Information
              </Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1,
                  bgcolor: alpha(colors.dark, 0.03),
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}
              >
                {JSON.stringify({
                  contract: contract ? {
                    address: contract._address,
                    network: contract._network,
                  } : null,
                  workflowStatus,
                  registeredVoters: registeredVoters.length,
                  currentAction: currentAction?.method || null,
                }, null, 2)}
              </Box>
            </Paper>
          </Collapse>
        )}

        {/* Section des votants */}
        <Box sx={{ width: '100%', maxWidth: workflowStatus === 0 ? 'none' : 600, mx: 'auto' }}>
          {workflowStatus === 0 ? (
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 3,
                border: '1px solid',
                borderColor: colors.light,
                bgcolor: colors.lighter
              }}
            >
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: colors.dark }}>
                Enregistrer un votant
              </Typography>
              
              <form onSubmit={handleAddVoter}>
                <TextField
                  fullWidth
                  size="small"
                  label="Adresse Ethereum"
                  variant="outlined"
                  value={voterAddress}
                  onChange={(e) => setVoterAddress(e.target.value)}
                  placeholder="0x..."
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    },
                    '& .MuiInputLabel-root': {
                      color: colors.medium
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.light
                    },
                    '& .MuiInputBase-input': {
                      color: colors.dark
                    }
                  }}
                  disabled={voterLoading}
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  disabled={voterLoading || workflowStatus !== 0}
                  sx={{
                    py: 0.8,
                    px: 3,
                    textTransform: 'none',
                    borderRadius: 2,
                    bgcolor: colors.dark,
                    color: colors.lighter,
                    '&:hover': {
                      bgcolor: alpha(colors.dark, 0.9)
                    },
                    boxShadow: `0 2px 8px ${alpha(colors.dark, 0.3)}`
                  }}
                >
                  {voterLoading ? <CircularProgress size={20} sx={{ color: colors.lighter }} /> : 'Ajouter'}
                </Button>
              </form>

              {registeredVoters.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color={colors.medium} sx={{ mb: 1.5 }}>
                    Votants enregistrés ({registeredVoters.length})
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      maxHeight: 220, 
                      overflowY: 'auto', 
                      pr: 1,
                      '&::-webkit-scrollbar': {
                        width: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: alpha(colors.medium, 0.3),
                        borderRadius: '10px',
                      }
                    }}
                  >
                    <Stack spacing={1}>
                      {registeredVoters.map((voter, index) => (
                        <Box 
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: colors.lighter,
                            border: '1px solid',
                            borderColor: alpha(colors.medium, 0.2)
                          }}
                        >
                          <Avatar 
                            sx={{ 
                              width: 30, 
                              height: 30, 
                              bgcolor: alpha(colors.medium, 0.2), 
                              color: colors.dark,
                              fontSize: '0.8rem',
                              mr: 1.5
                            }}
                          >
                            <AccountCircleIcon fontSize="small" />
                          </Avatar>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              flexGrow: 1,
                              fontFamily: 'monospace',
                              fontSize: '0.85rem',
                              color: colors.dark
                            }}
                          >
                            {voter.substring(0, 20)}...
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              )}
            </Paper>
          ) : (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 3,
                border: '1px solid',
                borderColor: colors.light,
                bgcolor: colors.lighter,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {workflowStatus === 5 ? (
                <>
                  <EmojiEventsIcon sx={{ color: colors.dark, fontSize: 40, mb: 2 }} />
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, textAlign: 'center', color: colors.dark }}>
                    Vote terminé
                  </Typography>
                  <Typography variant="body2" color={colors.medium} sx={{ mb: 4, textAlign: 'center' }}>
                    Les résultats sont disponibles pour tous les votants
                  </Typography>
                  
                  <Box sx={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'center',
                    position: 'relative',
                    mt: 2,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-20px',
                      left: '20%',
                      right: '20%',
                      height: '1px',
                      bgcolor: alpha(colors.medium, 0.3)
                    }
                  }}>
                    <Tooltip 
                      title={devMode ? "Method: resetVoting" : "Recommencer un nouveau vote"}
                      placement="top"
                      TransitionComponent={Fade}
                      TransitionProps={{ timeout: 600 }}
                      arrow
                    >
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<RestartAltIcon />}
                        onClick={handleResetVoting}
                        disabled={isResetting}
                        sx={{
                          px: 4,
                          py: 1.2,
                          borderRadius: 8,
                          textTransform: 'none',
                          bgcolor: colors.dark,
                          '&:hover': {
                            bgcolor: colors.medium
                          },
                          transition: 'all 0.3s ease',
                          boxShadow: `0 3px 10px ${alpha(colors.dark, 0.25)}`,
                          fontWeight: 'medium',
                          color: colors.lighter,
                          minWidth: '180px'
                        }}
                      >
                        {isResetting ? (
                          <>
                            <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                            Réinitialisation...
                          </>
                        ) : (
                          'Nouveau vote'
                        )}
                      </Button>
                    </Tooltip>
                  </Box>
                </>
              ) : (
                <>
                  <LockIcon sx={{ color: colors.medium, fontSize: 40, mb: 2 }} />
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, textAlign: 'center', color: colors.dark }}>
                    Votants enregistrés
                  </Typography>
                </>
              )}
              
              <Typography variant="body2" color={colors.medium} sx={{ mb: 3, textAlign: 'center' }}>
                {registeredVoters.length} participants
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {registeredVoters.slice(0, 8).map((voter, index) => (
                  <Tooltip
                    key={index}
                    title={devMode ? voter : ""}
                    placement="top"
                  >
                    <Chip 
                      size="small"
                      avatar={<Avatar sx={{ bgcolor: alpha(colors.medium, 0.2), color: colors.dark }}><AccountCircleIcon fontSize="small" /></Avatar>}
                      label={`${voter.substring(0, 6)}...`}
                      sx={{ 
                        fontSize: '0.75rem',
                        borderRadius: 1.5,
                        bgcolor: colors.lighter,
                        color: colors.dark,
                        border: `1px solid ${colors.light}`
                      }}
                    />
                  </Tooltip>
                ))}
                {registeredVoters.length > 8 && (
                  <Chip 
                    size="small"
                    label={`+${registeredVoters.length - 8}`}
                    sx={{ 
                      fontSize: '0.75rem',
                      bgcolor: colors.lighter,
                      color: colors.dark,
                      border: `1px solid ${colors.light}`
                    }}
                  />
                )}
              </Box>
            </Paper>
          )}
        </Box>

        {/* Section de soumission de propositions (visible uniquement pour admin étant aussi votant) */}
        {workflowStatus === 1 && isVoter && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mb: 2 
            }}>
              <HowToVoteIcon sx={{ color: colors.medium, mr: 1 }} />
              <Typography variant="h6" color={colors.dark} fontWeight="600">
                Espace Votant
              </Typography>
            </Box>
            
            <Typography variant="body2" color={colors.medium} sx={{ mb: 2 }}>
              En tant qu'administrateur-votant, vous pouvez également participer au vote. 
              <Box component="span" sx={{ display: 'block', color: '#f57c00', fontWeight: 'medium', mt: 1 }}>
                Note: Le contrat pourrait empêcher l'administrateur de soumettre des propositions. 
                Si vous rencontrez une erreur, utilisez un autre compte enregistré comme votant.
              </Box>
            </Typography>
            
            <ProposalSubmission />
          </Box>
        )}
      </Box>
    </Card>
  );
}

export default AdminPanel;
