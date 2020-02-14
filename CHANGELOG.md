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