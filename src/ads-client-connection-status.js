module.exports = function (RED) {
  function AdsClientConnectionStatus(config) {
    RED.nodes.createNode(this, config);

    //Properties
    this.name = config.name;

    //State
    this.connected = false;

    //Getting the ads-client instance
    this.connection = RED.nodes.getNode(config.connection);

    /**
     * Called when connected/disconnected
     * @param {*} state 
     */
    const onConnectedChange = (connected) => {
      //Only send message once
      if (connected) {
        this.status({ fill: 'green', shape: 'dot', text: `Connected` });

      } else {
        this.status({ fill: 'red', shape: 'dot', text: `Not connected` });
      }

      this.connected = connected;

      //Out we go
      this.send({
        payload: this.connected,
        connection: this.connection.getClient() ? this.connection.getClient().connection : null
      });
    }

    //When input is toggled, try to read data
    this.on('input', async (msg, send, done) => {
      //Getting the connection and the status
      const conn = this.connection && this.connection.getClient()
        ? this.connection.getClient().connection
        : null;

      this.connected = conn
        ? conn.connected
        : false;

      send({
        ...msg,
        payload: this.connected,
        connection: conn
      });

      if (done) {
        done();
      }
    });

    //Listening for connected state change events
    if (this.connection) { //Check if node is enabled
      this.connection.eventEmitter.on('connected', connected => onConnectedChange(connected));
    }
  }

  RED.nodes.registerType('ads-client-connection-status', AdsClientConnectionStatus);
}
