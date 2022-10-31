module.exports = function (RED) {

  function AdsClientGetSymbolInfo(config) {
    RED.nodes.createNode(this, config)

    //Properties
    this.name = config.name
    this.variableName = config.variableName

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

      //We need to have string in msg.topic if variableName is empty
      if (this.variableName === '' && (!msg.topic || typeof (msg.topic) !== 'string')) {
        this.status({ fill: 'red', shape: 'dot', text: `Error: Input msg.topic not valid string` })
        var err = new Error(`Input msg.topic is missing or it's not valid string`);
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

      const variable = this.variableName === '' ? msg.topic : this.variableName

      //Finally, getting the symbol info
      try {
        const res = await this.connection.getClient().getSymbolInfo(variable)

        //We are here -> success
        this.status({ fill: 'green', shape: 'dot', text: 'Last call successful' })

        send({
          ...msg,
          payload: res
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

  RED.nodes.registerType('ads-client-get-symbol-info', AdsClientGetSymbolInfo)
}
