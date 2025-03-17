import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import './App.css';
import VotingContract from './contracts/Voting.json';
import AdminPanel from './components/AdminPanel';
import VoterPanel from './components/VoterPanel';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  // État pour stocker les informations de Web3 et du contrat
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  
  // État pour stocker les informations de l'utilisateur
  const [isOwner, setIsOwner] = useState(false);
  const [isVoter, setIsVoter] = useState(false);
  
  // État pour stocker le statut actuel du workflow
  const [workflowStatus, setWorkflowStatus] = useState(0);
  
  // État pour stocker les erreurs
  const [error, setError] = useState('');

  // Initialisation de Web3 et du contrat
  useEffect(() => {
    const init = async () => {
      try {
        // Détection du provider Ethereum (par exemple, MetaMask)
        const provider = await detectEthereumProvider();
        
        if (provider) {
          // Création d'une instance Web3 avec le provider
          const web3Instance = new Web3(provider);
          setWeb3(web3Instance);
          
          // Demande des comptes à l'utilisateur
          const accounts = await web3Instance.eth.requestAccounts();
          setAccounts(accounts);
          
          // Récupération du réseau actuel
          const networkId = await web3Instance.eth.net.getId();
          
          // Vérification si le déploiement du contrat existe sur ce réseau
          const deployedNetwork = VotingContract.networks[networkId];
          
          if (deployedNetwork) {
            // Création d'une instance du contrat
            const instance = new web3Instance.eth.Contract(
              VotingContract.abi,
              deployedNetwork.address
            );
            setContract(instance);
            
            // Récupération du propriétaire du contrat
            const owner = await instance.methods.owner().call();
            setIsOwner(accounts[0].toLowerCase() === owner.toLowerCase());
            
            // Récupération du statut de votant
            const voter = await instance.methods.voters(accounts[0]).call();
            setIsVoter(voter.isRegistered);
            
            // Récupération du statut du workflow
            const status = await instance.methods.workflowStatus().call();
            setWorkflowStatus(parseInt(status));
            
            // Mise en place des écouteurs d'événements
            setupEventListeners(instance);
          } else {
            setError("Le contrat de vote n'est pas déployé sur ce réseau.");
          }
        } else {
          setError("Veuillez installer MetaMask pour utiliser cette application.");
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation de l'application :", error);
        setError("Une erreur est survenue lors de l'initialisation de l'application.");
      }
    };
    
    init();
  }, []);

  // Fonction pour configurer les écouteurs d'événements
  const setupEventListeners = (contractInstance) => {
    contractInstance.events.WorkflowStatusChange({}, (error, event) => {
      if (error) {
        console.error("Erreur lors de l'événement WorkflowStatusChange :", error);
        return;
      }
      
      setWorkflowStatus(parseInt(event.returnValues.newStatus));
    });
    
    contractInstance.events.VoterRegistered({}, async (error, event) => {
      if (error) {
        console.error("Erreur lors de l'événement VoterRegistered :", error);
        return;
      }
      
      // Si l'événement concerne l'utilisateur actuel, on met à jour son statut de votant
      if (event.returnValues.voterAddress.toLowerCase() === accounts[0].toLowerCase()) {
        setIsVoter(true);
      }
    });
  };

  // Fonction pour reconnecter les comptes en cas de changement
  const connectAccounts = async () => {
    try {
      if (web3) {
        const accounts = await web3.eth.requestAccounts();
        setAccounts(accounts);
        
        if (contract) {
          // Vérification si l'utilisateur est le propriétaire
          const owner = await contract.methods.owner().call();
          setIsOwner(accounts[0].toLowerCase() === owner.toLowerCase());
          
          // Vérification si l'utilisateur est un votant
          const voter = await contract.methods.voters(accounts[0]).call();
          setIsVoter(voter.isRegistered);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la connexion des comptes :", error);
      setError("Une erreur est survenue lors de la connexion des comptes.");
    }
  };

  // Fonction pour rafraîchir les données du contrat
  const refreshContractData = async () => {
    try {
      if (contract) {
        // Récupération du statut du workflow
        const status = await contract.methods.workflowStatus().call();
        setWorkflowStatus(parseInt(status));
        
        // Vérification si l'utilisateur est un votant (pourrait avoir changé)
        const voter = await contract.methods.voters(accounts[0]).call();
        setIsVoter(voter.isRegistered);
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des données :", error);
      setError("Une erreur est survenue lors du rafraîchissement des données.");
    }
  };

  return (
    <div className="App">
      <Header 
        accounts={accounts} 
        connectAccounts={connectAccounts}
        isOwner={isOwner}
        isVoter={isVoter}
      />
      
      <div className="container">
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        
        {!web3 && !error && (
          <div className="alert alert-info">
            Chargement de l'application...
          </div>
        )}
        
        {web3 && (
          <>
            <div className="workflow-status card">
              <h2>Statut actuel</h2>
              <div className="status-indicator">
                {workflowStatus === 0 && "Enregistrement des votants"}
                {workflowStatus === 1 && "Enregistrement des propositions en cours"}
                {workflowStatus === 2 && "Enregistrement des propositions terminé"}
                {workflowStatus === 3 && "Session de vote en cours"}
                {workflowStatus === 4 && "Session de vote terminée"}
                {workflowStatus === 5 && "Votes comptabilisés"}
              </div>
            </div>
            
            {isOwner && (
              <AdminPanel
                web3={web3}
                accounts={accounts}
                contract={contract}
                workflowStatus={workflowStatus}
                refreshContractData={refreshContractData}
              />
            )}
            
            {isVoter && (
              <VoterPanel
                web3={web3}
                accounts={accounts}
                contract={contract}
                workflowStatus={workflowStatus}
                refreshContractData={refreshContractData}
              />
            )}
            
            {!isOwner && !isVoter && (
              <div className="card">
                <h2>Accès non autorisé</h2>
                <p>
                  Vous n'êtes ni le propriétaire du contrat ni un votant enregistré.
                  Veuillez contacter l'administrateur pour obtenir un accès.
                </p>
              </div>
            )}
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
}

export default App; 