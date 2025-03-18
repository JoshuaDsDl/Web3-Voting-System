import { create } from 'zustand';
import useWeb3Store from './web3Store';

const useAdminStore = create((set) => ({
  // États UI
  isLoading: false,
  error: '',
  success: '',

  // Changer le statut du workflow
  startProposalsRegistration: async () => {
    const { contract, accounts, refreshContractData } = useWeb3Store.getState();
    set({ isLoading: true, error: '', success: '' });
    
    try {
      await contract.methods.startProposalsRegistration().send({ 
        from: accounts[0],
        gas: 500000,
        gasPrice: undefined
      });
      
      set({ success: "Phase d'enregistrement des propositions démarrée!", isLoading: false });
      refreshContractData();
      return true;
    } catch (error) {
      console.error("Erreur lors du démarrage de l'enregistrement des propositions:", error);
      
      let errorMessage = "Erreur lors du changement de phase.";
      
      if (error.message.includes("revert")) {
        errorMessage = "Action impossible dans l'état actuel du vote.";
      } else if (error.message.includes("gas")) {
        errorMessage = "Problème de gaz pour la transaction. Essayez d'augmenter la limite de gaz.";
      } else if (error.message.includes("Internal JSON-RPC error")) {
        errorMessage = "Erreur RPC interne. Essayez de rafraîchir la page ou de redémarrer MetaMask.";
      }
      
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },
  
  endProposalsRegistration: async () => {
    const { contract, accounts, refreshContractData } = useWeb3Store.getState();
    set({ isLoading: true, error: '', success: '' });
    
    try {
      await contract.methods.endProposalsRegistration().send({ 
        from: accounts[0],
        gas: 500000,
        gasPrice: undefined
      });
      
      set({ success: "Phase d'enregistrement des propositions terminée!", isLoading: false });
      refreshContractData();
      return true;
    } catch (error) {
      console.error("Erreur lors de la fin de l'enregistrement des propositions:", error);
      
      let errorMessage = "Erreur lors du changement de phase.";
      
      if (error.message.includes("revert")) {
        errorMessage = "Action impossible dans l'état actuel du vote.";
      } else if (error.message.includes("gas")) {
        errorMessage = "Problème de gaz pour la transaction. Essayez d'augmenter la limite de gaz.";
      } else if (error.message.includes("Internal JSON-RPC error")) {
        errorMessage = "Erreur RPC interne. Essayez de rafraîchir la page ou de redémarrer MetaMask.";
      }
      
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },
  
  startVotingSession: async () => {
    const { contract, accounts, refreshContractData } = useWeb3Store.getState();
    set({ isLoading: true, error: '', success: '' });
    
    try {
      await contract.methods.startVotingSession().send({ 
        from: accounts[0],
        gas: 500000,
        gasPrice: undefined
      });
      
      set({ success: "Session de vote démarrée!", isLoading: false });
      refreshContractData();
      return true;
    } catch (error) {
      console.error("Erreur lors du démarrage de la session de vote:", error);
      
      let errorMessage = "Erreur lors du changement de phase.";
      
      if (error.message.includes("revert")) {
        errorMessage = "Action impossible dans l'état actuel du vote.";
      } else if (error.message.includes("gas")) {
        errorMessage = "Problème de gaz pour la transaction. Essayez d'augmenter la limite de gaz.";
      } else if (error.message.includes("Internal JSON-RPC error")) {
        errorMessage = "Erreur RPC interne. Essayez de rafraîchir la page ou de redémarrer MetaMask.";
      }
      
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },
  
  endVotingSession: async () => {
    const { contract, accounts, refreshContractData } = useWeb3Store.getState();
    set({ isLoading: true, error: '', success: '' });
    
    try {
      await contract.methods.endVotingSession().send({ 
        from: accounts[0],
        gas: 500000,
        gasPrice: undefined
      });
      
      set({ success: "Session de vote terminée!", isLoading: false });
      refreshContractData();
      return true;
    } catch (error) {
      console.error("Erreur lors de la fin de la session de vote:", error);
      
      let errorMessage = "Erreur lors du changement de phase.";
      
      if (error.message.includes("revert")) {
        errorMessage = "Action impossible dans l'état actuel du vote.";
      } else if (error.message.includes("gas")) {
        errorMessage = "Problème de gaz pour la transaction. Essayez d'augmenter la limite de gaz.";
      } else if (error.message.includes("Internal JSON-RPC error")) {
        errorMessage = "Erreur RPC interne. Essayez de rafraîchir la page ou de redémarrer MetaMask.";
      }
      
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },
  
  tallyVotes: async () => {
    const { contract, accounts, refreshContractData } = useWeb3Store.getState();
    set({ isLoading: true, error: '', success: '' });
    
    try {
      await contract.methods.tallyVotes().send({ 
        from: accounts[0],
        gas: 800000, // Un peu plus pour cette fonction qui est plus complexe
        gasPrice: undefined
      });
      
      set({ success: "Votes comptabilisés avec succès!", isLoading: false });
      refreshContractData();
      return true;
    } catch (error) {
      console.error("Erreur lors du décompte des votes:", error);
      
      let errorMessage = "Erreur lors du décompte des votes.";
      
      if (error.message.includes("revert")) {
        errorMessage = "Action impossible dans l'état actuel du vote.";
      } else if (error.message.includes("gas")) {
        errorMessage = "Problème de gaz pour la transaction. Essayez d'augmenter la limite de gaz.";
      } else if (error.message.includes("Internal JSON-RPC error")) {
        errorMessage = "Erreur RPC interne. Essayez de rafraîchir la page ou de redémarrer MetaMask.";
      }
      
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },
  
  // Réinitialiser le processus de vote
  resetVoting: async () => {
    const { contract, accounts, refreshContractData } = useWeb3Store.getState();
    set({ isLoading: true, error: '', success: '' });
    
    try {
      await contract.methods.resetVoting().send({ 
        from: accounts[0],
        gas: 800000,
        gasPrice: undefined
      });
      
      set({ success: "Processus de vote réinitialisé avec succès!", isLoading: false });
      
      // Rafraîchir les données du contrat
      refreshContractData();
      
      // Réinitialiser complètement le store des votants et propositions
      const votingStore = await import('./votingStore').then(m => m.default);
      const { resetStore } = votingStore.getState();
      
      // Réinitialiser tous les états du store
      resetStore();
      
      // Recharger les propositions (qui devraient être vides après reset)
      const { loadProposals } = votingStore.getState();
      await loadProposals();
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du vote:", error);
      
      let errorMessage = "Erreur lors de la réinitialisation du vote.";
      
      if (error.message.includes("revert")) {
        errorMessage = "Action impossible : vérifiez que vous êtes bien l'administrateur.";
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

export default useAdminStore; 