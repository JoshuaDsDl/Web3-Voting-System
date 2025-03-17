const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
  let voting;
  let owner;
  let voter1;
  let voter2;
  let voter3;
  let nonVoter;

  beforeEach(async function () {
    // Déploiement du contrat
    const Voting = await ethers.getContractFactory("Voting");
    [owner, voter1, voter2, voter3, nonVoter] = await ethers.getSigners();
    voting = await Voting.deploy();
    await voting.deployed();
  });

  describe("Déploiement", function () {
    it("Devrait définir le bon propriétaire", async function () {
      expect(await voting.owner()).to.equal(owner.address);
    });

    it("Devrait commencer avec le statut RegisteringVoters", async function () {
      expect(await voting.workflowStatus()).to.equal(0); // RegisteringVoters = 0
    });
  });

  describe("Enregistrement des votants", function () {
    it("Devrait permettre au propriétaire d'enregistrer un votant", async function () {
      await voting.registerVoter(voter1.address);
      const voter = await voting.voters(voter1.address);
      expect(voter.isRegistered).to.be.true;
    });

    it("Ne devrait pas permettre à un non-propriétaire d'enregistrer un votant", async function () {
      await expect(
        voting.connect(voter1).registerVoter(voter2.address)
      ).to.be.revertedWith("Seul l'administrateur peut effectuer cette action");
    });

    it("Ne devrait pas permettre d'enregistrer un votant déjà enregistré", async function () {
      await voting.registerVoter(voter1.address);
      await expect(
        voting.registerVoter(voter1.address)
      ).to.be.revertedWith("Ce votant est déjà enregistré");
    });
  });

  describe("Workflow et propositions", function () {
    beforeEach(async function () {
      // Enregistrer des votants
      await voting.registerVoter(voter1.address);
      await voting.registerVoter(voter2.address);
      await voting.registerVoter(voter3.address);
    });

    it("Seul le propriétaire peut changer le statut du workflow", async function () {
      await expect(
        voting.connect(voter1).startProposalsRegistration()
      ).to.be.revertedWith("Seul l'administrateur peut effectuer cette action");
    });

    it("Le propriétaire peut démarrer l'enregistrement des propositions", async function () {
      await voting.startProposalsRegistration();
      expect(await voting.workflowStatus()).to.equal(1); // ProposalsRegistrationStarted = 1
    });

    it("Les votants peuvent enregistrer des propositions pendant la phase d'enregistrement", async function () {
      await voting.startProposalsRegistration();
      await voting.connect(voter1).registerProposal("Proposition 1");
      await voting.connect(voter2).registerProposal("Proposition 2");
      
      expect(await voting.getProposalsCount()).to.equal(2);
    });

    it("Les non-votants ne peuvent pas enregistrer de propositions", async function () {
      await voting.startProposalsRegistration();
      await expect(
        voting.connect(nonVoter).registerProposal("Proposition invalide")
      ).to.be.revertedWith("Vous n'êtes pas un votant enregistré");
    });
  });

  describe("Session de vote", function () {
    beforeEach(async function () {
      // Configurer le test pour la session de vote
      await voting.registerVoter(voter1.address);
      await voting.registerVoter(voter2.address);
      await voting.registerVoter(voter3.address);
      await voting.startProposalsRegistration();
      await voting.connect(voter1).registerProposal("Proposition 1");
      await voting.connect(voter2).registerProposal("Proposition 2");
      await voting.endProposalsRegistration();
      await voting.startVotingSession();
    });

    it("Les votants peuvent voter pour une proposition valide", async function () {
      await voting.connect(voter1).vote(1); // Vote pour la proposition 1
      const voter = await voting.voters(voter1.address);
      expect(voter.hasVoted).to.be.true;
      expect(voter.votedProposalId).to.equal(1);
    });

    it("Les votants ne peuvent pas voter deux fois", async function () {
      await voting.connect(voter1).vote(1);
      await expect(
        voting.connect(voter1).vote(2)
      ).to.be.revertedWith("Vous avez déjà voté");
    });

    it("Les non-votants ne peuvent pas voter", async function () {
      await expect(
        voting.connect(nonVoter).vote(1)
      ).to.be.revertedWith("Vous n'êtes pas un votant enregistré");
    });
  });

  describe("Tallying des votes", function () {
    beforeEach(async function () {
      // Configurer le test pour le tallying des votes
      await voting.registerVoter(voter1.address);
      await voting.registerVoter(voter2.address);
      await voting.registerVoter(voter3.address);
      await voting.startProposalsRegistration();
      await voting.connect(voter1).registerProposal("Proposition 1");
      await voting.connect(voter2).registerProposal("Proposition 2");
      await voting.endProposalsRegistration();
      await voting.startVotingSession();
      
      // Voter pour différentes propositions
      await voting.connect(voter1).vote(2); // Vote pour proposition 2
      await voting.connect(voter2).vote(2); // Vote pour proposition 2
      await voting.connect(voter3).vote(1); // Vote pour proposition 1
      
      // Terminer la session de vote
      await voting.endVotingSession();
    });

    it("Seul le propriétaire peut faire le tallying des votes", async function () {
      await expect(
        voting.connect(voter1).tallyVotes()
      ).to.be.revertedWith("Seul l'administrateur peut effectuer cette action");
    });

    it("Le tallying devrait identifier la proposition gagnante correctement", async function () {
      await voting.tallyVotes();
      
      // La proposition 2 a le plus de votes (2 contre 1)
      expect(await voting.winningProposalId()).to.equal(2);
      
      const winningProposal = await voting.getWinningProposal();
      expect(winningProposal.description).to.equal("Proposition 2");
      expect(winningProposal.voteCount).to.equal(2);
      expect(winningProposal.proposer).to.equal(voter2.address);
    });

    it("On ne peut pas obtenir la proposition gagnante avant le tallying", async function () {
      // Revenir à l'état précédent (avant le tallying)
      const Voting = await ethers.getContractFactory("Voting");
      voting = await Voting.deploy();
      await voting.deployed();
      
      await expect(
        voting.getWinningProposal()
      ).to.be.revertedWith("Les votes n'ont pas encore été comptabilisés");
    });
  });
}); 