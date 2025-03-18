import { create } from 'zustand';
import useWeb3Store from './web3Store';

const useVotingStore = create((set, get) => ({
  // Propositions
  proposals: [],
  
  // État du votant
  hasVoted: false,
  votedProposalId: null,
  hasProposed: false,
  
  // Résultats
  winningProposal: null,
  
  // États UI
  isLoading: false,
  error: '',
  success: '',
  
  // Liste des votants enregistrés
  registeredVoters: [],
  
  // Charger toutes les propositions
  loadProposals: async () => {
    const { contract } = useWeb3Store.getState();
    set({ isLoading: true, error: '' });
    
    try {
      let proposalsArray = [];
      let i = 0;
      let hasMoreProposals = true;
      
      // On boucle pour récupérer toutes les propositions (pattern d'itérateur)
      while (hasMoreProposals) {
        try {
          const proposal = await contract.methods.proposals(i).call();
          proposalsArray.push({
            id: i,
            description: proposal.description,
            voteCount: parseInt(proposal.voteCount)
          });
          i++;
        } catch (error) {
          hasMoreProposals = false;
        }
      }
      
      set({ proposals: proposalsArray, isLoading: false });
      return proposalsArray;
    } catch (error) {
      console.error("Erreur lors du chargement des propositions:", error);
      set({ error: "Impossible de charger les propositions.", isLoading: false });
      return [];
    }
  },
  
  // Charger l'état du vote de l'utilisateur
  loadVoterState: async () => {
    const { contract, accounts } = useWeb3Store.getState();
    
    try {
      if (contract && accounts.length > 0) {
        console.log("Chargement de l'état du votant pour", accounts[0]);
        const voter = await contract.methods.voters(accounts[0]).call();
        console.log("État du votant récupéré:", voter);
        
        set({
          hasVoted: voter.hasVoted,
          hasProposed: voter.hasProposed,
          votedProposalId: voter.hasVoted ? parseInt(voter.votedProposalId) : null
        });
        
        console.log("État du votant mis à jour. hasProposed:", voter.hasProposed);
        return voter;
      } else {
        console.log("Impossible de charger l'état du votant: contrat ou compte non disponible");
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'état du votant:", error);
      set({ error: "Impossible de charger votre état de vote." });
    }
  },
  
  // Charger la proposition gagnante
  loadWinningProposal: async () => {
    const { contract } = useWeb3Store.getState();
    
    try {
      if (contract) {
        const winningProposalId = await contract.methods.winningProposalId().call();
        const proposal = await contract.methods.proposals(winningProposalId).call();
        
        set({
          winningProposal: {
            id: parseInt(winningProposalId),
            description: proposal.description,
            voteCount: parseInt(proposal.voteCount)
          }
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement du gagnant:", error);
      set({ error: "Impossible de charger les résultats." });
    }
  },
  
  // Soumettre une nouvelle proposition
  submitProposal: async (description) => {
    const { contract, accounts } = useWeb3Store.getState();
    set({ isLoading: true, error: '', success: '' });
    
    try {
      if (!description.trim()) {
        set({ error: "La proposition ne peut pas être vide.", isLoading: false });
        return false;
      }
      
      await contract.methods.registerProposal(description).send({ 
        from: accounts[0],
        gas: 500000,
        gasPrice: undefined
      });
      
      set({ success: "Proposition soumise avec succès!", isLoading: false, hasProposed: true });
      
      await get().loadProposals();
      return true;
    } catch (error) {
      console.error("Erreur lors de la soumission de la proposition:", error);
      
      let errorMessage = "Erreur lors de la soumission de la proposition.";
      
      if (error.message.includes("revert")) {
        errorMessage = "Action impossible dans l'état actuel du vote.";
      } else if (error.message.includes("gas")) {
        errorMessage = "Problème de gaz pour la transaction. Essayez d'augmenter la limite de gaz.";
      } else if (error.message.includes("Internal JSON-RPC error")) {
        // Vérifier si c'est l'administrateur qui essaie de soumettre une proposition
        const { accounts } = useWeb3Store.getState();
        const { isOwner } = useWeb3Store.getState();
        
        if (isOwner) {
          errorMessage = "En tant qu'administrateur, vous ne pouvez pas soumettre de proposition. Utilisez un autre compte enregistré comme votant.";
        } else {
          errorMessage = "Erreur RPC interne. Essayez de rafraîchir la page ou de redémarrer MetaMask.";
        }
      }
      
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },
  
  // Voter pour une proposition
  voteForProposal: async (proposalId) => {
    const { contract, accounts } = useWeb3Store.getState();
    set({ isLoading: true, error: '', success: '' });
    
    try {
      await contract.methods.vote(proposalId).send({ 
        from: accounts[0],
        gas: 500000,
        gasPrice: undefined
      });
      
      set({ 
        success: "Vote enregistré avec succès!",
        hasVoted: true,
        votedProposalId: proposalId,
        isLoading: false
      });
      
      await get().loadProposals();
      return true;
    } catch (error) {
      console.error("Erreur lors du vote:", error);
      
      let errorMessage = "Erreur lors du vote.";
      
      if (error.message.includes("revert")) {
        errorMessage = "Action impossible: vérifiez l'état du vote ou si vous avez déjà voté.";
      } else if (error.message.includes("gas")) {
        errorMessage = "Problème de gaz pour la transaction. Essayez d'augmenter la limite de gaz.";
      } else if (error.message.includes("Internal JSON-RPC error")) {
        errorMessage = "Erreur RPC interne. Essayez de rafraîchir la page ou de redémarrer MetaMask.";
      }
      
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },
  
  // Charger les votants enregistrés (pour l'admin)
  loadRegisteredVoters: async () => {
    const { contract } = useWeb3Store.getState();
    
    try {
      const events = await contract.getPastEvents('VoterRegistered', {
        fromBlock: 0,
        toBlock: 'latest'
      });
      const voters = events.map(event => event.returnValues.voterAddress);
      set({ registeredVoters: voters });
      return voters;
    } catch (error) {
      console.error("Erreur lors du chargement des votants:", error);
      set({ error: "Impossible de charger la liste des votants." });
      return [];
    }
  },
  
  // Réinitialiser complètement le store
  resetStore: () => {
    set({
      proposals: [],
      registeredVoters: [],
      isVoter: false,
      hasVoted: false,
      votedProposalId: null,
      isLoading: false,
      error: '',
      success: ''
    });
  },
  
  // Actions Admin
  registerVoter: async (address) => {
    const { contract, accounts } = useWeb3Store.getState();
    set({ isLoading: true, error: '', success: '' });
    
    try {
      if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
        set({ error: "Adresse Ethereum invalide.", isLoading: false });
        return false;
      }
      
      // Vérifier que l'adresse n'est pas celle de l'admin (owner)
      const owner = await contract.methods.owner().call();
      if (address.toLowerCase() === owner.toLowerCase()) {
        set({ error: "L'administrateur ne peut pas être enregistré comme votant.", isLoading: false });
        return false;
      }
      
      await contract.methods.registerVoter(address).send({ 
        from: accounts[0],
        gas: 500000,
        gasPrice: undefined
      });
      
      set({ success: "Votant enregistré avec succès!", isLoading: false });
      
      await get().loadRegisteredVoters();
      return true;
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du votant:", error);
      
      let errorMessage = "Erreur lors de l'enregistrement du votant.";
      
      if (error.message.includes("revert")) {
        errorMessage = "Action impossible: vérifiez l'état du vote ou si l'adresse est déjà enregistrée.";
      } else if (error.message.includes("gas")) {
        errorMessage = "Problème de gaz pour la transaction. Essayez d'augmenter la limite de gaz.";
      } else if (error.message.includes("Internal JSON-RPC error")) {
        errorMessage = "Erreur RPC interne. Essayez de rafraîchir la page ou de redémarrer MetaMask.";
      }
      
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },
  
  // Réinitialiser les messages
  clearMessages: () => set({ error: '', success: '' })
}));

export default useVotingStore; 