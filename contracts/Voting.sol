// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    // Structure pour représenter un votant
    struct Voter {
        bool isRegistered;      // Si le votant est enregistré
        bool hasVoted;          // Si le votant a déjà voté
        uint votedProposalId;   // ID de la proposition pour laquelle le votant a voté
        bool hasProposed;       // Si le votant a déjà proposé une idée
    }

    // Structure pour représenter une proposition
    struct Proposal {
        string description;     // Description de la proposition
        uint voteCount;         // Nombre de votes reçus
        address proposer;       // Adresse du proposant
    }

    // Énumération pour suivre l'état du vote
    enum WorkflowStatus {
        RegisteringVoters,       // Enregistrement des votants
        ProposalsRegistrationStarted, // Enregistrement des propositions commencé
        ProposalsRegistrationEnded,   // Enregistrement des propositions terminé
        VotingSessionStarted,    // Session de vote commencée
        VotingSessionEnded,      // Session de vote terminée
        VotesTallied             // Votes comptabilisés
    }

    // État actuel du workflow
    WorkflowStatus public workflowStatus;
    
    // Adresse du propriétaire du contrat (administrateur)
    address public owner;
    
    // Mapping pour stocker les informations sur les votants
    mapping(address => Voter) public voters;
    
    // Tableau pour stocker toutes les propositions
    Proposal[] public proposals;
    
    // ID de la proposition gagnante
    uint public winningProposalId;

    // Événements
    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted(address voter, uint proposalId);

    // Modificateur pour restreindre l'accès à l'administrateur
    modifier onlyOwner() {
        require(msg.sender == owner, "Seul l'administrateur peut effectuer cette action");
        _;
    }

    // Modificateur pour vérifier si l'adresse est un votant enregistré
    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "Vous n'êtes pas un votant enregistré");
        _;
    }

    // Constructeur
    constructor() {
        owner = msg.sender;
        workflowStatus = WorkflowStatus.RegisteringVoters;
        
        // Ajouter une proposition vide à l'index 0 (pour éviter les confusions avec l'ID 0)
        proposals.push(Proposal("", 0, address(0)));
    }

    // Fonction pour ajouter un votant à la whitelist
    function registerVoter(address _voter) external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "La période d'enregistrement des votants est terminée");
        require(!voters[_voter].isRegistered, "Ce votant est déjà enregistré");
        
        voters[_voter].isRegistered = true;
        
        emit VoterRegistered(_voter);
    }

    // Fonction pour passer à l'étape suivante du workflow
    function startProposalsRegistration() external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "Le workflow n'est pas à l'étape d'enregistrement des votants");
        
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    // Fonction pour enregistrer une proposition
    function registerProposal(string calldata _description) external onlyVoters {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "La période d'enregistrement des propositions n'est pas active");
        require(bytes(_description).length > 0, "La description ne peut pas être vide");
        
        proposals.push(Proposal({
            description: _description,
            voteCount: 0,
            proposer: msg.sender
        }));
        
        emit ProposalRegistered(proposals.length - 1);
    }

    // Fonction pour terminer l'enregistrement des propositions
    function endProposalsRegistration() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "Le workflow n'est pas à l'étape d'enregistrement des propositions");
        
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    // Fonction pour commencer la session de vote
    function startVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, "Le workflow n'est pas à l'étape de fin d'enregistrement des propositions");
        
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    // Fonction pour voter pour une proposition
    function vote(uint _proposalId) external onlyVoters {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "La session de vote n'est pas active");
        require(!voters[msg.sender].hasVoted, "Vous avez déjà voté");
        require(_proposalId > 0 && _proposalId < proposals.length, "ID de proposition invalide");
        
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = _proposalId;
        
        proposals[_proposalId].voteCount++;
        
        emit Voted(msg.sender, _proposalId);
    }

    // Fonction pour terminer la session de vote
    function endVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "Le workflow n'est pas à l'étape de vote");
        
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    // Fonction pour comptabiliser les votes et déterminer le gagnant
    function tallyVotes() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Le workflow n'est pas à l'étape de fin de vote");
        
        uint winningVoteCount = 0;
        
        // Parcourir toutes les propositions pour trouver celle avec le plus de votes
        for (uint i = 1; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposalId = i;
            }
        }
        
        workflowStatus = WorkflowStatus.VotesTallied;
        
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }

    // Fonction pour obtenir le nombre de propositions
    function getProposalsCount() external view returns (uint) {
        return proposals.length - 1; // Soustraction de 1 car nous avons une proposition vide à l'index 0
    }

    // Fonction pour obtenir la description de la proposition gagnante
    function getWinningProposal() external view returns (string memory description, uint voteCount, address proposer) {
        require(workflowStatus == WorkflowStatus.VotesTallied, "Les votes n'ont pas encore été comptabilisés");
        
        return (
            proposals[winningProposalId].description,
            proposals[winningProposalId].voteCount,
            proposals[winningProposalId].proposer
        );
    }
} 