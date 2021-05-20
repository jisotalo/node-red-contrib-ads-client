# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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