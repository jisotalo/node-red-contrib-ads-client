const ads = require("ads-client");
const EventEmitter = require("events");

class ConnectionEventEmitter extends EventEmitter {}

module.exports = function (RED) {
  function AdsClientConnection(config) {
    RED.nodes.createNode(this, config);

    this.adsClient = null;
    this.connecting = null;
    this.retryTimer = null;
    this.eventEmitter = new ConnectionEventEmitter();
    this.connected = false;
    this.firstConnectedEventSent = false;

    //Properties
    this.name = config.name;

    this.debugLevel = 0;

    this.connectionSettings = {
      allowHalfOpen: config.allowHalfOpen,
      autoReconnect: config.autoReconnect,
      //connectionCheckInterval: undefined,
      //connectionDownDelay: undefined,
      convertDatesToJavascript: config.convertDatesToJavascript,
      deleteUnknownSubscriptions: config.deleteUnknownSubscriptions,
      disableCaching: config.disableCaching,
      forceUtf8ForAdsSymbols: config.forceUtf8ForAdsSymbols,
      hideConsoleWarnings: config.hideConsoleWarnings,
      //localAddress: undefined,
      //localAdsPort: undefined,
      //localAmsNetId: undefined,
      //localTcpPort: undefined,
      monitorPlcSymbolVersion: config.monitorPlcSymbolVersion,
      objectifyEnumerations: config.objectifyEnumerations,
      rawClient: config.rawClient,
      readAndCacheDataTypes: config.readAndCacheDataTypes,
      readAndCacheSymbols: config.readAndCacheSymbols,
      //reconnectInterval: undefined,
      //routerAddress: undefined,
      //routerTcpPort: undefined,
      targetAdsPort: config.targetAdsPort,
      targetAmsNetId: config.targetAmsNetId,
      //timeoutDelay: undefined
    };

    //Overriding optional settings that are provided
    //Boolean settings already have same defaults as ads-client does
    if (config.debugLevel != null && config.debugLevel !== "") {
      this.debugLevel = parseInt(config.debugLevel);
    }

    if (config.connectionCheckInterval != null && config.connectionCheckInterval !== "") {
      this.connectionSettings.connectionCheckInterval = parseInt(config.connectionCheckInterval);
    }

    if (config.connectionDownDelay != null && config.connectionDownDelay !== "") {
      this.connectionSettings.connectionDownDelay = parseInt(config.connectionDownDelay);
    }

    if (config.localAddress != null && config.localAddress !== "") {
      this.connectionSettings.localAddress = config.localAddress;
    }

    if (config.localAdsPort != null && config.localAdsPort !== "") {
      this.connectionSettings.localAdsPort = parseInt(config.localAdsPort);
    }

    if (config.localAmsNetId != null && config.localAmsNetId !== "") {
      this.connectionSettings.localAmsNetId = config.localAmsNetId;
    }

    if (config.localTcpPort != null && config.localTcpPort !== "") {
      this.connectionSettings.localTcpPort = parseInt(config.localTcpPort);
    }

    if (config.reconnectInterval != null && config.reconnectInterval !== "") {
      this.connectionSettings.reconnectInterval = parseInt(config.reconnectInterval);
    }

    if (config.routerAddress != null && config.routerAddress !== "") {
      this.connectionSettings.routerAddress = config.routerAddress;
    }

    if (config.routerTcpPort != null && config.routerTcpPort !== "") {
      this.connectionSettings.routerTcpPort = parseInt(config.routerTcpPort);
    }

    if (config.timeoutDelay != null && config.timeoutDelay !== "") {
      this.connectionSettings.timeoutDelay = parseInt(config.timeoutDelay);
    }

    /**
     * This is called from ads-client when connect or disconnect
     * events are thrown. The reason for this is that the ads-client might send
     * multiple events even though the connected state hasn't changed (filtering the real changes here)
     * @param {*} connected
     */
    this.onConnectedStateChange = (connected) => {
      if (this.connected != connected || !this.firstConnectedEventSent) {
        //Changed
        if (connected) {
          this.eventEmitter.emit("connected", true);
        } else {
          this.eventEmitter.emit("connected", false);
        }
      }

      this.connected = connected;
      this.firstConnectedEventSent = true;
    };

    /**
     * Connect to the target (internal)
     * @returns
     */
    const _connect = async (silence) => {
      if (!silence) {
        this.log(`Connecting to ${this.connectionSettings.targetAmsNetId}:${this.connectionSettings.targetAdsPort}...`);
      }

      try {
        //First try to disconnect the previous session if there is one
        if (this.adsClient) {
          try {
            await this.adsClient.disconnect();
          } catch (err) {
            //Failed to disconnect, however continue
          } finally {
            delete this.adsClient;
          }
        }

        this.adsClient = new ads.Client(this.connectionSettings);

        this.adsClient.setDebugLevel(parseInt(this.debugLevel));

        this.adsClient.on("connect", () => this.onConnectedStateChange(true));
        this.adsClient.on("disconnect", () => this.onConnectedStateChange(false));

        const res = await this.adsClient.connect();

        if (!silence) {
          this.log(`Connected to ${this.connectionSettings.targetAmsNetId}:${this.connectionSettings.targetAdsPort}!`);
        }
        return res;
      } catch (err) {
        //Try again every 2000 ms or so but only if client is not deleted
        //If node-red node is deleted but connection has been running, this prevents trying again when we shouldn't
        if (this.adsClient) {
          const retryInterval = this.connectionSettings.reconnectInterval ? this.connectionSettings.reconnectInterval : this.adsClient.settings.reconnectInterval;

          if (!silence) {
            this.log(`Connecting to ${this.connectionSettings.targetAmsNetId}:${this.connectionSettings.targetAdsPort} failed, keeping trying..`);
          }

          this.onConnectedStateChange(false);
          clearTimeout(this.retryTimer);

          this.retryTimer = setTimeout(async () => {
            try {
              //Call again but with silent mode
              await this.connect(true);
            } catch (err) {
              //Nothing to do here as it will be called again
            }
          }, retryInterval);
        } else {
          this.log(`Connecting to ${this.connectionSettings.targetAmsNetId}:${this.connectionSettings.targetAdsPort} failed and node probably deleted, doing nothing..`);
        }

        this.formatError(err);
        //Throwing the error so caller knows that no success..
        throw err;
      }
    };

    /**
     * Connects to the target
     * @returns
     */
    this.connect = async (silence) => {
      clearTimeout(this.retryTimer);

      //If no one is trying to connect => make new connect call, else reuse previously started connect call
      let firstConnectCall = false;

      if (!this.connecting) {
        this.connecting = _connect(silence);
        firstConnectCall = true;
      }

      try {
        const res = await this.connecting;
        return res;
      } catch (err) {
        throw err;
      } finally {
        //First caller clears connecting function(=flag)
        if (firstConnectCall) {
          this.connecting = null;
        }
      }
    };

    /**
     * Returns the active client instance
     * @returns
     */
    this.getClient = () => this.adsClient;

    /**
     * Returns true if connected, otherwise false
     * @returns
     */
    this.isConnected = () => (this.adsClient === null ? false : this.adsClient.connection.connected && !this.isConnecting());

    /**
     * Returns true if connected, otherwise false
     * @returns
     */
    this.isConnecting = () => (this.connecting === null ? false : true);

    /**
     * Returns event emitter for ads-client-connection events
     * @returns
     */
    this.getEventEmitter = () => this.eventEmitter;

    /**
     * Helper that formats the given ads-client error to object that can be debugged in Node-RED
     * @param {*} err
     */
    this.formatError = (err, msg) => {
      if (err.adsError) {
        if (typeof msg === "object" && msg !== null) {
          msg.adsError = err.adsError;
        }
        err.message = `${err.message} - ADS error ${err.adsError.errorCode} (${err.adsError.errorStr})`;
      }
      return err;
    };

    /**
     * Stringifies the error object better
     * @param {*} err
     * @returns
     */
    this.stringifyError = (err) => JSON.stringify(err, Object.getOwnPropertyNames(err));

    //When node is closed, we should disconnect
    this.on("close", async (removed, done) => {
      clearTimeout(this.retryTimer);

      this.log(`Disconnecting from ${this.connectionSettings.targetAmsNetId}:${this.connectionSettings.targetAdsPort} and unsubscribing from all...`);

      if (this.adsClient === null) {
        done();
        return;
      }

      try {
        //Note: If not connected, call disconnect(true). It means that we haven't successfully connected so it's better to just destroy socket
        await this.adsClient.disconnect(!this.adsClient.connection.connected);
        this.log(`Disconnected from ${this.connectionSettings.targetAmsNetId}:${this.connectionSettings.targetAdsPort}`);
      } catch (err) {
        this.warn(`Disconnecting from ${this.connectionSettings.targetAmsNetId}:${this.connectionSettings.targetAdsPort} caused an error but client deleted anyways: ${err}`);
      } finally {
        this.adsClient = null;
        done();
      }
    });

    //Finally, try to connect immediately
    this.connect().catch((err) => {
      this.warn(`Failed to connect ${this.connectionSettings.targetAmsNetId}:${this.connectionSettings.targetAdsPort} at startup: ${err}`);
    });
  }

  RED.nodes.registerType("ads-client-connection", AdsClientConnection);
};
