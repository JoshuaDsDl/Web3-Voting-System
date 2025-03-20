// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Système de vote décentralisé
 * @dev Ce contrat permet de gérer un système de vote complet où des votants enregistrés 
 * peuvent soumettre des propositions puis voter. Le vainqueur est déterminé à la majorité simple.
 */
contract Voting {
    // Structure pour représenter un votant
    struct Voter {
        bool isRegistered;      // Est-ce que le gars est dans la whitelist?
        bool hasVoted;          // A-t-il déjà voté ou pas encore?
        uint votedProposalId;   // Pour quelle proposition a-t-il voté?
        bool hasProposed;       // A-t-il déjà fait une proposition?
    }

    // Structure pour représenter une proposition
    struct Proposal {
        string description;     // Description de l'idée proposée
        uint voteCount;         // Nombre de votes que la proposition a reçu
        address proposer;       // Qui a fait cette proposition?
    }

    // Énumération pour suivre où on en est dans le processus de vote
    enum WorkflowStatus {
        RegisteringVoters,           // Étape 1: On inscrit les votants
        ProposalsRegistrationStarted, // Étape 2: Les gens peuvent proposer des idées
        ProposalsRegistrationEnded,   // Étape 3: Trop tard pour proposer
        VotingSessionStarted,        // Étape 4: C'est l'heure de voter!
        VotingSessionEnded,          // Étape 5: Fin des votes 
        VotesTallied                 // Étape 6: On a compté, on connaît le gagnant
    }

    // L'étape actuelle du processus
    WorkflowStatus public workflowStatus;
    
    // L'adresse du big boss qui gère tout
    address public owner;
    
    // Pour stocker les infos de chaque votant (clé: adresse, valeur: infos du votant)
    mapping(address => Voter) public voters;
    
    // Liste de toutes les propositions soumises
    Proposal[] public proposals;
    
    // ID de la proposition qui a gagné (après comptage)
    uint public winningProposalId;

    // Nombre total de votants enregistrés
    uint public voterCount;

    // Tous les événements qu'on émet pour tracker ce qui se passe
    event VoterRegistered(address voterAddress); // Quelqu'un est inscrit comme votant
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus); // On change d'étape
    event ProposalRegistered(uint proposalId); // Une nouvelle proposition est enregistrée
    event Voted(address voter, uint proposalId); // Quelqu'un a voté

    // Vérifie que c'est bien le boss qui appelle la fonction
    modifier onlyOwner() {
        require(msg.sender == owner, "T'es pas le boss, il faut que tu sois admin!");
        _;
    }

    // Vérifie que celui qui appelle est bien un votant inscrit
    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "T'es pas inscrit comme votant, sorry!");
        _;
    }

    /**
     * @dev Initialise le contrat de vote
     * Le créateur du contrat devient automatiquement le boss
     */
    constructor() {
        owner = msg.sender; // Celui qui déploie le contrat devient le boss
        workflowStatus = WorkflowStatus.RegisteringVoters; // On commence à l'étape d'inscription
        
        // On crée une proposition bidon à l'index 0 pour que toutes les vraies propositions
        // commencent à partir de l'index 1 (c'est plus facile pour l'interface)
        proposals.push(Proposal("", 0, address(0))); 
    }

    /**
     * @dev Ajoute un votant à la whitelist
     * @param _voter L'adresse à ajouter comme votant
     */
    function registerVoter(address _voter) external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "Trop tard pour ajouter des votants!");
        require(!voters[_voter].isRegistered, "Ce gars est deja inscrit, t'es distrait?");
        
        voters[_voter].isRegistered = true;
        voterCount++;
        
        emit VoterRegistered(_voter);
    }

    /**
     * @dev Passe à l'étape d'enregistrement des propositions
     * Seul le boss peut déclencher ce changement
     */
    function startProposalsRegistration() external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "On n'est pas a la bonne etape, faut suivre!");
        require(voterCount >= 2, "Il faut au moins 2 votants pour commencer les propositions!");
        
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    /**
     * @dev Permet à un votant d'enregistrer une proposition
     * @param _description La description de la proposition
     */
    function registerProposal(string calldata _description) external onlyVoters {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "C'est pas le moment de proposer des trucs!");
        require(bytes(_description).length > 0, "Faut au moins ecrire quelque chose, non?");
        
        // On ajoute la nouvelle proposition à la liste
        proposals.push(Proposal({
            description: _description,
            voteCount: 0,
            proposer: msg.sender
        }));
        
        emit ProposalRegistered(proposals.length - 1); // On annonce la nouvelle proposition avec son ID
    }

    /**
     * @dev Termine la phase d'enregistrement des propositions
     * Seul le boss peut fermer cette étape
     */
    function endProposalsRegistration() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "Faut d'abord demarrer la phase de propositions!");
        
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    /**
     * @dev Démarre la phase de vote
     * Maintenant les votants peuvent voter pour leurs propositions préférées
     */
    function startVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, "On n'est pas prets pour voter!");
        require(proposals.length > 2, "Il faut au moins 2 propositions pour commencer le vote!");
        require(voterCount >= 2, "Il faut au moins 2 votants pour commencer le vote!");
        
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    /**
     * @dev Permet à un votant de voter pour une proposition
     * @param _proposalId L'ID de la proposition pour laquelle voter
     */
    function vote(uint _proposalId) external onlyVoters {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "C'est pas le moment de voter!");
        require(!voters[msg.sender].hasVoted, "T'as deja vote, pas de triche!");
        require(_proposalId > 0 && _proposalId < proposals.length, "Cette proposition n'existe pas!");
        
        // On enregistre le vote
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = _proposalId;
        
        // On incrémente le compteur de votes pour cette proposition
        proposals[_proposalId].voteCount++;
        
        emit Voted(msg.sender, _proposalId); // On annonce qui a voté pour quoi
    }

    /**
     * @dev Termine la session de vote
     * Plus personne ne peut voter après ça
     */
    function endVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "Faut d'abord commencer le vote!");
        
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    /**
     * @dev Compte les votes et détermine la proposition gagnante
     * La proposition avec le plus de votes gagne
     */
    function tallyVotes() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Attends que tout le monde ait fini de voter!");
        
        uint winningVoteCount = 0;
        
        // On parcourt toutes les propositions pour trouver celle avec le plus de votes
        for (uint i = 1; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposalId = i;
            }
        }
        
        workflowStatus = WorkflowStatus.VotesTallied;
        
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }

    /**
     * @dev Réinitialise le processus de vote
     * Seul le propriétaire peut réinitialiser le vote
     */
    function resetVoting() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotesTallied, "Le vote n'est pas encore termine!");
        
        // Réinitialiser le statut
        workflowStatus = WorkflowStatus.RegisteringVoters;
        
        // Réinitialiser les propositions
        delete proposals;
        proposals.push(Proposal("", 0, address(0))); // Recréer la proposition factice à l'index 0
        
        // Réinitialiser le gagnant
        winningProposalId = 0;
        
        // Réinitialiser tous les votants et le compteur
        voterCount = 0;
        // Note: On ne peut pas utiliser delete sur un mapping entier,
        // donc on émet un événement pour que le frontend sache qu'il faut rafraîchir
        emit WorkflowStatusChange(WorkflowStatus.VotesTallied, WorkflowStatus.RegisteringVoters);
    }

    /**
     * @dev Renvoie le nombre total de vraies propositions
     * @return Le nombre de propositions moins la proposition factice à l'index 0
     */
    function getProposalsCount() external view returns (uint) {
        return proposals.length - 1; // On soustrait 1 pour la proposition bidon à l'index 0
    }

    /**
     * @dev Permet de récupérer les infos de la proposition gagnante
     * @return description La description de la proposition gagnante
     * @return voteCount Le nombre de votes qu'elle a reçus
     * @return proposer L'adresse de celui qui a proposé
     */
    function getWinningProposal() external view returns (string memory description, uint voteCount, address proposer) {
        require(workflowStatus == WorkflowStatus.VotesTallied, "Patience, on n'a pas encore compte!");
        
        return (
            proposals[winningProposalId].description,
            proposals[winningProposalId].voteCount,
            proposals[winningProposalId].proposer
        );
    }
}
