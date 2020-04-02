# Change Log

All notable changes will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.4]

- Initial release

## [0.0.5]

### Fixed

- Include **psutil** in the list of dependencies in `setup.py`.
- Handle missing / `none` arguments at deploy.
- Default to current directory in `build` command.
- Allow paths starting with `~` when specifying PEM.
- Forward gas limit, gas price parameters correctly.

### Changed

- Improve example for testnet to allow query after deploy.

## [0.0.6]

### Fixed

- Default to current directory in `build` command.

## [0.0.7]

### Added

- Enabled test runner: `erdpy test --wildcard='*'`

## [0.0.8]

### Fixed

- Set `LD_LIBRARY_PATH` before executing `nodedebug` and `testrunner`.

## [0.0.9]

### Fixed

- Fixed passing environment variables to test runner.

## [0.1.0]

### Fixed

- Fixed node-debug stdout & stderr decode.

### Other

- Updated reference to node-debug.
- SOLL migration in progress (Solidity build does not work yet).

## [0.1.1]

### Fixed

- Fixed Solidity / SOLL buildchain.

## [0.1.2]

### Fixed

- Default to current directory for `erdpy deploy`.

## [0.1.3]

### Fixed

- Fix passing arguments for command `erdpy call`.

## [0.1.4]

### Fixed

- Fix passing arguments for command `erdpy query`.

## [0.1.5]

### Fixed

- For MacOS `chmod +x` upon downloading SOLL, nodedebug.

## [0.1.6]

### Fixed

- Downloads performed using `requests` module (certificate errors on MacOS otherwise).

## [0.1.7]

### Fixed

- Node-debug build for MacOS.

### Other

- Updated reference to node-debug.

## [0.1.9]

### Fixed

- Transaction signing - updated to **Ed25519**
- Removed **node-debug** from the testnet flows (deployment and execution of smart contracts)
- Fixed contract project generation from Rust templates
- Minor fixes on the build flow.

### Other

- Temporarily disabled node-debug interaction (node-debug's place will be soon taken by a debug version of Arwen VM)
- Added extra command to prepare and send transactions against the testnet
- Added extra examples.

## [0.2.0]

### Fixed

- Fixed getting metrics from testnet.

### Other

- Temporarily disabled transaction costs estimators.

## [0.2.1]

### Fixed

- Fixed reference to pycryptodomex.