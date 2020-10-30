# Elrond SDK for JavaScript

Elrond SDK for JavaScript and TypeScript (written in TypeScript).

**Under development, stay tuned!**

Features:
 - Transaction construction, signing, broadcasting and querying.
 - Smart Contracts deployment and interaction (execution and querying).

## Usage



## Installation

`erdjs` is delivered via [npm](https://www.npmjs.com/package/@elrondnetwork/erdjs), therefore it can be installed as follows:

```
npm install @elrondnetwork/erdjs
```

## Development

Feel free to skip this section if you are not a contributor.

### Prerequisites

`browserify` is required to compile the browser-friendly versions of `erdjs`. It can be installed as follows:

```
npm install --global browserify
```

### Building the library

In order to compile `erdjs`, run the following:

```
npm install
npm run compile
npm run compile-browser
npm run compile-browser-min
```

### Running the tests

In order to run the tests, do as follows:

```
npm run test
npm run test-local-testnet
npm run test-testnet
npm run test-mainnet
```

For the `local-testnet` tests, make sure you have a Testnet running locally. A local Testnet can be started from the Elrond IDE or from [erdpy](https://docs.elrond.com/developers/setup-a-local-testnet-erdpy).
