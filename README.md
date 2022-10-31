# node-red-contrib-ads-client (TwinCAT ADS client for Node-RED)


[![npm version](https://img.shields.io/npm/v/node-red-contrib-ads-client)](https://www.npmjs.org/package/node-red-contrib-ads-client)
[![GitHub](https://img.shields.io/badge/View%20on-GitHub-brightgreen)](https://github.com/jisotalo/node-red-contrib-ads-client)
[![License](https://img.shields.io/github/license/jisotalo/ads-server)](https://choosealicense.com/licenses/mit/)

TwinCAT ADS client for Node-RED (unofficial). Basically a Node-RED wrapper on battle-tested [ads-client](https://github.com/jisotalo/ads-client) Node.js library.



# Project status

The `ads-client` library used under the hood is battle-tested and reliable.

Not all features are yet in this Node-RED port version work is in progress.


# Features
Target is to have all same features as the [ads-client](https://github.com/jisotalo/ads-client) has.
- TwinCAT 2 and TwinCAT 3 support
- Supports connecting to the local TwinCAT 3 runtime (see [enabling localhost support](https://github.com/jisotalo/ads-client#localhost-support))
- Supports multiple connections from the same host
- Reading and writing all any PLC variable
- Subscribing to PLC variables (ADS notifications)
- Automatic conversion between PLC<->Javascript objects
- PLC symbol and data type handling and caching
- Automatic 32/64 bit variable support (PVOID, XINT, etc.)
- Automatic cache and subscription refreshing when PLC program changes or system starts
- Automatic byte alignment support (all pack-modes automatically supported) 

# Installing
```bash
cd ~/.node-red
npm i node-red-contrib-ads-client
```
# Important
Please make sure you also read [ads-client README](https://github.com/jisotalo/ads-client) as it has lots of valuable information.

# Available nodes

Please see help of the each node in Node-RED help window for instructions and more info.

![image](https://user-images.githubusercontent.com/13457157/120095317-f9965480-c12d-11eb-85c4-87743f5218a4.png)

The following nodes are available at this point:

| Node | Description | Equivalent in [ads-client](https://github.com/jisotalo/ads-client)  | More info |
| --- | --- | --- | --- |
| ADS - Connection Status | Reports status changes of the selected ADS connection. | `connect`, `disconnect` and `reconnect` events | |
| ADS - Read Symbol | Reads any kind of variable by given variable name. | `readSymbol()` | [README](https://github.com/jisotalo/ads-client#reading-any-type-plc-variable)
| ADS - Write Symbol | Writes given value to any kind of variable by given variable name. | `writeSymbol()` | [README](https://github.com/jisotalo/ads-client#writing-any-type-plc-variable)
| ADS - Subscribe | Subscribes to given variable to receive notifications. | `subscribe()` | [README](https://github.com/jisotalo/ads-client#subscribing-to-plc-variables-device-notifications)
| ADS - Invoke RPC Method | Calls a function block method with parameters using RPC (remote procedure call). | `invokeRpcMethod()` | [README](https://github.com/jisotalo/ads-client#writing-any-type-plc-variable)
| ADS - Read Runtime State | Reads TwinCAT PLC runtime state (run, stop) from given ADS port. | `readPlcRuntimeState()` | [README](https://github.com/jisotalo/ads-client#starting-and-stopping-the-plc)
| ADS - Read System Manager State | Reads TwinCAT System Manager state from target (using ADS port 10000). | `readSystemManagerState()` | [README](https://github.com/jisotalo/ads-client#starting-and-stopping-the-twincat-system)
| ADS - Get Symbol Info | Returns symbol information for given variable/symbol. | `getSymbolInfo()` | [README](https://github.com/jisotalo/ads-client#writing-any-type-plc-variable)
| ADS - Read Raw | Reads (raw byte) data from PLC by given index group, index offset and size. | `readRaw()` | [README](https://github.com/jisotalo/ads-client#reading-a-single-raw-value)
| ADS - Write Raw | Writes (raw byte) buffer data to PLC by given index group and index offset. | `writeRaw()` | [README](https://github.com/jisotalo/ads-client/#writing-a-single-raw-value)
| ADS - Convert To Raw | Converts given Javascript object/variable to raw Buffer data by given data type (like REAL, ST_Struct). | `convertToRaw()` | [README](https://github.com/jisotalo/ads-client#converting-a-javascript-object-to-raw-value)
| ADS - Convert From Raw | Converts given raw data (byte Buffer) to Javascript object by given data type (like REAL, ST_Struct). | `convertFromRaw()` | [README](https://github.com/jisotalo/ads-client#converting-a-raw-value-to-javascript-object)

# Getting started
After you have installed the package and restarted Node-RED, you should see the available ADS nodes in your nodes list.

![image](https://user-images.githubusercontent.com/13457157/120094639-33655c00-c12a-11eb-86b0-39a232a43011.png)


## Creating a connection (and reading a value)

You need to create a configuration (ads-client instance) to every target PLC you will use. To do this, you need to add one node to the flow first. 

In this example we have `GVL_Test.MyStringVariable` in the PLC.
![image](https://user-images.githubusercontent.com/13457157/120095366-54c84700-c12e-11eb-8a72-20be82c27f21.png)

1. Drag a `ADS - Read Symbol` node to the flow
2. Double click the node
3. Under ADS connection it should state `Add new ads-client-connection...`, -> click the edit  icon next to it.
4. (Optional) Give a name to the connection
5. **NOTE**: See [ads-client readme](https://github.com/jisotalo/ads-client) for different connection setups (like Windows, Raspberry etc.) 
6. Setup target settings
    - `Target AmsNetId` - Target PLC AmsNetId (like `localhost`, `192.168.1.5.1.1` and so on)
    - `Target ADS port` - Target runtime ADS port (like `851` for TwinCAT 3 runtime 1)
7. Setup optional settings
    - See [ads-client settings documentation](https://jisotalo.github.io/ads-client/global.html#Settings)
8. Press Add
9. In Read Symbol node, enter variable name you want to read
    - Example: `GVL_Test.MyStringVariable`
10. Press done
11. Drag an `inject` node to the flow
12. Connect its output to the input of the Read Symbol node
13. Drag a `debug` node to the flow
14. Connect output of the Read Symbol node to the debug node input
13. Deploy the flow

Now pressing the button in inject node will command the Read Symbol node to read value from PLC. The value (or error) will be shown in debug window.

![AX0qYcBOCp](https://user-images.githubusercontent.com/13457157/120095242-8856a180-c12d-11eb-8d0d-d9782a80ed4b.gif)

**Example to import**
```json
[{"id":"290b97f1.b47728","type":"tab","label":"Flow 1","disabled":false,"info":""},{"id":"3f5e8355.09cafc","type":"ads-client-read-symbol","z":"290b97f1.b47728","name":"","connection":"bbd41d0d.87aac","variableName":"GVL_Test.MyStringVariable","x":230,"y":120,"wires":[["48a7c812.ab1db8"]]},{"id":"8b366e5a.37926","type":"inject","z":"290b97f1.b47728","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":130,"y":40,"wires":[["3f5e8355.09cafc"]]},{"id":"48a7c812.ab1db8","type":"debug","z":"290b97f1.b47728","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","statusVal":"","statusType":"auto","x":200,"y":220,"wires":[]},{"id":"bbd41d0d.87aac","type":"ads-client-connection","name":"Local PLC","targetAmsNetId":"localhost","targetAdsPort":"851","objectifyEnumerations":true,"convertDatesToJavascript":true,"readAndCacheSymbols":false,"readAndCacheDataTypes":false,"disableSymbolVersionMonitoring":false,"routerTcpPort":"","routerAddress":"","localAddress":"","localTcpPort":"","localAmsNetId":"","localAdsPort":"","timeoutDelay":"","hideConsoleWarnings":false,"autoReconnect":true,"reconnectInterval":"","checkStateInterval":"","connectionDownDelay":"","allowHalfOpen":false,"disableBigInt":false}]
```

# FAQ

* I'm having connection problems
  * See [ads-client FAQ](https://github.com/jisotalo/ads-client#faq) and [ads-client issues](https://github.com/jisotalo/ads-client/issues?q=is%3Aissue)

* How to get debugging information?
  * Set `Debugging level` of ADS connection to 3 under connection settings.
  * Output can be found from node-red console/terminal (see this [issue comment](https://github.com/jisotalo/ads-client/issues/99#issuecomment-1290124588))

# License

Licensed under [MIT License](http://www.opensource.org/licenses/MIT) so commercial use is possible. Please respect the license, linking to this page is also much appreciated.

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
