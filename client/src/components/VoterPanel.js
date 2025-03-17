import React, { useState, useEffect } from 'react';

function VoterPanel({ web3, accounts, contract, workflowStatus, refreshContractData }) {
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposals, setProposals] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedProposalId, setVotedProposalId] = useState(null);
  const [winningProposal, setWinningProposal] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Charger les données du votant et les propositions
  useEffect(() => {
    const loadData = async () => {
      try {
        if (contract && accounts.length > 0) {
          // Récupérer les informations du votant
          const voter = await contract.methods.voters(accounts[0]).call();
          setHasVoted(voter.hasVoted);
          setVotedProposalId(voter.hasVoted ? parseInt(voter.votedProposalId) : null);
          
          // Récupérer les propositions
          await loadProposals();
          
          // Si les votes sont comptabilisés, récupérer la proposition gagnante
          if (workflowStatus === 5) {
            await loadWinningProposal();
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        setError("Une erreur est survenue lors du chargement des données");
      }
    };
    
    loadData();
  }, [contract, accounts, workflowStatus]);

  // Fonction pour charger les propositions
  const loadProposals = async () => {
    try {
      // Récupérer le nombre de propositions
      const count = await contract.methods.getProposalsCount().call();
      
      // Récupérer chaque proposition
      const proposalsArray = [];
      for (let i = 1; i <= count; i++) {
        const proposal = await contract.methods.proposals(i).call();
        proposalsArray.push({
          id: i,
          description: proposal.description,
          voteCount: parseInt(proposal.voteCount),
          proposer: proposal.proposer
        });
      }
      
      setProposals(proposalsArray);
    } catch (error) {
      console.error("Erreur lors du chargement des propositions :", error);
      setError("Une erreur est survenue lors du chargement des propositions");
    }
  };

  // Fonction pour charger la proposition gagnante
  const loadWinningProposal = async () => {
    try {
      const winningProposalData = await contract.methods.getWinningProposal().call();
      setWinningProposal({
        description: winningProposalData.description,
        voteCount: parseInt(winningProposalData.voteCount),
        proposer: winningProposalData.proposer
      });
    } catch (error) {
      console.error("Erreur lors du chargement de la proposition gagnante :", error);
      // Ne pas afficher d'erreur si les votes ne sont pas encore comptabilisés
      if (workflowStatus === 5) {
        setError("Une erreur est survenue lors du chargement de la proposition gagnante");
      }
    }
  };

  // Fonction pour soumettre une proposition
  const submitProposal = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Vérification de la description
      if (!proposalDescription.trim()) {
        throw new Error("La description de la proposition ne peut pas être vide");
      }

      // Appel de la fonction du contrat
      await contract.methods.registerProposal(proposalDescription).send({ from: accounts[0] });
      
      setSuccess("Proposition soumise avec succès");
      setProposalDescription('');
      
      // Recharger les propositions
      await loadProposals();
    } catch (error) {
      console.error("Erreur lors de la soumission de la proposition :", error);
      setError(error.message || "Une erreur est survenue lors de la soumission de la proposition");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour voter pour une proposition
  const voteForProposal = async (proposalId) => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Appel de la fonction du contrat
      await contract.methods.vote(proposalId).send({ from: accounts[0] });
      
      setSuccess(`Vote pour la proposition #${proposalId} enregistré avec succès`);
      setHasVoted(true);
      setVotedProposalId(proposalId);
      
      // Recharger les propositions pour mettre à jour les compteurs de votes
      await loadProposals();
      
      // Rafraîchir les données du contrat
      await refreshContractData();
    } catch (error) {
      console.error("Erreur lors du vote :", error);
      setError(error.message || "Une erreur est survenue lors du vote");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="voter-panel card">
      <h2>Panneau de votant</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      {/* Phase d'enregistrement des propositions */}
      {workflowStatus === 1 && (
        <div className="panel-section">
          <h3>Soumettre une proposition</h3>
          <form onSubmit={submitProposal}>
            <div className="form-group">
              <label htmlFor="proposalDescription">Description de la proposition</label>
              <textarea
                id="proposalDescription"
                className="input"
                value={proposalDescription}
                onChange={(e) => setProposalDescription(e.target.value)}
                placeholder="Décrivez votre proposition..."
                rows="4"
                required
              />
            </div>
            <button type="submit" className="btn" disabled={isLoading}>
              {isLoading ? "Soumission..." : "Soumettre la proposition"}
            </button>
          </form>
        </div>
      )}
      
      {/* Phase de vote */}
      {workflowStatus === 3 && !hasVoted && (
        <div className="panel-section">
          <h3>Voter pour une proposition</h3>
          <p>Sélectionnez une proposition pour laquelle voter :</p>
        </div>
      )}
      
      {/* Affichage du vote de l'utilisateur */}
      {hasVoted && votedProposalId && (
        <div className="panel-section">
          <h3>Votre vote</h3>
          <div className="alert alert-info">
            Vous avez voté pour la proposition #{votedProposalId} : 
            {proposals.find(p => p.id === votedProposalId)?.description || "Chargement..."}
          </div>
        </div>
      )}
      
      {/* Liste des propositions */}
      {proposals.length > 0 && (
        <div className="panel-section">
          <h3>Liste des propositions</h3>
          <div className="proposal-list">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="proposal-item">
                <div className="proposal-header">
                  <h4>Proposition #{proposal.id}</h4>
                  {workflowStatus >= 5 && (
                    <span className="vote-count">
                      {proposal.voteCount} vote{proposal.voteCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="proposal-description">{proposal.description}</div>
                <div className="proposal-meta">
                  Proposé par : {proposal.proposer.substring(0, 6)}...{proposal.proposer.substring(proposal.proposer.length - 4)}
                </div>
                
                {workflowStatus === 3 && !hasVoted && (
                  <button
                    className="btn vote-button"
                    onClick={() => voteForProposal(proposal.id)}
                    disabled={isLoading}
                  >
                    Voter pour cette proposition
                  </button>
                )}
                
                {workflowStatus >= 5 && winningProposal && proposal.description === winningProposal.description && (
                  <div className="winning-badge">Proposition gagnante 🏆</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Résultats du vote */}
      {workflowStatus === 5 && winningProposal && (
        <div className="panel-section">
          <h3>Résultat du vote</h3>
          <div className="alert alert-success">
            <h4>Proposition gagnante : {winningProposal.description}</h4>
            <p>Nombre de votes : {winningProposal.voteCount}</p>
            <p>Proposé par : {winningProposal.proposer.substring(0, 6)}...{winningProposal.proposer.substring(winningProposal.proposer.length - 4)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoterPanel; 