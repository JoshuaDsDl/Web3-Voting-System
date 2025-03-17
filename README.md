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
- Comptabilisation des votes et détermination du gagnant à la majorité simple

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
npx hardhat node --hostname 0.0.0.0
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

## Configuration de MetaMask

1. Réseau Hardhat Local:
   - Nom: Hardhat Local
   - URL RPC: http://127.0.0.1:8545 (ou l'adresse IP de votre machine si accès distant)
   - ID de chaîne: 1337
   - Symbole: ETH

2. Compte administrateur (déployeur du contrat):
   - Importez la clé privée: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - Adresse: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

3. Comptes votants (pour test):
   - Compte #1: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
     - Clé privée: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
   - Compte #2: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
     - Clé privée: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

## Utilisation multi-utilisateurs (2 navigateurs)

Pour simuler un administrateur et un votant:

1. Navigateur 1 (administrateur):
   - Connectez-vous avec le compte administrateur
   - Enregistrez les adresses des votants
   - Gérez le workflow du vote

2. Navigateur 2 (votant):
   - Connectez-vous avec un compte votant
   - Soumettez des propositions
   - Votez pendant la phase de vote

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

## Dépannage

Si vous rencontrez des erreurs:

1. **MetaMask - Internal JSON-RPC error**:
   - Réinitialisez votre compte MetaMask (Paramètres > Avancés > Réinitialiser)
   - Assurez-vous que votre nœud Hardhat tourne toujours

2. **Contract not deployed on this network**:
   - Vérifiez que vous êtes sur le bon réseau dans MetaMask (ID 1337)
   - Redéployez le contrat si nécessaire

3. **Problèmes d'accès distant**:
   - Pour accéder depuis une autre machine, assurez-vous de lancer le nœud avec `--hostname 0.0.0.0`
   - Utilisez l'adresse IP de la machine hôte dans la configuration MetaMask
