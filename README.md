# node-red-contrib-ads-client

[![npm version](https://img.shields.io/npm/v/node-red-contrib-ads-client)](https://www.npmjs.org/package/node-red-contrib-ads-client)
[![GitHub](https://img.shields.io/badge/View%20on-GitHub-brightgreen)](https://github.com/jisotalo/node-red-contrib-ads-client)
[![License](https://img.shields.io/github/license/jisotalo/ads-server)](https://choosealicense.com/licenses/mit/)

Beckhoff TwinCAT ADS client library for Node-RED (unofficial).

Connect to a Beckhoff TwinCAT automation system using the ADS protocol from Node-RED. 
This is a wrapper over the battle-tested [ads-client](https://github.com/jisotalo/ads-client) Node.js library.

# Project status

xx.09.2025 - version 2 released!

- Based on ads-client v.2
- See [CHANGELOG](https://github.com/jisotalo/node-red-contrib-ads-client/blob/master/CHANGELOG.md) for details and migration.
- See also [ads-client changelog](https://github.com/jisotalo/node-red-contrib-ads-client/blob/master/CHANGELOG.md) for more details
  
# Features
- Supports TwinCAT 2 and 3
- Supports connecting to the local TwinCAT 3 runtime 
- Supports any kind of target systems with ADS protocol (local runtime, PLC, EtherCAT I/O...)
- Supports multiple connections from the same host
- Reading and writing any kind of variables
- Subscribing to variable value changes (ADS notifications)
- Automatic conversion between PLC and Javascript objects
- Calling function block methods (RPC)
- Automatic 32/64 bit variable support (PVOID, XINT, etc.)
- Automatic byte alignment support (all pack-modes automatically supported)
- Handles TwinCAT restarts, configuration changes and PLC software updates automatically 

# Support

* Bugs and feature requests: 
  * [Github Issues](https://github.com/jisotalo/node-red-contrib-ads-client/issues)
* ads-clien related help, support and discussion: 
  * [Github Discussions @ ads-client](https://github.com/jisotalo/ads-client/discussions)
  
If you want to support my work, you can buy me a coffee! Contact for more options. 

<a href="https://www.buymeacoffee.com/jisotalo" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

[![Donate](https://img.shields.io/badge/Donate-PayPal-yellow)](https://www.paypal.com/donate/?business=KUWBXXCVGZZME&no_recurring=0&currency_code=EUR)

If you need help with integrating the ads-client, I'm available for coding work with invoicing. Contact for further details. 

# Installing
```bash
cd ~/.node-red
npm i node-red-contrib-ads-client
```
# Documentation

Please see [ads-client documentation](https://jisotalo.fi/ads-client/classes/Client.html) for more details and help. 
This is just a wrapper over it so documentation is kept short.

Each node has its own built-in documentation - see the help under each node in Node-RED.

![image](./img/node-red-help.png)

# Available nodes

**NOTE:**
At the moment, not all ads-client features are converted to the Node-RED nodes. This will hopefully improve in the future - contributions are welcome!

| Node                      | Description                                                                                                                                                     | Equivalent in [ads-client](https://github.com/jisotalo/ads-client)                                               |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| ADS - Connection Status   | Reports status changes of the selected ADS connection.                                                                                                          | [`connect`, `disconnect` and `reconnect` events](https://jisotalo.fi/ads-client/interfaces/AdsClientEvents.html) |
| ADS - Read Value          | Reads variable's value from the target system by a variable path (such as `GVL_Test.ExampleStruct`) and returns the value as a Javascript object.               | [`readValue()`](https://jisotalo.fi/ads-client/classes/Client.html#readValue)                                    |
| ADS - Write Value         | Writes variable's value to the target system by a variable path (such as `GVL_Test.ExampleStruct`). Converts the value from a Javascript object to a raw value. | [`writeValue()`](https://jisotalo.fi/ads-client/classes/Client.html#writeValue)                                  |
| ADS - Subscribe Value     | Subscribes to value change notifications (ADS notifications) by a variable path, such as `GVL_Test.ExampleStruct`.                                              | [`subscribeValue()`](https://jisotalo.fi/ads-client/classes/Client.html#subscribeValue)                          |
| ADS - Invoke RPC Method   | Invokes a function block RPC method on the target system.                                                                                                       | [`invokeRpcMethod()`](https://jisotalo.fi/ads-client/classes/Client.html#invokeRpcMethod)                        |
| ADS - Read Runtime State  | Reads target PLC runtime state (`Run`, `Stop` etc.)                                                                                                             | [`readPlcRuntimeState()`](https://jisotalo.fi/ads-client/classes/Client.html#readPlcRuntimeState)                |
| ADS - Read TcSystem State | Reads target TwinCAT system state from ADS port 10000 (usually `Run` or `Config`).                                                                              | [`readTcSystemState()`](https://jisotalo.fi/ads-client/classes/Client.html#readTcSystemState)                    |
| ADS - Get Symbols         | Returns all symbols from the target PLC runtime.                                                                                                                | [`getSymbols()`](https://jisotalo.fi/ads-client/classes/Client.html#getSymbols)                                  |
| ADS - Get Symbol          | Returns a symbol object for given variable path (such as `GVL_Test.ExampleStruct`).                                                                             | [`getSymbol()`](https://jisotalo.fi/ads-client/classes/Client.html#getSymbol)                                    |
| ADS - Read Raw            | Reads raw data from the target system by a raw ADS address (index group, index offset and data length).                                                         | [`readRaw()`](https://jisotalo.fi/ads-client/classes/Client.html#readRaw)                                        |
| ADS - Write Raw           | Writes raw data to the target system by a raw ADS address (index group, index offset and data length).                                                          | [`writeRaw()`](https://jisotalo.fi/ads-client/classes/Client.html#writeRaw)                                      |
| ADS - Convert To Raw      | Converts a Javascript object to raw data by using the provided data type.                                                                                       | [`convertToRaw()`](https://jisotalo.fi/ads-client/classes/Client.html#convertToRaw)                              |
| ADS - Convert From Raw    | Converts raw data to a Javascript object by using the provided data type.                                                                                       | [`convertFromRaw()`](https://jisotalo.fi/ads-client/classes/Client.html#convertFromRaw)                          |

# Getting started
After you have installed the package and restarted Node-RED, you should see ADS nodes in the node list.

![image](./img//nodes-in-node-red.png)

## Adding a connection

1. Drag any ADS node to the flow, such as `ADS - Read Value`
2. Double click the node
3. Next to **ADS connection** setting, press + button to add a new connection

![image](./img/adding-connection.png)

4. Enter a friendly name to the connection
5. Enter target settings
    - `Target AmsNetId` - Target PLC AmsNetId
    - `Target ADS port` - Target runtime ADS port
    - For help and more, see [ads-client documentation](https://jisotalo.fi/ads-client/interfaces/AdsClientSettings.html) and [ads-client README](https://github.com/jisotalo/ads-client/)
6. Press Add. A new ADS connection is created.
   
## Examples

The [`./examples/example-all-nodes.json`](./examples/example-all-nodes.json) includes an example for each node.
Import it to Node-RED to test it.

The example connects to a PLC runtime at `192.168.4.1.1.1` (local usermode runtime) and 
requires a running [ads-client-test-plc-project](https://github.com/jisotalo/ads-client-test-plc-project). 

![image](./img//example-all-nodes.png)

# FAQ

See [ads-client README](https://github.com/jisotalo/ads-client?tab=readme-ov-file#common-issues-and-questions)

# License

Licensed under [MIT License](http://www.opensource.org/licenses/MIT).

Copyright (c) Jussi Isotalo <<j.isotalo91@gmail.com>>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
