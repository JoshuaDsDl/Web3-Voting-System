import { create } from 'zustand';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import VotingContract from '../contracts/Voting.json';

const useWeb3Store = create((set, get) => ({
  // État de connexion
  web3: null,
  accounts: [],
  contract: null,
  
  // État utilisateur
  isOwner: false,
  isVoter: false,
  
  // État du workflow
  workflowStatus: 0,
  
  // État d'erreur
  error: '',

  // Fonctions
  initWeb3: async () => {
    try {
      const provider = await detectEthereumProvider();
      console.log("Provider détecté:", provider ? "Oui" : "Non");
      
      if (provider) {
        const web3Instance = new Web3(provider);
        
        const accounts = await web3Instance.eth.requestAccounts();
        console.log("Comptes disponibles:", accounts);
        
        const networkId = await web3Instance.eth.net.getId();
        console.log("ID du réseau:", networkId);
        
        const contractAddress = VotingContract.networks["1337"].address;
        console.log("Adresse du contrat (from config):", contractAddress);
        
        if (!contractAddress) {
          console.error("Adresse du contrat introuvable pour le réseau", networkId);
          set({ 
            error: "Le contrat n'est pas déployé sur ce réseau (adresse manquante)",
            web3: web3Instance,
            accounts
          });
          return;
        }
        
        const instance = new web3Instance.eth.Contract(
          VotingContract.abi,
          contractAddress
        );
        console.log("Instance du contrat créée:", instance ? "Oui" : "Non");
        
        if (instance) {
          try {
            const owner = await instance.methods.owner().call();
            console.log("Propriétaire du contrat:", owner);
            
            const isOwner = accounts[0].toLowerCase() === owner.toLowerCase();
            
            const voter = await instance.methods.voters(accounts[0]).call();
            console.log("Informations du votant:", voter);
            
            const status = await instance.methods.workflowStatus().call();
            console.log("Statut du workflow:", status);
            
            set({ 
              web3: web3Instance, 
              accounts, 
              contract: instance,
              isOwner,
              isVoter: voter.isRegistered,
              workflowStatus: parseInt(status),
              error: ''
            });
            
            get().setupEventListeners(instance);
          } catch (err) {
            console.error("Erreur lors de l'appel au contrat:", err);
            set({ 
              error: "Le contrat de vote n'est pas déployé sur ce réseau. (erreur d'appel)",
              web3: web3Instance,
              accounts
            });
          }
        }
      } else {
        set({ error: "Veuillez installer MetaMask pour utiliser cette application." });
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation :", error);
      set({ error: "Une erreur est survenue lors de l'initialisation." });
    }
  },

  setupEventListeners: (contractInstance) => {
    if (!contractInstance) return;

    contractInstance.events.WorkflowStatusChange({}, (error, event) => {
      if (error) {
        console.error("Erreur lors de l'événement WorkflowStatusChange :", error);
        return;
      }
      
      set({ workflowStatus: parseInt(event.returnValues.newStatus) });
    });
    
    contractInstance.events.VoterRegistered({}, async (error, event) => {
      if (error) {
        console.error("Erreur lors de l'événement VoterRegistered :", error);
        return;
      }
      
      const { accounts, contract } = get();
      
      if (accounts && accounts.length > 0) {
        if (event.returnValues.voterAddress.toLowerCase() === accounts[0].toLowerCase()) {
          set({ isVoter: true });
        }
      } else {
        console.log("Événement VoterRegistered reçu mais aucun compte disponible");
        
        try {
          const owner = await contract.methods.owner().call();
          const voterAddr = event.returnValues.voterAddress.toLowerCase();
          
          if (owner.toLowerCase() === voterAddr) {
            set({ isOwner: true });
          }
          
          const voter = await contract.methods.voters(voterAddr).call();
          if (voter.isRegistered) {
            console.log("Utilisateur", voterAddr, "enregistré comme votant");
          }
        } catch (err) {
          console.error("Erreur lors de la vérification de l'événement:", err);
        }
      }
    });
  },

  connectAccounts: async () => {
    const { web3, contract } = get();
    
    try {
      if (web3) {
        const accounts = await web3.eth.requestAccounts();
        
        let isOwner = false;
        let isVoter = false;
        
        if (contract) {
          const owner = await contract.methods.owner().call();
          isOwner = accounts[0].toLowerCase() === owner.toLowerCase();
          
          const voter = await contract.methods.voters(accounts[0]).call();
          isVoter = voter.isRegistered;
        }
        
        set({ accounts, isOwner, isVoter });
        
        // Charger l'état du votant si c'est un votant
        if (isVoter) {
          const votingStore = await import('./votingStore').then(m => m.default);
          await votingStore.getState().loadVoterState();
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erreur lors de la connexion des comptes :", error);
      set({ error: "Impossible de se connecter aux comptes. Veuillez vérifier MetaMask." });
      return false;
    }
  },

  refreshContractData: async () => {
    const { contract, accounts } = get();
    
    try {
      if (contract && accounts.length > 0) {
        const status = await contract.methods.workflowStatus().call();
        
        const voter = await contract.methods.voters(accounts[0]).call();
        
        set({ 
          workflowStatus: parseInt(status),
          isVoter: voter.isRegistered
        });
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des données :", error);
      set({ error: "Impossible de rafraîchir les données." });
    }
  },

  clearError: () => set({ error: '' })
}));

export default useWeb3Store; 