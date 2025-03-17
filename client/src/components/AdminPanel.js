import React, { useState } from 'react';

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
        throw new Error("Hé, ça c'est pas une adresse Ethereum valide!");
      }

      // On appelle la fonction registerVoter du contrat intelligent
      // C'est ici que la transaction est envoyée à la blockchain
      await contract.methods.registerVoter(voterAddress).send({ from: accounts[0] });
      
      // Si on arrive ici, c'est que ça a marché!
      setSuccess(`Super! Votant ${voterAddress} ajouté à la whitelist`);
      setVoterAddress(''); // On vide le champ pour faciliter l'ajout d'une nouvelle adresse
      
      // On rafraîchit les données pour voir les changements
      await refreshContractData();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du votant :", error);
      setError(error.message || "Oups, quelque chose a foiré pendant l'enregistrement du votant");
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
      setSuccess("C'est parti! Les votants peuvent maintenant soumettre leurs propositions");
      
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
      setSuccess("Fini les propositions! On se prépare pour le vote");
      
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
      setSuccess("Que le vote commence! Les votants peuvent maintenant choisir leur proposition préférée");
      
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
      setSuccess("Les votes sont terminés! Plus personne ne peut voter maintenant");
      
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
      setSuccess("Votes comptabilisés! Vous pouvez maintenant voir le résultat");
      
      await refreshContractData();
    } catch (error) {
      console.error("Erreur lors de la comptabilisation des votes :", error);
      setError(error.message || "Impossible de comptabiliser les votes");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-panel card">
      <h2>Panneau d'administration</h2>
      
      {/* Affichage des messages d'erreur ou de succès */}
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      {/* Formulaire d'ajout de votant (uniquement en phase 0) */}
      {workflowStatus === 0 && (
        <div className="section">
          <h3>Enregistrer un votant</h3>
          <form onSubmit={registerVoter}>
            <div className="form-group">
              <label htmlFor="voterAddress">Adresse Ethereum :</label>
              <input
                type="text"
                id="voterAddress"
                value={voterAddress}
                onChange={(e) => setVoterAddress(e.target.value)}
                className="form-control"
                placeholder="0x..."
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Traitement en cours..." : "Enregistrer le votant"}
            </button>
          </form>
        </div>
      )}
      
      {/* Boutons pour changer de phase - chaque bouton n'apparaît que quand c'est pertinent */}
      <div className="workflow-controls">
        <h3>Gestion du workflow</h3>
        
        {/* Bouton pour démarrer l'enregistrement des propositions */}
        {workflowStatus === 0 && (
          <button
            onClick={startProposalsRegistration}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Traitement en cours..." : "Démarrer l'enregistrement des propositions"}
          </button>
        )}
        
        {/* Bouton pour terminer l'enregistrement des propositions */}
        {workflowStatus === 1 && (
          <button
            onClick={endProposalsRegistration}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Traitement en cours..." : "Terminer l'enregistrement des propositions"}
          </button>
        )}
        
        {/* Bouton pour démarrer la session de vote */}
        {workflowStatus === 2 && (
          <button
            onClick={startVotingSession}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Traitement en cours..." : "Démarrer la session de vote"}
          </button>
        )}
        
        {/* Bouton pour terminer la session de vote */}
        {workflowStatus === 3 && (
          <button
            onClick={endVotingSession}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Traitement en cours..." : "Terminer la session de vote"}
          </button>
        )}
        
        {/* Bouton pour comptabiliser les votes */}
        {workflowStatus === 4 && (
          <button
            onClick={tallyVotes}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Traitement en cours..." : "Comptabiliser les votes"}
          </button>
        )}
      </div>
    </div>
  );
}

export default AdminPanel; 