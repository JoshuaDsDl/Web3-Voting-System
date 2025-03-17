# DApp de Vote - Projet IMT 2025

Ce projet est une application décentralisée (DApp) de vote développée dans le cadre du cours de Contrats Intelligents à l'IMT.

## Auteurs
- Joshua Deschietere
- Noah Cencini

## Description

Cette DApp permet à une organisation de gérer un processus de vote décentralisé et transparent. Les fonctionnalités principales sont :

- Enregistrement des votants sur une liste blanche (whitelist)
- Soumission de propositions par les votants
- Vote pour les propositions
- Comptabilisation des votes et détermination du gagnant

## Structure du projet

- `contracts/` : Contient les contrats intelligents Solidity
- `test/` : Contient les tests pour les contrats
- `client/` : Application frontend React

## Prérequis

- Node.js (v14+)
- npm ou yarn
- MetaMask (extension de navigateur)
- Hardhat (pour le développement et les tests)

## Installation

1. Cloner le dépôt :
```
git clone <URL_DU_REPO>
cd Web3-Voting
```

2. Installer les dépendances du projet principal :
```
npm install
```

3. Installer les dépendances du frontend :
```
cd client
npm install
cd ..
```

## Compilation et déploiement des contrats

1. Compiler les contrats :
```
npx hardhat compile
```

2. Déployer les contrats sur un réseau local :
```
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

## Exécution des tests

```
npx hardhat test
```

## Lancement de l'application frontend

```
cd client
npm start
```

L'application sera accessible à l'adresse http://localhost:3000.

## Utilisation

1. Connectez-vous avec MetaMask
2. Si vous êtes l'administrateur (propriétaire du contrat) :
   - Vous pouvez enregistrer des votants
   - Vous pouvez gérer le workflow du vote
3. Si vous êtes un votant enregistré :
   - Vous pouvez soumettre des propositions pendant la phase d'enregistrement
   - Vous pouvez voter pour une proposition pendant la phase de vote
   - Vous pouvez consulter les résultats après la comptabilisation des votes

## Workflow du vote

1. Enregistrement des votants (RegisteringVoters)
2. Début de l'enregistrement des propositions (ProposalsRegistrationStarted)
3. Fin de l'enregistrement des propositions (ProposalsRegistrationEnded)
4. Début de la session de vote (VotingSessionStarted)
5. Fin de la session de vote (VotingSessionEnded)
6. Comptabilisation des votes (VotesTallied)
