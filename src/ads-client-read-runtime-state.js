module.exports = function (RED) {

  function AdsClientReadRuntimeState(config) {
    RED.nodes.createNode(this, config)

    //Properties
    this.name = config.name
    this.adsPort = config.adsPort

    //Getting the ads-client instance
    this.connection = RED.nodes.getNode(config.connection)

    //When input is toggled, try to read data
    this.on('input', async (msg, send, done) => {

      if (!this.connection) {
        this.status({ fill: 'red', shape: 'dot', text: `Error: No connection configured` })
        var err = new Error(`No connection configured`);
        (done)? done(err):  this.error(err, msg);
        return;
      }

      //We need to have a valid number in msg.topic if adsPort is empty
      if (this.adsPort === '' && (!msg.topic || isNaN(parseInt(msg.topic)))) {
        this.status({ fill: 'red', shape: 'dot', text: `Error: Input msg.topic not a valid number` })
        var err = new Error(`Input msg.topic is missing or it's not a valid number`);
        (done)? done(err):  this.error(err, msg);
        return;
      }

      if (!this.connection.isConnected()) {
        //Try to connect
        try {
          await this.connection.connect()
          
        } catch (err) {
          //Failed to connect, we can't work..
          this.status({ fill: 'red', shape: 'dot', text: `Error: Not connected` });
          (done)? done(err):  this.error(err, msg);
          return;
        }
      }

      const targetAdsPort = this.adsPort === '' ? parseInt(msg.topic) : this.adsPort

      //Finally, reading the state
      try {
        const res = await this.connection.getClient().readPlcRuntimeState(targetAdsPort)

        //We are here -> success
        this.status({ fill: 'green', shape: 'dot', text: 'Last read successful' })

        send({
          ...msg,
          payload: res.adsStateStr,
          result: res
        })

        if (done) {
          done()
        }

      } catch (err) {

        this.status({ fill: 'red', shape: 'dot', text: `Error: Last read failed` })
        this.connection.formatError(err,msg);
        (done)? done(err):  this.error(err, msg);
        return;

      }

    })
  }

  RED.nodes.registerType('ads-client-read-runtime-state', AdsClientReadRuntimeState)
}
