/**
 * JSDoc types so that we get type hints for Client
 * 
 * @typedef { import("ads-client").Client } Client
 * 
 * @typedef ConnectionNode
 * @property {() => Client} getClient Returns the `Client` instance for `ads-client`
*/

module.exports = function (RED) {
  function AdsClientWriteValue(config) {
    RED.nodes.createNode(this, config);

    //Properties
    this.name = config.name;
    this.path = config.path;
    this.autoFill = config.autoFill;

    /**
     * Instance of the ADS connection node
     * @type {ConnectionNode}
     */
    this.connection = RED.nodes.getNode(config.connection);

    //When input is toggled, try to write data
    this.on("input", async (msg, send, done) => {
      if (!this.connection) {
        this.status({
          fill: "red",
          shape: "dot",
          text: `Error: No connection configured`,
        });

        var err = new Error(`No connection configured`);
        done ? done(err) : this.error(err, msg);
        return;
      }

      //We need to have string in msg.topic if path is empty
      if (this.path === "" && typeof msg.topic === "string") {
        this.path = msg.topic;
      }

      if (!this.connection.isConnected()) {
        //Try to connect
        try {
          await this.connection.connect();

        } catch (err) {
          //Failed to connect, we can't work..
          this.status({
            fill: "red",
            shape: "dot",
            text: `Error: Not connected`,
          });

          done ? done(err) : this.error(err, msg);
          return;
        }
      }

      //Finally, writing the data
      try {
        const res = await this.connection
          .getClient()
          .writeValue(this.path, msg.payload, this.autoFill);

        //We are here -> success
        this.status({
          fill: "green",
          shape: "dot",
          text: "Last write successful",
        });

        send({
          ...msg,
          payload: res.value,
          dataType: res.dataType,
          rawValue: res.rawValue,
          symbol: res.symbol,
        });

        if (done) {
          done();
        }

      } catch (err) {
        this.status({
          fill: "red",
          shape: "dot",
          text: `Error: Last write failed`,
        });

        this.connection.formatError(err, msg);
        done ? done(err) : this.error(err, msg);
        return;
      }
    });
  }

  RED.nodes.registerType("ads-client-write-value", AdsClientWriteValue);
};
