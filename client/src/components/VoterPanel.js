import React, { useState, useEffect } from 'react';

/**
 * Panneau pour les votants inscrits
 * Permet de soumettre des propositions et de voter
 */
function VoterPanel({ web3, accounts, contract, workflowStatus, refreshContractData }) {
  // États pour gérer les propositions et les votes
  const [proposalDescription, setProposalDescription] = useState(''); // Nouvelle proposition à soumettre
  const [proposals, setProposals] = useState([]);                      // Liste des propositions existantes
  const [hasVoted, setHasVoted] = useState(false);                     // Est-ce que l'utilisateur a déjà voté
  const [votedProposalId, setVotedProposalId] = useState(null);        // Pour quelle proposition a-t-il voté
  const [winningProposal, setWinningProposal] = useState(null);        // La proposition gagnante
  const [error, setError] = useState('');                             // Message d'erreur
  const [success, setSuccess] = useState('');                          // Message de succès
  const [isLoading, setIsLoading] = useState(false);                   // Pour suivre si une transaction est en cours

  /**
   * Ce hook se lance au chargement du composant et quand certaines données changent
   * Il récupère toutes les infos dont on a besoin: statut du votant, propositions, etc.
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        if (contract && accounts.length > 0) {
          // D'abord on check si l'utilisateur a déjà voté
          const voter = await contract.methods.voters(accounts[0]).call();
          setHasVoted(voter.hasVoted);
          setVotedProposalId(voter.hasVoted ? parseInt(voter.votedProposalId) : null);
          
          // Ensuite on récupère toutes les propositions soumises
          await loadProposals();
          
          // Si on est à la dernière étape, on récupère le résultat du vote
          if (workflowStatus === 5) {
            await loadWinningProposal();
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        setError("Oups! Impossible de charger tes données de vote");
      }
    };
    
    loadData();
  }, [contract, accounts, workflowStatus]); // Se relance quand ces valeurs changent

  /**
   * Fonction qui récupère toutes les propositions depuis le contrat
   * et les stocke dans l'état local
   */
  const loadProposals = async () => {
    try {
      // D'abord on demande combien de propositions existent
      const count = await contract.methods.getProposalsCount().call();
      
      // Puis on les récupère une par une
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
      setError("Impossible de récupérer les propositions. La blockchain fait sa difficile!");
    }
  };

  /**
   * Fonction qui récupère la proposition gagnante après comptage
   * Ne fonctionne que si on est à l'étape 5 (votes comptabilisés)
   */
  const loadWinningProposal = async () => {
    try {
      if (workflowStatus === 5) {
        // On appelle la fonction qui nous donne le gagnant
        const result = await contract.methods.getWinningProposal().call();
        
        setWinningProposal({
          description: result.description,
          voteCount: parseInt(result.voteCount),
          proposer: result.proposer
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la proposition gagnante :", error);
      setError("Impossible de récupérer le gagnant. Bizarre, bizarre...");
    }
  };

  /**
   * Fonction pour soumettre une nouvelle proposition
   * Ne fonctionne que pendant la phase d'enregistrement des propositions (étape 1)
   */
  const submitProposal = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // On vérifie que la description n'est pas vide
      if (!proposalDescription.trim()) {
        throw new Error("Hé, il faut écrire quelque chose quand même!");
      }

      // On envoie la proposition au contrat
      await contract.methods.registerProposal(proposalDescription).send({ from: accounts[0] });
      
      // Si tout va bien, on met à jour l'interface
      setSuccess("Ta proposition a été soumise avec succès. Bien joué!");
      setProposalDescription(''); // On vide le champ pour faciliter l'ajout d'une autre proposition
      
      // On recharge les propositions pour voir la nouvelle
      await loadProposals();
    } catch (error) {
      console.error("Erreur lors de la soumission de la proposition :", error);
      setError(error.message || "Impossible de soumettre ta proposition. T'as peut-être déjà proposé?");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fonction pour voter pour une proposition
   * Ne fonctionne que pendant la phase de vote (étape 3)
   */
  const voteForProposal = async (proposalId) => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // On envoie le vote au contrat
      await contract.methods.vote(proposalId).send({ from: accounts[0] });
      
      // Si tout va bien, on met à jour l'interface
      setSuccess("Ton vote a été enregistré! Merci de participer!");
      setHasVoted(true);
      setVotedProposalId(proposalId);
      
      // On recharge les propositions pour mettre à jour les compteurs
      await loadProposals();
      await refreshContractData();
    } catch (error) {
      console.error("Erreur lors du vote :", error);
      setError(error.message || "Impossible de voter. T'as peut-être déjà voté?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="voter-panel card">
      <h2>Espace Votant</h2>
      
      {/* Affichage des messages d'erreur ou de succès */}
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      {/* Formulaire de soumission de proposition (étape 1) */}
      {workflowStatus === 1 && (
        <div className="section">
          <h3>Soumettre une proposition</h3>
          <form onSubmit={submitProposal}>
            <div className="form-group">
              <label htmlFor="proposalDescription">Description :</label>
              <textarea
                id="proposalDescription"
                value={proposalDescription}
                onChange={(e) => setProposalDescription(e.target.value)}
                className="form-control"
                placeholder="Décris ton idée ici..."
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Soumission en cours..." : "Soumettre la proposition"}
            </button>
          </form>
        </div>
      )}
      
      {/* Liste des propositions (visible à toutes les étapes) */}
      {proposals.length > 0 && (
        <div className="section">
          <h3>Propositions</h3>
          <div className="proposals-list">
            {proposals.map((proposal) => (
              <div key={proposal.id} className={`proposal-card ${votedProposalId === proposal.id ? 'voted' : ''}`}>
                <div className="proposal-content">
                  <p className="proposal-description">{proposal.description}</p>
                  <p className="proposal-info">
                    Proposée par: {proposal.proposer === accounts[0] ? "Toi" : `${proposal.proposer.substring(0, 6)}...${proposal.proposer.substring(38)}`}
                  </p>
                  {(workflowStatus >= 5) && (
                    <p className="vote-count">Votes reçus: {proposal.voteCount}</p>
                  )}
                </div>
                
                {/* Bouton de vote (uniquement en phase de vote - étape 3) */}
                {workflowStatus === 3 && !hasVoted && (
                  <button
                    className="btn btn-vote"
                    onClick={() => voteForProposal(proposal.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? "..." : "Voter"}
                  </button>
                )}
                
                {/* Indication du vote de l'utilisateur */}
                {hasVoted && votedProposalId === proposal.id && (
                  <div className="voted-indicator">Tu as voté pour cette proposition</div>
                )}
                
                {/* Indication de la proposition gagnante */}
                {workflowStatus === 5 && winningProposal && winningProposal.description === proposal.description && (
                  <div className="winning-indicator">🏆 Proposition gagnante!</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Message si pas de propositions */}
      {proposals.length === 0 && workflowStatus >= 1 && (
        <div className="alert alert-info">
          Aucune proposition n'a encore été soumise.
          {workflowStatus === 1 && " Sois le premier à proposer quelque chose!"}
        </div>
      )}
      
      {/* Résultat du vote (étape 5) */}
      {workflowStatus === 5 && winningProposal && (
        <div className="section result-section">
          <h3>Résultat final du vote</h3>
          <div className="winning-proposal">
            <h4>🏆 Proposition gagnante</h4>
            <p className="proposal-description">{winningProposal.description}</p>
            <p className="vote-count">Nombre de votes: {winningProposal.voteCount}</p>
            <p className="proposer">
              Proposée par: {winningProposal.proposer === accounts[0] 
                ? "Toi (bravo!)" 
                : `${winningProposal.proposer.substring(0, 6)}...${winningProposal.proposer.substring(38)}`
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoterPanel; 