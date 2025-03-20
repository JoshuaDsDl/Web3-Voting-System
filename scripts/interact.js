const hre = require("hardhat");

async function main() {
  console.log("Starting deployment and setup...");

  // Deploy new contract
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();
  await voting.waitForDeployment();
  const contractAddress = await voting.getAddress();
  console.log("Contract deployed to:", contractAddress);

  const [owner, voter2] = await hre.ethers.getSigners();

  try {
    // Register voters
    console.log("Registering voters...");
    await voting.registerVoter(owner.address);
    console.log("Owner registered as voter");
    await voting.registerVoter(voter2.address);
    console.log("Second voter registered");

    // Start proposals registration
    console.log("Starting proposals registration...");
    await voting.startProposalsRegistration();
    console.log("Proposals registration started");

    // Register some proposals
    console.log("Registering proposals...");
    await voting.registerProposal("Proposal 1");
    await voting.connect(voter2).registerProposal("Proposal 2");
    console.log("Proposals registered");

    // End proposals registration
    console.log("Ending proposals registration...");
    await voting.endProposalsRegistration();
    console.log("Proposals registration ended");

    // Start voting session
    console.log("Starting voting session...");
    await voting.startVotingSession();
    console.log("Voting session started");

    console.log("Setup complete!");
    console.log("Contract is ready at:", contractAddress);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
