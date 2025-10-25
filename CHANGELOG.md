# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 25.10.2025

**IMPORTANT:** This is a major version update. There are **breaking changes**! 

This update changes to `ads-client` v2. See [ads-client CHANGELOG](https://github.com/jisotalo/ads-client/blob/master/CHANGELOG.md#202---14122024) for more details about the update.

### Breaking changes
- `Get Symbol Info` node renamed to `Get Symbol`
- `Read System Manager State` node renamed to `Read Tc System State`
- `Read Runtime State` node renamed to `Read PLC Runtime State` 
- `Read Symbol` node renamed to `Read Value`
- `Write Symbol` node renamed to `Write Value`
- `Subscribe` node renamed to `Subscribe Value`
- `Invoke RPC Method` setting properties changed
- `Subscribe` setting properties changed
- Target ADS port setting removed from all nodes - now always uses the one specified in client settings
  - In future, the usage of `targetOpts` will be available on all nodes as in ads-client

### Changes
- Added `Get Symbols` node
- Added `Read TC System Extended State` node
- Client settings updated to match ads-client v2
- Some sanity checks removed and left to end-user instead (e.g. checking data types of provided `topic` properties)
- Documentation updated
- README updated
- Minor cleanup here and there

## [1.4.0] - 31.10.2022
### Added
  - New new nodes
    - Read Raw
    - Write Raw
    - Convert To Raw
    - Convert From Raw
    - Get Symbol Info
  - Updated README
  - Updated ADS connection to have new client setting `bareclient`

## [1.3.2] - 08.08.2021
### Changed
  - Minor fix to prevent problems if connection is not enabled (see [pull request #16(https://github.com/jisotalo/node-red-contrib-ads-client/pull/16))
    - Thank you [Hopperpop](https://github.com/Hopperpop) for contribution!
  - Updated ads-client to 1.11.3

## [1.3.1] - 01.08.2021
### Changed
  - Minor fixes related to `ads-client-connection` to prevent connection loop and other problems during connection losses and special cases.
  - Hopefully fixing [issue #12](https://github.com/jisotalo/node-red-contrib-ads-client/issues/12)

## [1.3.0] - 07.07.2021
### Added
  - New setting for `ads-client-connection`: `Debugging level`
    - Possible to set `ads-client` debugging level from Node-RED
    - Easier to debug connection problems & library bugs
### Changed
  - Thank you [Hopperpop](https://github.com/Hopperpop) for contribution, awesome work!
    - Better support for nodes that operate at the same time
      - No more errors when all nodes try to connect to the PLC (`Already connecting to the target`)
      - Other nodes will wait for the result of the connection that the first node is creating
    - If first connection to the PLC fails at startup, warning is shown instead of error
  - Old `ads-client-connection` is always disconnected (if possible) in handled manner when (re)connecting

## [1.2.0] - 30.06.2021
### Added
  - New node `Connection Status` that reports ADS connection status changes
    - Automatically outputs latest connection status when changes detected
    - Can also be read manually using input trigger
    - Outputs true/false (ok/not ok) and connection info
  - New node `Read Runtime State` that implements ads-client library `readPlcRuntimeState()`
    - Possible to read PLC status (run, stop) from Node-RED
  - New node `Read System Manager State` that implements ads-client library `readSystemManagerState()`
    - Possible to read system manager status (run, config) from Node-RED
  - Updated `ADS connection` node
    - Automatically tries to connect to the target PLC in the background
    - Before the connection was retried only when reading/writing/subscribing
    - Now automatically connects when possible -> supports the new `Connection Status` node
  - Updated `Subscribe` node
    - Listens on connection state changes in a better way than before
    

## [1.1.1] - 30.05.2021
### Changed
  - Improved error handling (see [pull request #8](https://github.com/jisotalo/node-red-contrib-ads-client/pull/8))
    - Thank you [Hopperpop](https://github.com/Hopperpop) for contribution!
  - Updated README
    - Example how to configure and read value


## [1.1.0] - 20.05.2021
### Added
  - New node `Invoke RPC Method` that implements ads-client library `invokeRpcMethod()`
    - Possible to call function block methods from Node-RED
    - Thank you [Hopperpop](https://github.com/Hopperpop) for contribution!
    
### Changed
- `Subscribe` node
  - If connection is lost, status is updated
  - If no notifications received in configured time after reconnection, the node will try resubscribe (new setting `Resubscribe timeout [ms]`)
  - `ads-client` should automatically resubscribe everything, but this is just in case
- All nodes now have similar status shapes

## [1.0.4] - 18.05.2021
### Added
- Name properties to all nodes (also connection config -> PLCs can be named)

### Changed
- `Read Symbol` and `Write Symbol` nodes no longer clear the input message. Instead it's passed onwards.
- Added better support for error catching (`Subscribe` is still probably not working 100% with `Catch` nodes)
- Node status messages are now shorter and more compact
- Minor fixes and corrections

Bug fix: Subscribe node failed to subscribe when using it without input. Thank you [Hopperpop](https://github.com/Hopperpop) for contributing ([See issue #2](https://github.com/jisotalo/node-red-contrib-ads-client/issues/2))

## [1.0.3] - 18.05.2021
### Changed
- Bug fix: Subscribe node failed to subscribe when using it without input. Thank you [Hopperpop](https://github.com/Hopperpop) for contributing ([See issue #2](https://github.com/jisotalo/node-red-contrib-ads-client/issues/2))

## [1.0.2] - 17.05.2021
### Changed
- package.json fix

## [1.0.1] - 17.05.2021
### Changed
- Accidentally started npm versioning from 1.0.0 so here we are...

## [0.1.0] - 17.05.2021
### Added
- First release for testing
- Commands available
  - Read Symbol
  - Write Symbol
  - Subscribe