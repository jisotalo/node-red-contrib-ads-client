const ads = require('ads-client')
const EventEmitter = require('events');

class ConnectionEventEmitter extends EventEmitter { }

module.exports = function (RED) {

  function AdsClientConnection(config) {
    RED.nodes.createNode(this, config)

    this.adsClient = null
    this.connecting = null
    this.retryTimer = null
    this.eventEmitter = new ConnectionEventEmitter()
    this.connected = false
    this.firstConnectedEventSent = false
    
    //Properties
    this.name = config.name

    this.connectionSettings = {
      //ads-client settings (required)
      targetAmsNetId: config.targetAmsNetId,
      targetAdsPort: config.targetAdsPort,

      //ads-client settings (optional)
      objectifyEnumerations: config.objectifyEnumerations,
      convertDatesToJavascript: config.convertDatesToJavascript,
      readAndCacheSymbols: config.readAndCacheSymbols,
      readAndCacheDataTypes: config.readAndCacheDataTypes,
      disableSymbolVersionMonitoring: config.disableSymbolVersionMonitoring,
      hideConsoleWarnings: config.hideConsoleWarnings,
      autoReconnect: config.autoReconnect,
      allowHalfOpen: config.allowHalfOpen,
      disableBigInt: config.disableBigInt
    }

    //Some optional "text" settings, only add if modified
    //If not added, ads-client uses default values
    //However with boolean optional settings it's easier to just have same defaults here
    if (config.routerTcpPort != null && config.routerTcpPort !== '') {
      this.connectionSettings.routerTcpPort = parseInt(config.routerTcpPort)
    }

    if (config.routerAddress != null && config.routerAddress !== '') {
      this.connectionSettings.routerAddress = config.routerAddress
    }

    if (config.localAddress != null && config.localAddress !== '') {
      this.connectionSettings.localAddress = config.localAddress
    }

    if (config.localTcpPort != null && config.localTcpPort !== '') {
      this.connectionSettings.localTcpPort = parseInt(config.localTcpPort)
    }

    if (config.localAmsNetId != null && config.localAmsNetId !== '') {
      this.connectionSettings.localAmsNetId = config.localAmsNetId
    }

    if (config.localAdsPort != null && config.localAdsPort !== '') {
      this.connectionSettings.localAdsPort = parseInt(config.localAdsPort)
    }

    if (config.timeoutDelay != null && config.timeoutDelay !== '') {
      this.connectionSettings.timeoutDelay = parseInt(config.timeoutDelay)
    }

    if (config.reconnectInterval != null && config.reconnectInterval !== '') {
      this.connectionSettings.reconnectInterval = parseInt(config.reconnectInterval)
    }

    if (config.checkStateInterval != null && config.checkStateInterval !== '') {
      this.connectionSettings.checkStateInterval = parseInt(config.checkStateInterval)
    }

    if (config.connectionDownDelay != null && config.connectionDownDelay !== '') {
      this.connectionSettings.connectionDownDelay = parseInt(config.connectionDownDelay)
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
          this.eventEmitter.emit('connected', true)
        } else {
          this.eventEmitter.emit('connected', false)
        }
      }

      this.connected = connected
      this.firstConnectedEventSent = true
    }


    /**
     * Connect to the target (internal)
     * @returns 
     */
    const _Connect = async(silence) => {

      if (!silence){
        this.log(`Connecting to ${this.connectionSettings.targetAmsNetId}:${this.connectionSettings.targetAdsPort}...`)
      }


      try {
        this.adsClient = new ads.Client(this.connectionSettings)

        this.adsClient.on('connect', () => this.onConnectedStateChange(true))
        this.adsClient.on('disconnect', () => this.onConnectedStateChange(false))

        const res = await this.adsClient.connect()

        if(!silence){
           this.log(`Connected to ${this.connectionSettings.targetAmsNetId}:${this.connectionSettings.targetAdsPort}!`)
        }
        return res

      } catch (err) {
        //Try again every 2000 ms or so
        const retryInterval = this.connectionSettings.reconnectInterval ? this.connectionSettings.reconnectInterval : ads.Client.defaultSettings().reconnectInterval

        if (!silence) {
          this.log(`Connecting to ${this.connectionSettings.targetAmsNetId}:${this.connectionSettings.targetAdsPort} failed, keeping trying..`)
        }


        this.onConnectedStateChange(false)

        this.retryTimer = setTimeout(async () => {
          try {
            //Call again but with silent mode
            await this.connect(true)
            
          } catch (err) {
            //Nothing to do here as it will be called again
          }
        }, retryInterval)


        this.formatError(err)

        //Throwing the error so caller knows that no success..
        throw err
      } 

    }


    /**
     * Connects to the target
     * @returns 
     */
    this.connect = async (silence) => {

      clearTimeout(this.retryTimer)

      //If no one is trying to connect => make new connect call, else reuse previously started connect call
      let firstConnectCall = false;
      if (!this.connecting) {
        this.connecting = _Connect(silence);
        firstConnectCall = true;
      }

      try{
        const res = await this.connecting;
        return res;

      } catch (err) {
          throw err;

      } finally {
        //First caller clears connecting function(=flag)
        if (firstConnectCall){
          this.connecting = null;
        }
      }
    }




    /**
     * Returns the active client instance
     * @returns 
     */
    this.getClient = () => this.adsClient



    /**
     * Returns true if connected, otherwise false
     * @returns 
     */
    this.isConnected = () => this.adsClient === null ? false : this.adsClient.connection.connected

    /**
     * Returns true if connected, otherwise false
     * @returns 
     */
    this.isConnecting = () => this.connecting === null ? false : true


    
    this.getEventEmitter = () => this.eventEmitter
    

    /**
     * Helper that formats the fiven ads-client error to object that can be debugged in Node-RED
     * @param {*} err 
     */
    this.formatError = (err,msg) => {
      if (err.adsError) {
        if (typeof msg === 'object' && msg !== null){
           msg.adsErrorInfo = err.adsErrorInfo;
        }
        err.message = `${err.message} - ADS error ${err.adsErrorInfo.adsErrorCode} (${err.adsErrorInfo.adsErrorStr})`
      }
      return err
    }


    /**
     * Stringifies the error object better
     * @param {*} err 
     * @returns 
     */
    this.stringifyError = (err) => JSON.stringify(err, Object.getOwnPropertyNames(err))
    


    //When node is closed, we should disconnect
    this.on('close', async (removed, done) => {

      this.log(`Disconnecting from ${this.connectionSettings.targetAmsNetId}:${this.connectionSettings.targetAdsPort} and unsubscribing from all...`)
      
      if (this.adsClient === null || !this.adsClient.connection.connected) {
        this.adsClient = null

        done()
        return
      }
        

      try {
        await this.adsClient.disconnect()
        this.log(`Disconnected from ${this.connectionSettings.targetAmsNetId}:${this.connectionSettings.targetAdsPort}`)

      } catch (err) {
        this.warn(`Disconnecting from ${this.connectionSettings.targetAmsNetId}:${this.connectionSettings.targetAdsPort} caused an error but client deleted anyways: ${err}`)

      } finally {
        this.adsClient = null
        done()
      }
    })



    //Finally, try to connect immediately
    this.connect()
      .catch(err => {
        this.warn(`Failed to connect ${this.connectionSettings.targetAmsNetId}:${this.connectionSettings.targetAdsPort} at startup: ${err}`)
      })
  }

  
  RED.nodes.registerType('ads-client-connection', AdsClientConnection)
}
