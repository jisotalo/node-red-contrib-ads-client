module.exports = function (RED) {

  function AdsClientRpc(config) {
    RED.nodes.createNode(this, config)

    //Properties
    this.name = config.name
    this.methodName = config.methodName
	console.log(this.methodName)
	
    //Getting the ads-client instance
    this.connection = RED.nodes.getNode(config.connection)

    //When input is toggled, try to write data
    this.on('input', async (msg, send, done) => {

      if (!this.connection) {
        this.status({ fill: 'red', shape: 'ring', text: `Error: No connection configured` })
        this.error(`Error: No connection configured`, msg)

        if (done) {
          done(new Error(`Error: No connection configured`))
        }
        return
      }

      //We need to have string in msg.topic if methodName is empty
      if ( (this.methodName || '') === '' && (!msg.topic || typeof (msg.topic) !== 'string')) {
        this.status({ fill: 'red', shape: 'ring', text: `Error: Input msg.topic not valid string` })
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
          this.status({ fill: 'red', shape: 'ring', text: `Error: Not connected` })
          this.error(`Error: Not connected to the target`, msg)

          if (done) {
            done(new Error(`Error: Not connected to the target`))
          }
          return
        }
      }


      const fullMethodCall = this.methodName === '' ? msg.topic : this.methodName
	  const [functionBlock, methodToCall] = fullMethodCall.split(/\.(?=[^\.]+$)/); //Split on last dot (.)
	  
      //Finally, writing the data
      try {
        const res = await this.connection.getClient().invokeRpcMethod(
		  functionBlock,
          methodToCall,
          msg.payload
        )

        //We are here -> success
        this.status({ fill: 'green', shape: 'dot', text: 'Last call successful' })

        send({
          ...msg,
          payload: res.returnValue,
          outputs: res.outputs
        })

        if (done) {
          done()
        }

      } catch (err) {
        const errInfo = this.connection.formatError(err)

        this.status({ fill: 'red', shape: 'ring', text: `Error: Last call failed` })
        this.error(`Error: Calling "${fullMethodCall}" failed: ${errInfo.message}`, errInfo)

        if (done) {
          done(errInfo)
        }
      }

    })

  }

  RED.nodes.registerType('ads-client-rpc', AdsClientRpc)
}
