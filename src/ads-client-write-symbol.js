module.exports = function (RED) {

  function AdsClientWriteSymbol(config) {
    RED.nodes.createNode(this, config)

    //Properties
    this.name = config.name
    this.variableName = config.variableName
    this.autoFill = config.autoFill

    //Getting the ads-client instance
    this.connection = RED.nodes.getNode(config.connection)

    //When input is toggled, try to write data
    this.on('input', async (msg, send, done) => {

      if (!this.connection) {
        this.status({ fill: 'red', shape: 'dot', text: `Error: No connection configured` })
        this.error(`Error: No connection configured`, msg)

        if (done) {
          done(new Error(`Error: No connection configured`))
        }
        return
      }

      //We need to have string in msg.topic if variableName is empty
      if (this.variableName === '' && (!msg.topic || typeof (msg.topic) !== 'string')) {
        this.status({ fill: 'red', shape: 'dot', text: `Error: Input msg.topic not valid string` })
        this.error(`Error: Input msg.topic is missing or it's not valid string`, msg)

        if (done) {
          done(new Error(`Error: Input msg.topic is missing or it's not valid string`))
        }
        return
      }

      if (!this.connection.isConnected()) {
        //Try to connect
        try {
          await this.connection.connect()

        } catch (err) {
          //Failed to connect, we can't work..
          this.status({ fill: 'red', shape: 'dot', text: `Error: Not connected` })
          this.error(`Error: Not connected to the target`, msg)

          if (done) {
            done(new Error(`Error: Not connected to the target`))
          }
          return
        }
      }

      const variableToWrite = this.variableName === '' ? msg.topic : this.variableName

      //Finally, writing the data
      try {
        const res = await this.connection.getClient().writeSymbol(
          variableToWrite,
          msg.payload,
          this.autoFill
        )

        //We are here -> success
        this.status({ fill: 'green', shape: 'dot', text: 'Last write successful' })

        send({
          ...msg,
          payload: res.value,
          type: res.type,
          symbol: res.symbol
        })

        if (done) {
          done()
        }

      } catch (err) {
        const errInfo = this.connection.formatError(err)

        this.status({ fill: 'red', shape: 'dot', text: `Error: Last write failed` })
        this.error(`Error: Writing variable "${variableToWrite}" failed: ${errInfo.message}`, errInfo)

        if (done) {
          done(errinfo)
        }
      }

    })

  }

  RED.nodes.registerType('ads-client-write-symbol', AdsClientWriteSymbol)
}
