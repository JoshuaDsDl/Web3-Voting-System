# Web3 Voting System

A decentralized voting system built on Ethereum using Hardhat and React. This application enables secure, transparent voting with smart contract integration.

## Features

- Smart contract-based voting system
- User-friendly React interface
- MetaMask integration
- Role-based access control (Admin/Voters)
- Real-time workflow status updates
- Secure proposal submission and voting

## Demo

https://github.com/JoshuaDsDl/Web3-Voting-System/raw/main/demo.mp4

## Quick Start

1. Clone the repository
```bash
git clone https://github.com/JoshuaDsDl/Web3-Voting-System.git
```

2. Install dependencies
```bash
npm install
cd client && npm install
```

3. Start local blockchain
```bash
npx hardhat node
```

4. Deploy smart contract
```bash
npx hardhat run --network localhost scripts/deploy.js
```

5. Start the frontend application
```bash
cd client && npm start
```

## Technical Stack

- Solidity (Smart Contract)
- Hardhat (Development Environment)
- React (Frontend)
- Web3.js (Blockchain Interaction)
- Material-UI (UI Components)

## Project Structure

- `/contracts`: Smart contract source code
- `/scripts`: Deployment and interaction scripts
- `/test`: Smart contract tests
- `/client`: React frontend application

## Contributing

Feel free to submit issues and enhancement requests.

## Copyright

© 2025 JDSoft. All rights reserved.
