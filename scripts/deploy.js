// Imports - les trucs dont on a besoin pour faire tourner le script
const { ethers } = require("hardhat");

/**
 * Script de déploiement de notre Dapp de vote
 * Ce script va:
 * 1. Déployer le contrat Voting sur le réseau choisi
 * 2. Sauvegarder l'ABI et l'adresse pour le frontend
 */
async function main() {
  console.log("Déploiement du contrat Voting...");

  // On récupère le code du contrat pour pouvoir le déployer
  const Voting = await ethers.getContractFactory("Voting");
  
  // Pouf! On déploie le contrat (magie de Hardhat)
  const voting = await Voting.deploy();

  console.log("Contrat déployé à l'adresse:", voting.target);

  // On a besoin de ces modules pour manipuler les fichiers
  const fs = require("fs");
  const path = require("path");

  // On crée le dossier où stocker les infos du contrat si besoin
  const artifactsDir = path.join(__dirname, "../client/src/contracts");
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  // On prépare un joli objet avec toutes les infos du contrat
  // que notre frontend va utiliser pour communiquer avec lui
  const contractData = {
    contractName: "Voting",                           // Nom du contrat
    abi: JSON.parse(voting.interface.formatJson()),   // L'ABI qui permet d'interagir avec le contrat
    networks: {
      1337: {                                         // ID de notre réseau local Hardhat
        address: voting.target,                       // Adresse où le contrat est déployé
        transactionHash: voting.deployTransaction ? voting.deployTransaction.hash : "0x0" // Hash de la transaction de déploiement
      }
    }
  };

  // On écrit tout ça dans un fichier pour que le frontend puisse le lire
  fs.writeFileSync(
    path.join(artifactsDir, "Voting.json"),
    JSON.stringify(contractData, null, 2)  // Le 2 ici c'est pour avoir un joli formatage avec des espaces
  );

  console.log("Informations du contrat écrites dans", path.join(artifactsDir, "Voting.json"));
}

// On lance la fonction principale et on gère les erreurs comme des grands
main()
  .then(() => process.exit(0))  // Si tout va bien, on quitte proprement
  .catch(error => {             // Si y'a une erreur...
    console.error(error);       // On l'affiche
    process.exit(1);            // Et on quitte avec un code d'erreur
  }); 