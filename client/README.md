# VoteChain - Application de Vote Décentralisé

Une application décentralisée (DApp) basée sur Ethereum pour gérer des votes sécurisés et transparents sur la blockchain.

## Fonctionnalités

- Authentification avec MetaMask
- Gestion complète du processus de vote
- Interface utilisateur intuitive avec Material UI
- Architecture moderne avec React et Zustand
- Interactions sécurisées avec les smart contracts Ethereum

## Prérequis

- Node.js (version 14 ou supérieure)
- MetaMask installé dans votre navigateur
- Un réseau blockchain local (comme Hardhat) ou un accès à un réseau de test (comme Sepolia)

## Installation

1. Cloner le dépôt :
```bash
git clone <URL_DU_REPO>
cd Web3-Voting
```

2. Installer les dépendances du projet principal :
```bash
npm install
```

3. Installer les dépendances du client :
```bash
cd client
npm install
```

## Déploiement du contrat

1. Lancer un nœud Ethereum local avec Hardhat :
```bash
npx hardhat node
```

2. Déployer le contrat sur le réseau local :
```bash
npx hardhat run scripts/deploy.js --network localhost
```

## Démarrer l'application

1. Lancer l'application React :
```bash
cd client
npm start
```

2. Ouvrir votre navigateur à l'adresse [http://localhost:3000](http://localhost:3000)

3. Connecter MetaMask au réseau local et ajouter un compte de test

## Structure du projet

- `client/` - Frontend React
  - `src/` - Code source
    - `components/` - Composants React réutilisables
    - `store/` - État global avec Zustand
    - `contracts/` - ABI des contrats compilés
- `contracts/` - Smart contracts Solidity
- `scripts/` - Scripts de déploiement
- `test/` - Tests des smart contracts

## Utilisation

1. Connecter votre wallet MetaMask
2. Si vous êtes l'administrateur, vous pouvez :
   - Enregistrer des votants
   - Gérer les phases du vote
   - Comptabiliser les votes
3. Si vous êtes un votant, vous pouvez :
   - Soumettre des propositions
   - Voter pour une proposition
   - Consulter les résultats

## Licence

MIT 