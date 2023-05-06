# Sassy finance
This repository contains our project for the DAO global hackathon. It implements a Dapp where users can create their DeFi DAO in one single clicks, selecting the plugins needed for their use case.

## Components

This repository has two components:
- [Frontend](./frontend): Frontend to implmented the Dapp, is a forked version of Aragon OSx web app
- [Contracts](./contracts): Contains three plugins. 
  - GroupVotingPlugin: this plugin enables the creation of sub governance groups within an existing DAO. This plugin remove the need to create a new DAO, allowing an organisation to jointly vote for the creation of this subgroup that has its own budget from the join treasury and own decision making rules. 
  - NFTCollectorPlugin: This plugin allows authorised wallets to buy NFTs directly from OpenSea within the DAO itself and without the need to use external tools
  - SwapTokenPlugin: token swap plugin: DAO members can swap tokens in UniSwap within the DAO itself and without the need to use external tools

## Plugin Addresses (Polygon Mumbai):
- [GroupVotingPlugin: 0x7cb358474ff971b679a8f20f1b0f152a43e6cc11](https://mumbai.polygonscan.com/address/0x7cb358474ff971b679a8f20f1b0f152a43e6cc11)
- [NFTCollectorPlugin: 0x4ae3f5918b34b63de9d371038a4cb1ed630e1e3a](https://mumbai.polygonscan.com/address/0x4ae3f5918b34b63de9d371038a4cb1ed630e1e3a)
- [SwapTokenPlugin: 0x55f8d46caaf4079548f4be65840e1db990d059d8](https://mumbai.polygonscan.com/address/0x55f8d46caaf4079548f4be65840e1db990d059d8)


## Installation instructions

### Frontend

 Install deps, build and link ui-components
 ```
    cd frontend/packages/ui-components
    yarn install --pure-lockfile
    yarn build
    yarn link
 ```
 
 Install deps and link web-app
 ```
    cd frontend/packages/web-app
    yarn install --pure-lockfile
    yarn link @aragon/ui-components
 ```

 Start development server
 ```
    npm run dev
````

### Contracts

 Install deps
 ```
    npm install 
 ```

  Compile
 ```
    npx hardhat compile
 ```

   Test
 ```
    npm test
 ```