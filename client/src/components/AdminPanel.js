import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Alert, Divider } from '@mui/material';
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

  /**
   * Ajoute une adresse à la whitelist des votants autorisés
   * Seul l'admin peut faire ça pendant la phase d'enregistrement
   */
  const registerVoter = async (e) => {
    e.preventDefault();  // Empêche le rechargement de la page quand on soumet le formulaire
    // On réinitialise les messages précédents
    setError('');
    setSuccess('');
    setIsLoading(true);  // On indique qu'une opération est en cours

    try {
      // On vérifie que l'adresse a bien le bon format
      if (!web3.utils.isAddress(voterAddress)) {
        throw new Error("L'adresse Ethereum n'est pas valide");
      }

      // On appelle la fonction registerVoter du contrat intelligent
      // C'est ici que la transaction est envoyée à la blockchain
      await contract.methods.registerVoter(voterAddress).send({ from: accounts[0] });
      
      // Si on arrive ici, c'est que ça a marché!
      setSuccess(`Votant ${voterAddress} ajouté avec succès`);
      setVoterAddress(''); // On vide le champ pour faciliter l'ajout d'une nouvelle adresse
      
      // On rafraîchit les données pour voir les changements
      await refreshContractData();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du votant :", error);
      setError(error.message || "Erreur lors de l'enregistrement du votant");
    } finally {
      setIsLoading(false); // Dans tous les cas, on indique que l'opération est terminée
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

  return (
    <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AdminPanelSettingsIcon sx={{ fontSize: 32, mr: 2, color: '#3f51b5' }} />
        <Typography variant="h5" component="h2" sx={{ color: '#3f51b5', fontWeight: 600 }}>
          Panneau d'administration
        </Typography>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      
      {workflowStatus === 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
            Enregistrer un votant
          </Typography>
          <form onSubmit={registerVoter}>
            <TextField
              fullWidth
              label="Adresse Ethereum"
              value={voterAddress}
              onChange={(e) => setVoterAddress(e.target.value)}
              placeholder="0x..."
              required
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={<HowToVoteIcon />}
              sx={{
                bgcolor: '#3f51b5',
                '&:hover': { bgcolor: '#303f9f' }
              }}
            >
              {isLoading ? "Traitement en cours..." : "Enregistrer le votant"}
            </Button>
          </form>
        </Box>
      )}
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, color: '#666' }}>
          Gestion du workflow
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {workflowStatus === 0 && (
            <Button
              onClick={startProposalsRegistration}
              variant="contained"
              disabled={isLoading}
              sx={{
                bgcolor: '#3f51b5',
                '&:hover': { bgcolor: '#303f9f' }
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
                '&:hover': { bgcolor: '#303f9f' }
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
                '&:hover': { bgcolor: '#303f9f' }
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
                '&:hover': { bgcolor: '#303f9f' }
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
                '&:hover': { bgcolor: '#303f9f' }
              }}
            >
              {isLoading ? "Traitement en cours..." : "Comptabiliser les votes"}
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default AdminPanel; 