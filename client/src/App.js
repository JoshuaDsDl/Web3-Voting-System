import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import './App.css';
import VotingContract from './contracts/Voting.json';
import AdminPanel from './components/AdminPanel';
import VoterPanel from './components/VoterPanel';
import Footer from './components/Footer';
import { Box, Typography, Button, Chip, Avatar, Alert } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

/**
 * Composant principal de notre super app de vote décentralisé
 * Il gère la connexion avec la blockchain et orchestre tout le reste
 */
function App() {
  // --- ÉTATS DE L'APPLICATION ---
  
  // Pour gérer la connexion blockchain
  const [web3, setWeb3] = useState(null);          // Notre connexion à Ethereum
  const [accounts, setAccounts] = useState([]);    // Les comptes dispo dans MetaMask
  const [contract, setContract] = useState(null);  // Instance de notre contrat de vote
  
  // Pour savoir qui est l'utilisateur
  const [isOwner, setIsOwner] = useState(false);   // Est-ce le boss qui gère le vote?
  const [isVoter, setIsVoter] = useState(false);   // Est-ce un votant inscrit?
  
  // Où en est-on dans le processus de vote?
  const [workflowStatus, setWorkflowStatus] = useState(0);
  
  // Si quelque chose tourne mal, on stocke l'erreur ici
  const [error, setError] = useState('');

  // --- INITIALISATION DE L'APP ---
  
  // Ce hook s'exécute une seule fois au démarrage
  useEffect(() => {
    const init = async () => {
      try {
        // D'abord on vérifie si l'utilisateur a MetaMask installé
        const provider = await detectEthereumProvider();
        console.log("Provider détecté:", provider ? "Oui" : "Non");
        
        if (provider) {
          // Cool, on a MetaMask! On crée notre connexion Web3
          const web3Instance = new Web3(provider);
          setWeb3(web3Instance);
          
          // On demande à l'utilisateur de nous donner accès à ses comptes
          // (ça fait apparaître la popup MetaMask)
          const accounts = await web3Instance.eth.requestAccounts();
          console.log("Comptes disponibles:", accounts);
          setAccounts(accounts);
          
          // On vérifie sur quel réseau on est (Mainnet, Sepolia, Hardhat local...)
          const networkId = await web3Instance.eth.net.getId();
          console.log("ID du réseau:", networkId);
          
          // On récupère l'adresse de notre contrat déployé sur ce réseau
          const contractAddress = VotingContract.networks["1337"].address;
          console.log("Adresse du contrat (from config):", contractAddress);
          
          // Est-ce qu'on a bien une adresse pour ce réseau?
          if (!contractAddress) {
            console.error("Adresse du contrat introuvable pour le réseau", networkId);
            setError("Le contrat n'est pas déployé sur ce réseau (adresse manquante)");
            return;
          }
          
          // On crée une instance de notre contrat pour pouvoir communiquer avec lui
          const instance = new web3Instance.eth.Contract(
            VotingContract.abi,  // L'ABI est l'interface qui décrit les fonctions du contrat
            contractAddress       // L'adresse où le contrat est déployé
          );
          console.log("Instance du contrat créée:", instance ? "Oui" : "Non");
          
          if (instance) {
            setContract(instance);
            
            try {
              // On vérifie si le contrat existe vraiment à cette adresse
              // en appelant une de ses fonctions
              const owner = await instance.methods.owner().call();
              console.log("Propriétaire du contrat:", owner);
              
              // On vérifie si l'utilisateur actuel est le proprio du contrat (admin)
              setIsOwner(accounts[0].toLowerCase() === owner.toLowerCase());
              
              // On récupère si l'utilisateur actuel est un votant enregistré
              const voter = await instance.methods.voters(accounts[0]).call();
              console.log("Informations du votant:", voter);
              setIsVoter(voter.isRegistered);
              
              // On regarde à quelle étape on en est dans le processus de vote
              const status = await instance.methods.workflowStatus().call();
              console.log("Statut du workflow:", status);
              setWorkflowStatus(parseInt(status));
              
              // On écoute les événements pour réagir quand des trucs changent dans le contrat
              setupEventListeners(instance);
            } catch (err) {
              console.error("Erreur lors de l'appel au contrat:", err);
              setError("Le contrat de vote n'est pas déployé sur ce réseau. (erreur d'appel)");
            }
          }
        } else {
          // Si MetaMask n'est pas installé, on affiche un message
          setError("Veuillez installer MetaMask pour utiliser cette application.");
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation de l'application :", error);
        setError("Une erreur est survenue lors de l'initialisation.");
      }
    };
    
    // On lance l'initialisation
    init();
  }, []);

  /**
   * Cette fonction configure les écouteurs d'événements pour réagir 
   * quand des choses changent dans le contrat
   */
  const setupEventListeners = (contractInstance) => {
    if (!contractInstance) return;

    // On écoute quand le statut du workflow change
    contractInstance.events.WorkflowStatusChange({}, (error, event) => {
      if (error) {
        console.error("Erreur lors de l'événement WorkflowStatusChange :", error);
        return;
      }
      
      // On met à jour notre état pour refléter le nouveau statut
      setWorkflowStatus(parseInt(event.returnValues.newStatus));
    });
    
    // On écoute quand un nouveau votant est enregistré
    contractInstance.events.VoterRegistered({}, async (error, event) => {
      if (error) {
        console.error("Erreur lors de l'événement VoterRegistered :", error);
        return;
      }
      
      // On vérifie qu'on a bien des comptes avant d'y accéder
      if (accounts && accounts.length > 0) {
        // Si c'est notre adresse qui a été inscrite comme votant, on met à jour notre statut
        if (event.returnValues.voterAddress.toLowerCase() === accounts[0].toLowerCase()) {
          setIsVoter(true);
        }
      } else {
        console.log("Événement VoterRegistered reçu mais aucun compte disponible");
        
        // Plan B: on essaie de récupérer les infos directement du contrat
        try {
          const owner = await contractInstance.methods.owner().call();
          const voterAddr = event.returnValues.voterAddress.toLowerCase();
          
          // Si c'est le proprio qui vient d'être ajouté (bizarre mais bon)
          if (owner.toLowerCase() === voterAddr) {
            setIsOwner(true);
          }
          
          // On check si l'adresse est bien enregistrée
          const voter = await contractInstance.methods.voters(voterAddr).call();
          if (voter.isRegistered) {
            console.log("Utilisateur", voterAddr, "enregistré comme votant");
          }
        } catch (err) {
          console.error("Erreur lors de la vérification de l'événement:", err);
        }
      }
    });
  };

  /**
   * Fonction pour (re)connecter les comptes MetaMask quand l'utilisateur change de compte
   */
  const connectAccounts = async () => {
    try {
      if (web3) {
        // On demande à nouveau les comptes pour être à jour
        const accounts = await web3.eth.requestAccounts();
        setAccounts(accounts);
        
        if (contract) {
          // On vérifie si le nouveau compte est le proprio
          const owner = await contract.methods.owner().call();
          setIsOwner(accounts[0].toLowerCase() === owner.toLowerCase());
          
          // On vérifie si le nouveau compte est un votant
          const voter = await contract.methods.voters(accounts[0]).call();
          setIsVoter(voter.isRegistered);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la connexion des comptes :", error);
      setError("Impossible de se connecter aux comptes. Veuillez vérifier MetaMask.");
    }
  };

  /**
   * Fonction pour rafraîchir les données du contrat
   * (après une action, un changement de compte, etc.)
   */
  const refreshContractData = async () => {
    try {
      if (contract) {
        // On récupère le statut actuel du workflow
        const status = await contract.methods.workflowStatus().call();
        setWorkflowStatus(parseInt(status));
        
        // On vérifie si notre statut de votant a changé
        const voter = await contract.methods.voters(accounts[0]).call();
        setIsVoter(voter.isRegistered);
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des données :", error);
      setError("Impossible de rafraîchir les données.");
    }
  };

  // --- RENDU DE L'INTERFACE ---
  
  return (
    <div className="App">
      <div className="container">
        <div className="header-section">
          <Typography variant="h4" className="title">
            Bienvenue sur VoteChain
          </Typography>
          
          {accounts.length > 0 && !error && (
            <Chip
              avatar={<Avatar sx={{ background: 'rgba(255,255,255,0.2)' }}><AccountBalanceWalletIcon fontSize="small" /></Avatar>}
              label={`${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`}
              variant="outlined"
              sx={{
                color: '#3f51b5',
                borderColor: 'rgba(63,81,181,0.3)',
                py: 1,
                px: 1,
                '& .MuiChip-avatar': {
                  color: '#3f51b5',
                  bgcolor: 'rgba(63,81,181,0.1)'
                },
                '& .MuiChip-label': {
                  fontSize: '0.9rem'
                }
              }}
            />
          )}
        </div>
        
        <div className="content">
          {error ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: 2,
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -60%)',
              width: '100%',
              maxWidth: '600px'
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'error.light',
                borderRadius: '50%'
              }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Alert 
                severity="error"
                sx={{
                  width: '100%',
                  '& .MuiAlert-message': {
                    fontSize: '1.1rem',
                    textAlign: 'center',
                    width: '100%'
                  }
                }}
              >
                {error}
              </Alert>
            </Box>
          ) : accounts.length === 0 ? (
            <Button
              variant="contained"
              onClick={connectAccounts}
              startIcon={<AccountBalanceWalletIcon />}
              sx={{
                bgcolor: '#3f51b5',
                color: 'white',
                '&:hover': {
                  bgcolor: '#303f9f'
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
          ) : (
            <>
              {(isOwner || isVoter) && (
                <Box sx={{ width: '100%' }}>
                  <div className="workflow-status">
                    <div className="status-indicator">
                      {workflowStatus === 0 && "Enregistrement des votants"}
                      {workflowStatus === 1 && "Enregistrement des propositions ouvert"}
                      {workflowStatus === 2 && "Enregistrement des propositions fermé"}
                      {workflowStatus === 3 && "Session de vote ouverte"}
                      {workflowStatus === 4 && "Session de vote fermée"}
                      {workflowStatus === 5 && "Votes comptabilisés"}
                    </div>
                  </div>
                  
                  {isOwner && <AdminPanel web3={web3} accounts={accounts} contract={contract} workflowStatus={workflowStatus} refreshContractData={refreshContractData} />}
                  {isVoter && <VoterPanel web3={web3} accounts={accounts} contract={contract} workflowStatus={workflowStatus} refreshContractData={refreshContractData} />}
                </Box>
              )}
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default App; 