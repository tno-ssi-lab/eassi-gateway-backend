# TNO SSI Service Provider Backend

This repository contains the backend for the SSI Service created by TNO.
It should be run in conjunction with the other necessary services
(frontend, irma, db, etc.). Deployment configurations for running the
entire service are provided in a separate repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Migrations

We use the `typeorm` library for managing the database. A dev/prod and
nest/typeorm-cli compatible ormconfig can be found in
`src/ormconfig.ts`. Some helper scripts have been defined in
`package.js`.

```bash
# run typeorm command
$ npm run typeorm <your command>

# create new migration
$ npm run typeorm:migrate <migration name (PascalCase)>

# run migrations
$ npm run typeorm:run
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
## Jolocom

The Jolocom connector will not work out-of-the-box. For more information, keep
reading.

The default Jolocom implementation is built on top of the Ethereum Blockchain.
The blockchain is used as the "Verifiable Data Registry". This registry allows
DIDs to be translated into DID documents.

For testing purposes, the development version of Jolocom includes a "Ethereum
Smart Contract" on the Rinkeby Testnet. Since The Merge however, the Rinkeby
Testnet has been deprecated and removed.

To use the Jolocom connector, you will therefore need to deploy your own Smart
Contract to act as the Verifiable Data Registry. This section describes one way
of doing this.

1. Setup a Wallet (for yourself, not an organisation)
   1. Download an Ethereum Wallet (MetaMask recommended, which works in-browser and is widely supported). Make sure to use and write down your seed phrase.
   2. Add the Sepolia Testnet to your Wallet by browsing `https://sepolia.dev/` and
      pressing "Add to MetaMask"
2. Connect to a Blockchain Node (Provider). You can (in theory) run your own node, but its quickest and easiest to use a Blockhain Node Provider such as Alchemy:
   1. Create an account on `alchemy.com`
   2. Create an App on `dashboard.alchemy.com`. Note down the API Key.
3. Deploy the Smart Contract
   1. Install Node v14
      - The current project only works (as far as I can tell) with Node v14
      - Installing an older Node version is most easily achieved using [Node Version Manager](https://github.com/nvm-sh/nvm)
      - i.e. using the command `nvm install lts/fermium`
   2. Clone the repository
      - `git clone jolocom/jolo-did-method`
   3. Navigate to the contract package
      - `cd packages/registry-contract`
   4. Add the Sepolia Testnet to `truffle.config.js`:
      ```javascript
      ...
      const HDWalletProvider = require("@truffle/hdwallet-provider");

      module.exports = {
          networks: {
              sepolia: {
                  provider: () => {
                      return new HDWalletProvider(
                          "<YOUR WALLET SEED PHRASE / MNEMONIC",
                          "https://eth-sepolia.g.alchemy.com/v2/<YOUR ALCHEMY API KEY>"
                      );
                  },
                  network_id: 11155111,
              },
              ...
          },
          ...
      };
      ```
   5. Install dependencies
      - `npm ci && npm install @truffle/hdwallet-provider && npm install --global truffle`
   6. Deploy the contract on the Sepolia Testnet
      - `trouble deploy --network sepolia`
      - Make sure to write down the address at which your contract is deployed
4. Configure the backend to use your new smart contract
    - Set the following environment variables
        - `JOLOCOM_PROVDER_URL` with `https://eth-sepolia.g.alchemy.com/v2/<YOUR ALCHEMY API KEY>` (if you opted to use Alchemy)
        - `JOLOCOM_CONTRACT_ADDRESS` with the address at which your contract is deployed
    - If you are using `eassi-deployment`, set these in the `.env` file
5. Fix the leaky faucet
    - Unfortunately, the default faucet used by the Jolocom library internally
      is in need of a plumber (it was a Rinkeby faucet which is offline). The
      backend repository includes a `helper.js.patch` file which alters the
      `jolocom-lib` to wait for 60 seconds after creating a Wallet (generating
      its cryptographic keypair) before anchoring it on the blockchain
      (registering it to the registy smart contract, which requires
      ethereum/fuel). In these 60 seconds, you have the time to copy the Wallet
      address (see the console output) and send funds to it, so that the Wallet
      anchoring process can succeed.
    - The patch file can be applied as follows (assuming you currently reside in
      the root of this repository):
        - `patch -p1 < ./helper.js.patch`
        - Or perform this directly in the docker container (easier):
            `docker compose -f ./docker-compose.dev.yml run backend sh -c "path -p1 < ./helper.js.patch"`

## License

Nest is [MIT licensed](LICENSE).
