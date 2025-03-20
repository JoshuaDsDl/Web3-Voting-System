import React, { useEffect } from 'react';
import { Box, Typography, Button, Chip, Avatar, Alert, CircularProgress, Container, Paper, IconButton, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import CodeIcon from '@mui/icons-material/Code';
import './App.css';

import useWeb3Store from './store/web3Store';
import AdminPanel from './components/AdminPanel';
import VoterPanel from './components/VoterPanel';
import Footer from './components/Footer';
import WorkflowTimeline from './components/WorkflowTimeline';

// Palette de couleurs du projet
const colors = {
  lighter: '#FFF2F2',
  light: '#A9B5DF',
  medium: '#7886C7',
  dark: '#2D336B'
};

/**
 * Composant principal de l'application de vote décentralisé
 */
function App() {
  // États depuis le store Web3
  const { 
    web3, 
    accounts, 
    isOwner, 
    isVoter, 
    workflowStatus, 
    error,
    devMode,
    initWeb3, 
    connectAccounts,
    clearError,
    toggleDevMode,
    contract
  } = useWeb3Store();

  // Initialisation de l'application
  useEffect(() => {
    const initialize = async () => {
      await initWeb3();
      
      // Après l'initialisation de Web3, charger l'état du votant si connecté
      const { accounts, isVoter } = useWeb3Store.getState();
      if (accounts.length > 0 && isVoter) {
        const { loadVoterState } = await import('./store/votingStore').then(m => m.default.getState());
        loadVoterState();
      }
    };
    
    initialize();
  }, []);

  return (
    <div className="App">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper 
          elevation={4} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2, 
            textAlign: 'center',
            background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.medium} 100%)`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
            <Tooltip title={devMode ? "Désactiver le mode développeur" : "Activer le mode développeur"}>
              <IconButton
                onClick={toggleDevMode}
                sx={{ 
                  color: devMode ? colors.lighter : alpha(colors.lighter, 0.6),
                  bgcolor: devMode ? alpha(colors.lighter, 0.1) : 'transparent',
                  '&:hover': {
                    bgcolor: alpha(colors.lighter, 0.2)
                  }
                }}
              >
                <DeveloperModeIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              right: 0, 
              left: 0, 
              bottom: 0, 
              opacity: 0.05,
              backgroundImage: `radial-gradient(${colors.lighter} 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}
          />
          <Typography 
            variant="h4" 
            className="title" 
            sx={{ 
              fontWeight: 700, 
              color: colors.lighter, 
              mb: accounts.length > 0 ? 2 : 0,
              position: 'relative',
              textShadow: '0 2px 4px rgba(0,0,0,0.15)'
            }}
          >
            Bienvenue sur VoteChain
          </Typography>
          
          {devMode && accounts.length > 0 && contract && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Chip
                icon={<CodeIcon sx={{ color: alpha(colors.lighter, 0.8) }} />}
                label={`Contrat: ${contract._address}`}
                variant="outlined"
                sx={{
                  color: alpha(colors.lighter, 0.8),
                  borderColor: alpha(colors.lighter, 0.3),
                  '& .MuiChip-icon': {
                    color: alpha(colors.lighter, 0.8)
                  }
                }}
              />
            </Box>
          )}

          {accounts.length > 0 && !error && (
            <Chip
              avatar={<Avatar sx={{ background: 'rgba(255,255,255,0.2)' }}><AccountBalanceWalletIcon fontSize="small" /></Avatar>}
              label={`${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`}
              variant="outlined"
              sx={{
                color: colors.lighter,
                borderColor: colors.lighter,
                py: 1,
                px: 1,
                '& .MuiChip-avatar': {
                  color: colors.lighter,
                  bgcolor: 'rgba(255,255,255,0.1)'
                },
                '& .MuiChip-label': {
                  fontSize: '0.9rem'
                }
              }}
            />
          )}
        </Paper>
        
        <div className="content">
          {error ? (
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
              <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: 2,
                    py: 4,
                    position: 'relative'
              }}>
                <Box sx={{
                  width: 80,
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: colors.medium,
                  borderRadius: '50%'
                }}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 40, color: colors.lighter }} />
                </Box>
                <Alert 
                  severity="error"
                  onClose={error === "Veuillez installer MetaMask pour utiliser cette application." || error.includes("Le contrat de vote n'est pas déployé") ? undefined : clearError}
                  sx={{
                    width: '100%',
                    maxWidth: 500,
                    '& .MuiAlert-message': {
                      fontSize: '1.1rem',
                      textAlign: 'center',
                      width: '100%'
                    },
                    ...((error === "Veuillez installer MetaMask pour utiliser cette application." || error.includes("Le contrat de vote n'est pas déployé")) && {
                      py: 2,
                      border: `2px solid ${colors.dark}`,
                      '& .MuiAlert-icon': {
                        fontSize: '1.5rem',
                        color: colors.dark
                      },
                      '& .MuiAlert-message': {
                        color: colors.dark
                      },
                      bgcolor: alpha(colors.light, 0.2)
                    })
                  }}
                >
                  {error === "Veuillez installer MetaMask pour utiliser cette application." ? (
                    <>
                      {error}
                      {devMode && (
                        <Box sx={{ 
                          position: 'absolute',
                          top: -10,
                          right: -10,
                          bgcolor: colors.dark,
                          color: colors.lighter,
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.8rem',
                          zIndex: 1
                        }}>
                          Mode Dev
                        </Box>
                      )}
                      <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                        Cette application nécessite l'extension MetaMask pour fonctionner.
                        <Box component="a" href="https://metamask.io/download/" target="_blank" rel="noopener" sx={{ display: 'block', mt: 1, color: colors.medium, textDecoration: 'none', fontWeight: 'bold', '&:hover': { textDecoration: 'underline', color: colors.dark } }}>
                          → Télécharger MetaMask
                        </Box>
                      </Typography>
                    </>
                  ) : error.includes("Le contrat de vote n'est pas déployé") ? (
                    <>
                      {error}
                      <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                        Cette application nécessite que le contrat soit déployé correctement sur la blockchain.
                        <Box sx={{ display: 'block', mt: 1, color: colors.medium, fontWeight: 'bold' }}>
                          → Vérifiez que le nœud Hardhat est en cours d'exécution et que le contrat a été déployé avec Hardhat
                        </Box>
                      </Typography>
                    </>
                  ) : (
                    error
                  )}
                </Alert>
              </Box>
            </Paper>
          ) : !web3 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <CircularProgress />
            </Box>
          ) : accounts.length === 0 ? (
            <Paper elevation={3} sx={{ p: 5, borderRadius: 2, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              <Button
                variant="contained"
                onClick={connectAccounts}
                startIcon={<AccountBalanceWalletIcon />}
                size="large"
                sx={{
                  bgcolor: colors.dark,
                  color: colors.lighter,
                  '&:hover': {
                    bgcolor: colors.medium
                  },
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  '&:active': {
                    transform: 'translateY(1px)'
                  }
                }}
              >
                Connecter MetaMask
              </Button>
            </Paper>
          ) : (
            <>
              {(isOwner || isVoter) && (
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ mb: 4 }}>
                    <WorkflowTimeline />
                  </Box>
                  
                  {isOwner ? <AdminPanel /> : isVoter && <VoterPanel />}
                </Box>
              )}
              
              {!isOwner && !isVoter && (
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: 2,
                    py: 4
                  }}>
                    <Alert 
                      severity="info"
                      sx={{
                        width: '100%',
                        maxWidth: 500,
                        '& .MuiAlert-message': {
                          fontSize: '1.1rem',
                          textAlign: 'center',
                          width: '100%'
                        }
                      }}
                    >
                      Vous n'êtes pas enregistré comme votant ou administrateur pour cette session de vote.
                    </Alert>
                  </Box>
                </Paper>
              )}
            </>
          )}
        </div>
      </Container>
      
      <Footer />
    </div>
  );
}

export default App;
