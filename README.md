# node-red-contrib-ads-client (TwinCAT ADS client for Node-RED)


[![npm version](https://img.shields.io/npm/v/node-red-contrib-ads-client)](https://www.npmjs.org/package/node-red-contrib-ads-client)
[![GitHub](https://img.shields.io/badge/View%20on-GitHub-brightgreen)](https://github.com/jisotalo/node-red-contrib-ads-client)
[![License](https://img.shields.io/github/license/jisotalo/ads-server)](https://choosealicense.com/licenses/mit/)

TwinCAT ADS client for Node-RED (unofficial). Basically a Node-RED wrapper on battle-tested [ads-client](https://github.com/jisotalo/ads-client) Node.js library.



# Project status

**TEST VERSION NOT FOR PRODUCTION**

First release. Not for production, everything might still change.

Please see [ads-client](https://github.com/jisotalo/ads-client) README for help at this point.


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

Coming up later.

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
