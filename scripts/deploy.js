const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  // Deploy the contract
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();
  await voting.waitForDeployment();

  const address = await voting.getAddress();
  console.log("Voting deployed to:", address);

  // Get the contract artifact directly from hardhat
  const artifact = await hre.artifacts.readArtifact("Voting");
  
  // Add the network information to the artifact
  if (!artifact.networks) {
    artifact.networks = {};
  }
  
  artifact.networks["1337"] = {
    address: address,
    transactionHash: voting.deployTransaction?.hash || "0x0"
  };

  // Create the destination path
  const destPath = path.join(__dirname, '../client/src/contracts/Voting.json');
  
  // Ensure the destination directory exists
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write the updated artifact
  fs.writeFileSync(
    destPath,
    JSON.stringify(artifact, null, 2)
  );

  console.log("Contract artifact copied to:", destPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
