module.exports = function (RED) {

  function AdsClientSubscribe(config) {
    RED.nodes.createNode(this, config)

    //Properties
    this.variableName = config.variableName
    this.cycleTime = config.cycleTime
    this.mode = config.mode
    this.initialDelay = config.initialDelay
    this.retryInterval = config.retryInterval
    this.controlSubscription = config.controlSubscription
    
    //State
    this.subscription = null
    this.subcribeRetryTimer = null

    //Getting the ads-client instance
    this.connection = RED.nodes.getNode(config.connection)




    /**
     * Called when new notification is received
     * @param {*} data 
     * @param {*} sub 
     */
    const onNotificationReceived = (data, sub) => {
      //Updating the subscription reference just in case (might change when PLC software changes)
      this.subscription = sub

      //Out we go
      this.send({
        payload: data.value,
        type: data.type,
        symbol: data.symbol,
        timestamp: data.timeStamp
      })
    }



    /**
     * Subscribes to the target
     * @returns 
     */
    const subscribe = async (target = null) => {

      if (!this.connection) {
        this.status({ fill: 'red', shape: 'ring', text: `Error: No connection configured` })
        return
      }

      if (this.variableName === '' && !target) {
        console.log('JUUH')
        this.status({ fill: 'red', shape: 'ring', text: `Error: Input msg.topic is missing or not valid stringASD` })
        return
      }

      if (!this.connection.isConnected()) {
        //Try to connect
        try {
          await this.connection.connect()

        } catch (err) {
          //Failed to connect, we can't work..
          this.status({ fill: 'red', shape: 'ring', text: `Error: Not connected to the target, retrying every ${this.retryInterval} ms` })

          //Try again soon
          this.subcribeRetryTimer = setTimeout(() => subscribe(target), this.retryInterval)

          return
        }
      }

      //Subscribe if not yet subscribed
      if (!this.subscription) {
        try {
          clearTimeout(this.subcribeRetryTimer)
          
          this.subscription = await this.connection.getClient().subscribe(
            target ? target : this.variableName,
            onNotificationReceived,
            this.cycleTime,
            this.mode === 'onchange',
            this.initialDelay
          )

          //Successful
          this.status({ fill: "green", shape: "dot", text: "Subscribed succesfully" })

        } catch (err) {
          const errInfo = this.connection.formatError(err)

          this.status({ fill: 'red', shape: 'ring', text: `Error: ${errInfo.message} - retrying every ${this.retryInterval} ms` })
          this.error(`Error: Subscribing to ${target ? target : this.variableName} failed: ${errInfo.message} - retrying every ${this.retryInterval} ms`, errInfo)

          //Try again soon
          this.subcribeRetryTimer = setTimeout(() => subscribe(target), this.retryInterval)
        }
      }
    }



    /**
     * Unsubscribes the current subscription (if any)
     * @returns 
     */
    const unsubscribe = async () => {
      clearTimeout(this.subcribeRetryTimer)

      if (!this.subscription)
        return
      
      try {
        await this.subscription.unsubscribe()

      } catch (err) {
        const errInfo = this.connection.formatError(err)

        this.error(`Error: Unsubscribing old subscription to "${this.subscription.target}" failed: ${errInfo.message}`, errInfo)

      } finally {
        this.subscription = null
      }
    }





    //When input is toggled, it depends on properties what to do
    this.on('input', async (msg, send, done) => {


      if (!this.controlSubscription && msg.subscribe !== undefined) {
        this.warn(`Warning: Input msg.subscribe is provided but node has no "Control subscription with input" checked.`, msg)
      }

      //Unsubscribe request received from msg.subscribe
      if (this.controlSubscription && msg.subscribe !== undefined && !msg.subscribe) {
        await unsubscribe()

        this.status({ fill: 'yellow', shape: 'dot', text: 'Not subscribed (waiting for msg.subscribe)' })

        if (done) {
          done()
        }
        return
      }


      //Check if given topic is valid (if no variableName given)
      if (this.variableName === '' && (!msg.topic || typeof (msg.topic) !== 'string')) {
        this.status({ fill: 'red', shape: 'ring', text: `Error: Input msg.topic is missing or not valid string` })
        this.error(`Error: Subscribing failed - Input msg.topic is missing or not valid string`, msg)

        if (done) {
          done()
        }
        return
      }

      

      if (this.controlSubscription && msg.subscribe) {
        //Subscribe request received from msg.subscribe
        await unsubscribe()
        await subscribe(this.variableName === '' ? msg.topic : this.variableName)

        if (done) {
          done()
        }


      } else if (this.variableName === '' && msg.topic) {
        //Input msg.topic was given -> subscribe to it
        await unsubscribe()
        await subscribe(msg.topic)

        if (done) {
          done()
        }

      } else {
        //Input without any sense?
      }
    })



    //When node is closed, clear timer and subscribe reference
    this.on('close', async (removed, done) => {
      clearTimeout(this.subcribeRetryTimer)

      //Note that we could unsubscribe here but the ads-client-connection will do that
      //as the connection is also closed when this happens (as far as I know..)
      //If not so -> add this.subscription.unsubscribe() here

      this.subscription = null
      done()
    })




    //Start subscribing immediately after startup (unless controlled node)
    if (!this.controlSubscription) {
      subscribe()
    } else {
      this.status({ fill: 'yellow', shape: 'dot', text: 'Not subscribed (waiting for msg.subscribe)' })
    }
  }

  RED.nodes.registerType("ads-client-subscribe", AdsClientSubscribe)
}
