module.exports = function (RED) {

  function AdsClientReadSymbol(config) {
    RED.nodes.createNode(this, config)

    //Properties
    this.variableName = config.variableName

    //Getting the ads-client instance
    this.connection = RED.nodes.getNode(config.connection)

    //When input is toggled, try to read data
    this.on('input', async (msg, send, done) => {

      if (!this.connection) {
        this.status({ fill: 'red', shape: 'ring', text: `Error: No connection configured` })

        if (done) {
          done()
        }
        return
      }

      //We need to have string in msg.topic if variableName is empty
      if (this.variableName === '' && (!msg.topic || typeof (msg.topic) !== 'string')) {
        this.status({ fill: 'red', shape: 'ring', text: `Error: Input msg.topic is missing or not valid string` })

        if (done) {
          done()
        }
        return
      }

      if (!this.connection.isConnected()) {
        //Try to connect
        try {
          await this.connection.connect()
          
        } catch (err) {
          //Failed to connect, we can't work..
          this.status({ fill: 'red', shape: 'ring', text: `Error: Not connected to the target` })

          if (done) {
            done()
          }
          return
        }
      }

      const variableToRead = this.variableName === '' ? msg.topic : this.variableName

      //Finally, reading the data
      try {
        const res = await this.connection.getClient().readSymbol(variableToRead)

        //We are here -> success
        this.status({ fill: 'green', shape: 'dot', text: 'Last read successful' })

        send({
          payload: res.value,
          type: res.type,
          symbol: res.symbol
        })

      } catch (err) {
        const errInfo = this.connection.formatError(err)
        
        this.status({ fill: 'red', shape: 'ring', text: `Error: ${errInfo.message}` })
        this.error(`Error: Reading variable "${variableToRead}" failed: ${errInfo.message}`, errInfo)
      }

      if (done) {
        done()
      }
    })
  }

  RED.nodes.registerType('ads-client-read-symbol', AdsClientReadSymbol)
}
