/**
 * Énumération des différentes étapes du workflow de vote
 * Correspond aux états définis dans le smart contract
 */
export const WorkflowStatus = {
    RegisteringVoters: 0,           // Étape 1: Enregistrement des votants
    ProposalsRegistrationStarted: 1, // Étape 2: Soumission des propositions
    ProposalsRegistrationEnded: 2,   // Étape 3: Fin des propositions
    VotingSessionStarted: 3,        // Étape 4: Vote en cours
    VotingSessionEnded: 4,          // Étape 5: Fin des votes
    VotesTallied: 5                 // Étape 6: Votes comptabilisés
}; 