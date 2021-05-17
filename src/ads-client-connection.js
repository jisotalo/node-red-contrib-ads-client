const ads = require('ads-client')

module.exports = function (RED) {

  function AdsClientConnection(config) {
    RED.nodes.createNode(this, config)

    this.adsClient = null
    this.connecting = false

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
     * Connects to the target
     * @returns 
     */
    this.connect = async () => {

      if (this.connecting) {
        throw new Error('Already connecting to the target')
      }

      this.connecting = true
      this.log(`Connecting to ${this.connectionSettings.targetAmsNetId}:${this.connectionSettings.targetAdsPort}...`)


      try {
        this.adsClient = new ads.Client(this.connectionSettings)
        const res = await this.adsClient.connect()

        this.log(`Connected to ${this.connectionSettings.targetAmsNetId}:${this.connectionSettings.targetAdsPort}!`)

        return res

      } catch (err) {
        const errInfo = this.formatError(err)

        this.error(`Connecting to ${this.connectionSettings.targetAmsNetId}:${this.connectionSettings.targetAdsPort} failed - ${errInfo.message}`, errInfo)

        //Throwing the error so caller knows that no success..
        throw err

      } finally {
        this.connecting = false
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
    this.isConnecting = () => this.connecting

    

    /**
     * Helper that formats the fiven ads-client error to object that can be debugged in Node-RED
     * @param {*} err 
     */
    this.formatError = (err) => {
      const obj = {
        adsClientError: this.stringifyError(err),
        adsErrorInfo: null,
        message: err.message
      }

      if (err.adsError) {
        obj.adsErrorInfo = err.adsErrorInfo
        obj.message = `${obj.message} - ADS error ${err.adsErrorInfo.adsErrorCode} (${err.adsErrorInfo.adsErrorStr})`
      }

      return obj
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



    //Finally, try to connect immediately´
    //TODO: How this should be done? 
    //Now if connection fails at startup, it is retried only when some node needs the connection
    this.connect()
      .catch(err => this.log(`Failed to connect ${this.connectionSettings.targetAmsNetId}:${this.connectionSettings.targetAdsPort} at startup`))
  }

  
  RED.nodes.registerType('ads-client-connection', AdsClientConnection)
}
