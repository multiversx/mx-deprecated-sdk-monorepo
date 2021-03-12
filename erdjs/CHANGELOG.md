# Change Log

All notable changes will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [3.0.0] - 03.03.2021
 - [Switched from nativ BigInt to bignumber.js #218](https://github.com/ElrondNetwork/elrond-sdk/pull/218)

## [2.3.0] - 16.02.2021
 - [Minor bugfixes and new getNetworkStats function #203](https://github.com/ElrondNetwork/elrond-sdk/pull/203)

## [2.2.2] - 11.02.2021
 - [Walletcore minor fixes on Uint8Array casting before Buffers are passet to tweetnacl #198](https://github.com/ElrondNetwork/elrond-sdk/pull/198)

## [2.2.1] - 10.02.2021
 - [Walletcore improvements - minor fixes on PEM parsing, added tests #195](https://github.com/ElrondNetwork/elrond-sdk/pull/195)

## [2.2.0] - 09.02.2021
 - [Add api provider and userName to getAccount #191](https://github.com/ElrondNetwork/elrond-sdk/pull/191)

## [2.1.0] - 05.02.2021
 - [Add logout on dapp #183](https://github.com/ElrondNetwork/elrond-sdk/pull/183)

## [2.0.0] - 03.02.2021
 - [Fix query http request #178](https://github.com/ElrondNetwork/elrond-sdk/pull/178)

## [1.1.9] - 03.02.2021
 - [Add handling for null on Contract return data #160](https://github.com/ElrondNetwork/elrond-sdk/pull/160)

## [1.1.8] - 15.01.2021

 - Publish erdjs via Github Actions #151.
 - Minor fixes for dApps (wallet integration) #153.

## [1.1.7] - 15.01.2021

- Bring core-js into erdjs (user wallets & signing, validator signing).
- Run all tests (unit and integration) in browser, as well.
- Separate builds: erdjs with / without wallet components.


## [1.1.5] - 06.01.2021
 - Updated axios library due to security vulnerabilities.

## [1.1.4] - 10.12.2020
 - Add some utility functions for ABI (needed for some interaction examples among SC templates).

## [1.1.3] - 03.12.2020

Pull requests:
 - [New type system (with generics), codecs (elrond-wasm alike) and ABI prototype.](https://github.com/ElrondNetwork/elrond-sdk/pull/87)
 - [Compute TX hash off-line](https://github.com/ElrondNetwork/elrond-sdk/pull/93)

In more detail:
 - New typing system to better match elrond-wasm's typing system (our standard typing system for smart contracts). Generics (simple or nested) included.
 - ABI prototype (functions, structures).
 - Codec utilities
 - Optional arguments supported as well.
 - Compute TX hash in an off-line fashion (not relying on the Node / Proxy).

Breaking changes:
 - Members of `Argument` class have been renamed.
 - Members of `Balance` class have been renamed.

## [1.1.2] - 17.11.2020
 - Removed useless check and add the current Ledger selection as sender.

## [1.1.1] - 17.11.2020
 - Corrected transaction object sent to the wallet provider.

## [1.1.0] - 13.11.2020
 - Add elrond-wallet and hardware wallet support.

## [1.0.8] - 03.11.2020
 - Export `backendSigner` as well (for `NodeJS` version).
 - Fix (update) the example `backend-dispatcher`.

## [1.0.7] - 02.11.2020
 - Moved release `1.0.7` out of beta.

## [1.0.7-beta1] - 30.10.2020

 - Added comments & documentation.
 - Implemented utilities for contract queries.
 - Made `erdjs` smaller, for loading in browsers.
 - Applied several steps of refactoring.
 - Improved reporting of HTTP-related errors.
 - Fixed parsing of big integers in `axios` responses.
 - Implemented a simple logger component.
 - Improved tests (added more unit tests and integration tests).
 - Fixed implementation of `length()` for `TransactionPayload`.
