/**
 * JSDoc types so that we get type hints for Client
 * 
 * @typedef { import("ads-client").Client } Client
 * 
 * @typedef ConnectionNode
 * @property {() => Client} getClient Returns the `Client` instance for `ads-client`
*/

module.exports = function (RED) {
  function AdsClientReadValue(config) {
    RED.nodes.createNode(this, config);

    //Properties
    this.name = config.name;
    this.path = config.path;

    //Getting the ads-client instance
    this.connection = RED.nodes.getNode(config.connection);

    //When input is toggled, try to read data
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

      //Finally, reading the data
      try {
        const res = await this.connection.getClient().readValue(this.path === "" ? msg.topic : this.path);

        //We are here -> success
        this.status({
          fill: "green",
          shape: "dot",
          text: "Last read successful",
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
          text: `Error: Last read failed`,
        });
        this.connection.formatError(err, msg);
        done ? done(err) : this.error(err, msg);
        return;
      }
    });
  }

  RED.nodes.registerType("ads-client-read-value", AdsClientReadValue);
};
