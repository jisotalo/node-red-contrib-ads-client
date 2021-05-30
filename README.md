# node-red-contrib-ads-client (TwinCAT ADS client for Node-RED)


[![npm version](https://img.shields.io/npm/v/node-red-contrib-ads-client)](https://www.npmjs.org/package/node-red-contrib-ads-client)
[![GitHub](https://img.shields.io/badge/View%20on-GitHub-brightgreen)](https://github.com/jisotalo/node-red-contrib-ads-client)
[![License](https://img.shields.io/github/license/jisotalo/ads-server)](https://choosealicense.com/licenses/mit/)

TwinCAT ADS client for Node-RED (unofficial). Basically a Node-RED wrapper on battle-tested [ads-client](https://github.com/jisotalo/ads-client) Node.js library.



# Project status

Not all nodes are yet developed, work is in progress. Readme is under development.

Please see [ads-client](https://github.com/jisotalo/ads-client) README for help at this point.

Available nodes at the moment
- Read Symbol
- Write Symbol
- Subscribe
- Invoke RPC method

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

# Getting started

## Documentation

Each node has it's own help/documentation available in the help window.

![image](https://user-images.githubusercontent.com/13457157/120095317-f9965480-c12d-11eb-85c4-87743f5218a4.png)

## After installing

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

# Other examples coming up later

# License

Licensed under [MIT License](http://www.opensource.org/licenses/MIT) so commercial use is possible. Please respect the license, linking to this page is also much appreciated.

Copyright (c) 2021 Jussi Isotalo <<j.isotalo91@gmail.com>>

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
