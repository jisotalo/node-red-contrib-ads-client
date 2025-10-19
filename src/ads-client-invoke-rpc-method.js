/**
 * JSDoc types so that we get type hints for Client
 * 
 * @typedef { import("ads-client").Client } Client
 * 
 * @typedef ConnectionNode
 * @property {() => Client} getClient Returns the `Client` instance for `ads-client`
*/

module.exports = function (RED) {
  function AdsClientInvokeRpcMethod(config) {
    RED.nodes.createNode(this, config);

    //Properties
    this.name = config.name;
    this.path = config.path;
    this.method = config.method;

    /**
     * Instance of the ADS connection node
     * @type {ConnectionNode}
     */
    this.connection = RED.nodes.getNode(config.connection);

    //When input is toggled, try to write data
    this.on('input', async (msg, send, done) => {
      if (!this.connection) {
        this.status({ fill: 'red', shape: 'dot', text: `Error: No connection configured` })
        var err = new Error(`No connection configured`);
        (done)? done(err):  this.error(err, msg);
        return;
      }

      //Override with msg.topic properties (if any)
      if (typeof msg.topic === "object") {
        //path
        if (msg.topic.path !== undefined) {
          this.path = msg.topic.path;
        }

        //path
        if (msg.topic.method !== undefined) {
          this.method = msg.topic.method;
        }
      }

      if (!this.connection.isConnected()) {
        //Try to connect
        try {
          await this.connection.connect();

        } catch (err) {
          //Failed to connect, we can't work..
          this.status({ fill: 'red', shape: 'dot', text: `Error: Not connected` });
          (done)? done(err):  this.error(err, msg);
          return;
        }
      }

      //Finally, calling the RPC method
      try {
        const res = await this.connection.getClient().invokeRpcMethod(
          this.path,
          this.method,
          msg.payload
        );

        //We are here -> success
        this.status({ fill: 'green', shape: 'dot', text: 'Last call successful' });

        send({
          ...msg,
          payload: res.returnValue,
          outputs: res.outputs
        });

        if (done) {
          done();
        }

      } catch (err) {
        this.status({ fill: 'red', shape: 'dot', text: `Error: Last call failed` })
        this.connection.formatError(err,msg);
        (done)? done(err):  this.error(err, msg);
        return;
      }
    });
  }

  RED.nodes.registerType('ads-client-invoke-rpc-method', AdsClientInvokeRpcMethod);
}
