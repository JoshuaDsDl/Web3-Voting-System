import React, { useState } from 'react';

function AdminPanel({ web3, accounts, contract, workflowStatus, refreshContractData }) {
  const [voterAddress, setVoterAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour enregistrer un votant
  const registerVoter = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Vérification de l'adresse
      if (!web3.utils.isAddress(voterAddress)) {
        throw new Error("L'adresse Ethereum n'est pas valide");
      }

      // Appel de la fonction du contrat
      await contract.methods.registerVoter(voterAddress).send({ from: accounts[0] });
      
      setSuccess(`Votant ${voterAddress} enregistré avec succès`);
      setVoterAddress('');
      
      // Rafraîchir les données du contrat
      await refreshContractData();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du votant :", error);
      setError(error.message || "Une erreur est survenue lors de l'enregistrement du votant");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour passer à l'étape suivante du workflow
  const startProposalsRegistration = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await contract.methods.startProposalsRegistration().send({ from: accounts[0] });
      setSuccess("La phase d'enregistrement des propositions a commencé");
      
      // Rafraîchir les données du contrat
      await refreshContractData();
    } catch (error) {
      console.error("Erreur lors du démarrage de l'enregistrement des propositions :", error);
      setError(error.message || "Une erreur est survenue lors du démarrage de l'enregistrement des propositions");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour terminer l'enregistrement des propositions
  const endProposalsRegistration = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await contract.methods.endProposalsRegistration().send({ from: accounts[0] });
      setSuccess("La phase d'enregistrement des propositions est terminée");
      
      // Rafraîchir les données du contrat
      await refreshContractData();
    } catch (error) {
      console.error("Erreur lors de la fin de l'enregistrement des propositions :", error);
      setError(error.message || "Une erreur est survenue lors de la fin de l'enregistrement des propositions");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour démarrer la session de vote
  const startVotingSession = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await contract.methods.startVotingSession().send({ from: accounts[0] });
      setSuccess("La session de vote a commencé");
      
      // Rafraîchir les données du contrat
      await refreshContractData();
    } catch (error) {
      console.error("Erreur lors du démarrage de la session de vote :", error);
      setError(error.message || "Une erreur est survenue lors du démarrage de la session de vote");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour terminer la session de vote
  const endVotingSession = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await contract.methods.endVotingSession().send({ from: accounts[0] });
      setSuccess("La session de vote est terminée");
      
      // Rafraîchir les données du contrat
      await refreshContractData();
    } catch (error) {
      console.error("Erreur lors de la fin de la session de vote :", error);
      setError(error.message || "Une erreur est survenue lors de la fin de la session de vote");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour comptabiliser les votes
  const tallyVotes = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await contract.methods.tallyVotes().send({ from: accounts[0] });
      setSuccess("Les votes ont été comptabilisés");
      
      // Rafraîchir les données du contrat
      await refreshContractData();
    } catch (error) {
      console.error("Erreur lors de la comptabilisation des votes :", error);
      setError(error.message || "Une erreur est survenue lors de la comptabilisation des votes");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-panel card">
      <h2>Panneau d'administration</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      {/* Section d'enregistrement des votants */}
      {workflowStatus === 0 && (
        <div className="panel-section">
          <h3>Enregistrement des votants</h3>
          <form onSubmit={registerVoter}>
            <div className="form-group">
              <label htmlFor="voterAddress">Adresse du votant</label>
              <input
                type="text"
                id="voterAddress"
                className="input"
                value={voterAddress}
                onChange={(e) => setVoterAddress(e.target.value)}
                placeholder="0x..."
                required
              />
            </div>
            <button type="submit" className="btn" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Enregistrer le votant"}
            </button>
          </form>
          
          <div className="workflow-actions">
            <h3>Actions du workflow</h3>
            <button
              className="btn"
              onClick={startProposalsRegistration}
              disabled={isLoading}
            >
              Démarrer l'enregistrement des propositions
            </button>
          </div>
        </div>
      )}
      
      {/* Section d'enregistrement des propositions */}
      {workflowStatus === 1 && (
        <div className="panel-section">
          <h3>Phase d'enregistrement des propositions</h3>
          <p>Les votants peuvent maintenant soumettre leurs propositions.</p>
          
          <div className="workflow-actions">
            <h3>Actions du workflow</h3>
            <button
              className="btn"
              onClick={endProposalsRegistration}
              disabled={isLoading}
            >
              Terminer l'enregistrement des propositions
            </button>
          </div>
        </div>
      )}
      
      {/* Section de fin d'enregistrement des propositions */}
      {workflowStatus === 2 && (
        <div className="panel-section">
          <h3>Fin de l'enregistrement des propositions</h3>
          <p>L'enregistrement des propositions est terminé.</p>
          
          <div className="workflow-actions">
            <h3>Actions du workflow</h3>
            <button
              className="btn"
              onClick={startVotingSession}
              disabled={isLoading}
            >
              Démarrer la session de vote
            </button>
          </div>
        </div>
      )}
      
      {/* Section de vote */}
      {workflowStatus === 3 && (
        <div className="panel-section">
          <h3>Session de vote en cours</h3>
          <p>Les votants peuvent maintenant voter pour les propositions.</p>
          
          <div className="workflow-actions">
            <h3>Actions du workflow</h3>
            <button
              className="btn"
              onClick={endVotingSession}
              disabled={isLoading}
            >
              Terminer la session de vote
            </button>
          </div>
        </div>
      )}
      
      {/* Section de fin de vote */}
      {workflowStatus === 4 && (
        <div className="panel-section">
          <h3>Session de vote terminée</h3>
          <p>La session de vote est terminée. Vous pouvez maintenant comptabiliser les votes.</p>
          
          <div className="workflow-actions">
            <h3>Actions du workflow</h3>
            <button
              className="btn"
              onClick={tallyVotes}
              disabled={isLoading}
            >
              Comptabiliser les votes
            </button>
          </div>
        </div>
      )}
      
      {/* Section de résultats */}
      {workflowStatus === 5 && (
        <div className="panel-section">
          <h3>Votes comptabilisés</h3>
          <p>Les votes ont été comptabilisés. Vous pouvez consulter les résultats dans la section des résultats.</p>
        </div>
      )}
    </div>
  );
}

export default AdminPanel; 