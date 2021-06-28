module.exports = function (RED) {

  function AdsClientConnectionStatus(config) {
    RED.nodes.createNode(this, config)

    //Properties
    this.name = config.name

    //State
    this.initialized = false
    this.connected = false

    //Getting the ads-client instance
    this.connection = RED.nodes.getNode(config.connection)

    //Event listeners
    const onConnect = () => onClientStateChange('connect')
    const onDisconnect = () => onClientStateChange('disconnect')
    const onReconnect = () => onClientStateChange('reconnect')




    /**
     * Called when connected/disconnected
     * @param {*} state 
     */
    const onConnectedChange = (newConnectedState) => {
      
      //Only send message once
      if (newConnectedState && (!this.connected)) {
        this.connected = true
        this.status({ fill: 'green', shape: 'dot', text: `Connected` })

      } else if (!newConnectedState && (this.connected || !this.initialized)) {
        this.connected = false
        this.status({ fill: 'red', shape: 'dot', text: `Not connected` })

      } else {
        return
      }

      this.initialized = true

      //Out we go
      this.send({
        payload: this.connected,
        connection: this.connection.getClient() ? this.connection.getClient().connection : null
      })
    }

    this.connection.eventEmitter.on('connected', connected => onConnectedChange(connected))
  }

  RED.nodes.registerType('ads-client-connection-status', AdsClientConnectionStatus)
}
