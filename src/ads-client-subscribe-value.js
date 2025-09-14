module.exports = function (RED) {
  function AdsClientSubscribe(config) {
    RED.nodes.createNode(this, config);

    //Properties
    this.name = config.name;
    this.variableName = config.variableName;
    this.cycleTime = config.cycleTime;
    this.mode = config.mode;
    this.maxDelay = config.maxDelay;
    this.retryInterval = config.retryInterval;
    this.controlSubscription = config.controlSubscription;
    this.resubscribeTimeout = config.resubscribeTimeout;

    //State
    this.subscriptionOK = false;
    this.subscription = null;
    this.subcribeRetryTimer = null;
    this.resubscribeTimer = null;
    this.silenceError = false;
    this.initialSubscribeDone = false;

    //Getting the ads-client instance
    this.connection = RED.nodes.getNode(config.connection);

    /**
     * Called when connected/disconnected
     * @param {*} state
     */
    const onConnectedChange = (connected) => {
      //Note: We will do this only if subscribed at least one
      //If not yet subscribed, no need to do this as there is timer running.
      if (connected && this.initialSubscribeDone) {
        //Reconnected to the target
        //If no new data received in a while -> resubscribe
        //ads-client library should resubscribe automatically so this is just a backup if stuff goes wrong
        //Note: wait at least resubscribeTimeout
        this.resubscribeTimer = setTimeout(async () => {
          if (this.subscription) {
            const target = this.subscription ? this.subscription.target : null;

            this.warn(`Warning: Connection was lost and subscription didn't continue in time limit. Resubscribing to ${target}`, { target });

            await unsubscribe();
            await subscribe(target);
          }
        }, Math.max(this.resubscribeTimeout ? this.resubscribeTimeout : 2000, this.maxDelay * 2 + this.cycleTime * 2));
      } else if (!connected) {
        this.subscriptionOK = false;
        this.status({
          fill: "red",
          shape: "dot",
          text: `Error: Not connected`,
        });
      }
    };

    /**
     * Called when new notification is received
     * @param {*} data
     * @param {*} sub
     */
    const onNotificationReceived = (data, sub) => {
      clearTimeout(this.resubscribeTimer);

      //Updating the subscription reference just in case (might change when PLC software changes)
      this.subscription = sub;

      if (!this.subscriptionOK) {
        this.subscriptionOK = true;
        this.status({ fill: "green", shape: "dot", text: "Subscribed" });
      }

      //Out we go
      this.send({
        payload: data.value,
        symbol: sub.symbol,
        timestamp: data.timestamp,
      });
    };

    /**
     * Subscribes to the target
     * @returns
     */
    const subscribe = async (target = null) => {
      if (!this.connection) {
        this.status({
          fill: "red",
          shape: "dot",
          text: `Error: No connection configured`,
        });
        this.error(`Error: No connection configured`, {
          error: `No connection configured`,
        });
        this.subscriptionOK = false;
        return;
      }

      if (this.variableName === "" && !target) {
        this.status({
          fill: "red",
          shape: "dot",
          text: `Error: Input msg.topic not valid string`,
        });
        this.error(`Error: Input msg.topic is missing or it's not valid string`, { error: `Input msg.topic is missing or it's not valid string` });
        this.subscriptionOK = false;
        return;
      }

      if (!this.connection.isConnected()) {
        //Try to connect
        try {
          await this.connection.connect(this.silenceError);
          this.silenceError = false;
        } catch (err) {
          //Failed to connect, we can't work..
          this.status({
            fill: "red",
            shape: "dot",
            text: `Error: Not connected, retrying...`,
          });
          //Only log error ones to prevent console spam
          if (!this.silenceError) {
            this.error(`Error: Not connected to the target, retrying in the background.`);
          }

          this.subscriptionOK = false;

          //Try again soon
          this.subcribeRetryTimer = setTimeout(() => subscribe(target), this.retryInterval);
          this.silenceError = true;

          return;
        }
      }

      //Subscribe if not yet subscribed
      if (!this.subscription) {
        try {
          clearTimeout(this.subcribeRetryTimer);
          this.subscription = await this.connection.getClient().subscribe({ target: target ? target : this.variableName, callback: onNotificationReceived, cycleTime: this.cycleTime, sendOnChange: this.mode === "onchange", maxDelay: this.maxDelay });

          //Successful
          this.status({ fill: "green", shape: "dot", text: "Subscribed" });
          this.subscriptionOK = true;
          this.initialSubscribeDone = true;
        } catch (err) {
          const errInfo = this.connection.formatError(err);

          this.status({
            fill: "red",
            shape: "dot",
            text: `Error: Subscribe failed, retrying...`,
          });
          this.error(`Error: Subscribing to ${target ? target : this.variableName} failed: ${errInfo.message} - retrying every ${this.retryInterval} ms`, errInfo);
          this.subscriptionOK = false;

          //Try again soon
          this.subcribeRetryTimer = setTimeout(() => subscribe(target), this.retryInterval);
        }
      }
    };

    /**
     * Unsubscribes the current subscription (if any)
     * @returns
     */
    const unsubscribe = async () => {
      clearTimeout(this.subcribeRetryTimer);

      if (!this.subscription) return;

      try {
        await this.subscription.unsubscribe();
      } catch (err) {
        const errInfo = this.connection.formatError(err);

        this.error(`Error: Unsubscribing old subscription to "${this.subscription.target}" failed: ${errInfo.message}`, errInfo);
        this.subscriptionOK = false;
      } finally {
        this.subscription = null;
      }
    };

    //When input is toggled, it depends on properties what to do
    this.on("input", async (msg, send, done) => {
      if (!this.controlSubscription && msg.subscribe !== undefined) {
        this.warn(`Warning: Input msg.subscribe is provided but node has no "Control subscription with input" checked.`, msg);
      }

      //Unsubscribe request received from msg.subscribe
      if (this.controlSubscription && msg.subscribe !== undefined && !msg.subscribe) {
        await unsubscribe();

        this.status({
          fill: "yellow",
          shape: "dot",
          text: "Not subscribed (waiting for msg.subscribe)",
        });

        if (done) {
          done();
        }
        return;
      }

      //Check if given topic is valid (if no variableName given)
      if (this.variableName === "" && (!msg.topic || typeof msg.topic !== "string")) {
        this.status({
          fill: "red",
          shape: "dot",
          text: `Error: Input msg.topic not valid string`,
        });
        this.error(`Error: Input msg.topic is missing or it's not valid string`, msg);
        this.subscriptionOK = false;

        if (done) {
          done(new Error(`Error: Input msg.topic is missing or it's not valid string`));
        }
        return;
      }

      if (this.controlSubscription && msg.subscribe) {
        //Subscribe request received from msg.subscribe
        await unsubscribe();
        await subscribe(this.variableName === "" ? msg.topic : this.variableName);

        if (done) {
          done();
        }
      } else if (this.variableName === "" && msg.topic) {
        //Input msg.topic was given -> subscribe to it
        await unsubscribe();
        await subscribe(msg.topic);

        if (done) {
          done();
        }
      } else {
        //Input without any sense?
      }
    });

    //When node is closed, clear timer and subscribe reference
    this.on("close", async (removed, done) => {
      clearTimeout(this.subcribeRetryTimer);

      //Note that we could unsubscribe here but the ads-client-connection will do that
      //as the connection is also closed when this happens (as far as I know..)
      //If not so -> add this.subscription.unsubscribe() here

      this.subscription = null;
      done();
    });

    //Start subscribing immediately after startup (unless controlled node or no variable name)
    if (!this.controlSubscription && this.variableName) {
      subscribe();
    } else if (this.controlSubscription) {
      this.status({
        fill: "yellow",
        shape: "dot",
        text: "Not subscribed (waiting for msg.subscribe)",
      });
    } else {
      this.status({
        fill: "yellow",
        shape: "dot",
        text: "Not subscribed (waiting for msg.topic)",
      });
    }

    //Listening for connected state change events
    this.connection.eventEmitter.on("connected", (connected) => onConnectedChange(connected));
  }

  RED.nodes.registerType("ads-client-subscribe-value", AdsClientSubscribe);
};
