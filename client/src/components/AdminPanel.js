import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Alert, Divider, Collapse } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import HowToVoteIcon from '@mui/icons-material/HowToVote';

/**
 * Panneau d'administration réservé au boss 
 * Ici le proprio du contrat peut gérer tout le processus de vote
 */
function AdminPanel({ web3, accounts, contract, workflowStatus, refreshContractData }) {
  // Les états locaux pour gérer le formulaire et les messages
  const [voterAddress, setVoterAddress] = useState(''); // Adresse qu'on veut ajouter comme votant
  const [error, setError] = useState('');               // Message d'erreur à afficher
  const [success, setSuccess] = useState('');           // Message de succès à afficher
  const [isLoading, setIsLoading] = useState(false);    // Pour savoir si une transaction est en cours
  const [registeredVoters, setRegisteredVoters] = useState([]);

  // Timer pour effacer les messages après 5 secondes
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Charger les votants enregistrés
  useEffect(() => {
    const loadRegisteredVoters = async () => {
      try {
        const events = await contract.getPastEvents('VoterRegistered', {
          fromBlock: 0,
          toBlock: 'latest'
        });
        const voters = events.map(event => event.returnValues.voterAddress);
        setRegisteredVoters(voters);
      } catch (error) {
        console.error("Erreur lors du chargement des votants:", error);
      }
    };

    if (contract) {
      loadRegisteredVoters();
    }
  }, [contract]);

  /**
   * Ajoute une adresse à la whitelist des votants autorisés
   * Seul l'admin peut faire ça pendant la phase d'enregistrement
   */
  const registerVoter = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await contract.methods.registerVoter(voterAddress).send({ from: accounts[0] });
      setSuccess("Le votant a été enregistré avec succès");
      setVoterAddress('');
      
      // Mettre à jour la liste des votants
      const events = await contract.getPastEvents('VoterRegistered', {
        fromBlock: 0,
        toBlock: 'latest'
      });
      const voters = events.map(event => event.returnValues.voterAddress);
      setRegisteredVoters(voters);
      
      await refreshContractData();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du votant :", error);
      setError(error.message || "Impossible d'enregistrer le votant");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Démarre la phase où les votants peuvent soumettre leurs propositions
   * C'est la transition de l'étape 0 à l'étape 1
   */
  const startProposalsRegistration = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (registeredVoters.length < 2) {
        throw new Error("Il faut au moins 2 votants pour démarrer les propositions!");
      }
      // On appelle la fonction du contrat pour passer à l'étape suivante
      await contract.methods.startProposalsRegistration().send({ from: accounts[0] });
      setSuccess("La phase d'enregistrement des propositions a débuté");
      
      // On met à jour l'interface pour refléter le nouveau statut
      await refreshContractData();
    } catch (error) {
      console.error("Erreur lors du lancement de l'enregistrement des propositions :", error);
      setError(error.message || "Impossible de démarrer la phase d'enregistrement des propositions");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Termine la phase d'enregistrement des propositions
   * Après ça, plus personne ne peut soumettre de nouvelle idée
   */
  const endProposalsRegistration = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // On appelle la fonction du contrat pour terminer cette phase
      await contract.methods.endProposalsRegistration().send({ from: accounts[0] });
      setSuccess("La phase d'enregistrement des propositions est terminée");
      
      await refreshContractData();
    } catch (error) {
      console.error("Erreur lors de la fin de l'enregistrement des propositions :", error);
      setError(error.message || "Impossible de terminer la phase d'enregistrement des propositions");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Commence la phase de vote où les votants peuvent voter pour leur proposition préférée
   * C'est la transition de l'étape 2 à l'étape 3
   */
  const startVotingSession = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // On appelle la fonction du contrat pour démarrer le vote
      await contract.methods.startVotingSession().send({ from: accounts[0] });
      setSuccess("La session de vote est maintenant ouverte");
      
      await refreshContractData();
    } catch (error) {
      console.error("Erreur lors du démarrage de la session de vote :", error);
      setError(error.message || "Impossible de démarrer la session de vote");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Termine la phase de vote
   * Après ça, plus personne ne peut voter
   */
  const endVotingSession = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // On appelle la fonction du contrat pour terminer le vote
      await contract.methods.endVotingSession().send({ from: accounts[0] });
      setSuccess("La session de vote est maintenant terminée");
      
      await refreshContractData();
    } catch (error) {
      console.error("Erreur lors de la fin de la session de vote :", error);
      setError(error.message || "Impossible de terminer la session de vote");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Compte les votes et détermine la proposition gagnante
   * C'est la dernière étape du processus
   */
  const tallyVotes = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // On appelle la fonction du contrat pour comptabiliser les votes
      await contract.methods.tallyVotes().send({ from: accounts[0] });
      setSuccess("Les votes ont été comptabilisés avec succès");
      
      await refreshContractData();
    } catch (error) {
      console.error("Erreur lors de la comptabilisation des votes :", error);
      setError(error.message || "Impossible de comptabiliser les votes");
    } finally {
      setIsLoading(false);
    }
  };

  const resetVotingProcess = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await contract.methods.resetVoting().send({ from: accounts[0] });
      setSuccess("Le processus de vote a été réinitialisé");
      await refreshContractData();
    } catch (error) {
      console.error("Erreur lors de la réinitialisation :", error);
      setError(error.message || "Impossible de réinitialiser le vote");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 2, borderRadius: 2, bgcolor: '#ffffff' }}>
      {/* En-tête du panneau */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
        pb: 2,
        borderBottom: '2px solid #e0e0e0'
      }}>
        <AdminPanelSettingsIcon sx={{ fontSize: 28, mr: 1.5, color: '#3f51b5' }} />
        <Typography variant="h5" component="h2" sx={{ 
          color: '#3f51b5', 
          fontWeight: 600,
          letterSpacing: '-0.5px'
        }}>
          Panneau d'administration
        </Typography>
      </Box>
      
      {/* Messages d'alerte */}
      <Box sx={{ mb: 3 }}>
        <Collapse in={!!error} timeout={500}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: error && success ? 1 : 0,
              '& .MuiAlert-message': { fontSize: '0.95rem' }
            }}
          >
            {error}
          </Alert>
        </Collapse>
        <Collapse in={!!success} timeout={500}>
          <Alert 
            severity="success" 
            sx={{ 
              '& .MuiAlert-message': { fontSize: '0.95rem' }
            }}
          >
            {success}
          </Alert>
        </Collapse>
      </Box>
      
      {/* Liste des votants */}
      {workflowStatus === 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ 
            mb: 2,
            color: '#2c3e50',
            fontSize: '1.1rem',
            fontWeight: 600
          }}>
            Votants enregistrés ({registeredVoters.length})
          </Typography>
          <Box sx={{ 
            maxHeight: '200px', 
            overflowY: 'auto', 
            bgcolor: '#f8f9fa',
            p: 2.5, 
            borderRadius: 2,
            border: '1px solid #e0e0e0'
          }}>
            {registeredVoters.map((voter, index) => (
              <Typography key={index} sx={{ 
                mb: 1.5,
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                color: '#2c3e50',
                p: 1,
                bgcolor: '#ffffff',
                borderRadius: 1,
                border: '1px solid #e8e8e8'
              }}>
                {voter}
              </Typography>
            ))}
            {registeredVoters.length === 0 && (
              <Typography sx={{ 
                color: '#666',
                fontStyle: 'italic'
              }}>
                Aucun votant enregistré
              </Typography>
            )}
          </Box>
        </Box>
      )}
      
      {/* Formulaire d'ajout de votant */}
      {workflowStatus === 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ 
            mb: 2,
            color: '#2c3e50',
            fontSize: '1.1rem',
            fontWeight: 600
          }}>
            Enregistrer un votant
          </Typography>
          <form onSubmit={registerVoter}>
            <TextField
              fullWidth
              size="small"
              label="Adresse Ethereum"
              value={voterAddress}
              onChange={(e) => setVoterAddress(e.target.value)}
              placeholder="0x..."
              required
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={<HowToVoteIcon />}
              sx={{
                bgcolor: '#3f51b5',
                '&:hover': { bgcolor: '#303f9f' },
                borderRadius: 1.5,
                textTransform: 'none',
                px: 3
              }}
            >
              {isLoading ? "Traitement en cours..." : "Enregistrer le votant"}
            </Button>
          </form>
        </Box>
      )}
      
      <Divider sx={{ my: 3 }} />
      
      {/* Section workflow */}
      <Box>
        <Typography variant="h6" sx={{ 
          mb: 3,
          color: '#2c3e50',
          fontSize: '1.1rem',
          fontWeight: 600
        }}>
          Gestion du workflow
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2
        }}>
          {workflowStatus === 0 && (
            <Button
              onClick={startProposalsRegistration}
              variant="contained"
              disabled={isLoading}
              sx={{
                bgcolor: '#3f51b5',
                '&:hover': { bgcolor: '#303f9f' },
                borderRadius: 1.5,
                py: 1.2,
                textTransform: 'none',
                fontSize: '0.95rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {isLoading ? "Traitement en cours..." : "Démarrer l'enregistrement des propositions"}
            </Button>
          )}
          
          {workflowStatus === 1 && (
            <Button
              onClick={endProposalsRegistration}
              variant="contained"
              disabled={isLoading}
              sx={{
                bgcolor: '#3f51b5',
                '&:hover': { bgcolor: '#303f9f' },
                borderRadius: 1.5,
                py: 1.2,
                textTransform: 'none',
                fontSize: '0.95rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {isLoading ? "Traitement en cours..." : "Terminer l'enregistrement des propositions"}
            </Button>
          )}
          
          {workflowStatus === 2 && (
            <Button
              onClick={startVotingSession}
              variant="contained"
              disabled={isLoading}
              sx={{
                bgcolor: '#3f51b5',
                '&:hover': { bgcolor: '#303f9f' },
                borderRadius: 1.5,
                py: 1.2,
                textTransform: 'none',
                fontSize: '0.95rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {isLoading ? "Traitement en cours..." : "Démarrer la session de vote"}
            </Button>
          )}
          
          {workflowStatus === 3 && (
            <Button
              onClick={endVotingSession}
              variant="contained"
              disabled={isLoading}
              sx={{
                bgcolor: '#3f51b5',
                '&:hover': { bgcolor: '#303f9f' },
                borderRadius: 1.5,
                py: 1.2,
                textTransform: 'none',
                fontSize: '0.95rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {isLoading ? "Traitement en cours..." : "Terminer la session de vote"}
            </Button>
          )}
          
          {workflowStatus === 4 && (
            <Button
              onClick={tallyVotes}
              variant="contained"
              disabled={isLoading}
              sx={{
                bgcolor: '#3f51b5',
                '&:hover': { bgcolor: '#303f9f' },
                borderRadius: 1.5,
                py: 1.2,
                textTransform: 'none',
                fontSize: '0.95rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {isLoading ? "Traitement en cours..." : "Comptabiliser les votes"}
            </Button>
          )}

          {workflowStatus === 5 && (
            <Button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}
              variant="contained"
              sx={{
                bgcolor: '#3f51b5',
                '&:hover': { bgcolor: '#303f9f' },
                borderRadius: 1.5,
                py: 1.2,
                textTransform: 'none',
                fontSize: '0.95rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Retour à l'accueil
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default AdminPanel; 