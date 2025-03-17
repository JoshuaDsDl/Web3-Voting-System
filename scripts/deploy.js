const hre = require("hardhat");

async function main() {
  // Récupération des signers (comptes)
  const [deployer] = await hre.ethers.getSigners();

  console.log("Déploiement du contrat avec le compte :", deployer.address);
  console.log("Balance du compte :", (await deployer.getBalance()).toString());

  // Déploiement du contrat Voting
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();

  await voting.deployed();

  console.log("Contrat Voting déployé à l'adresse :", voting.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 