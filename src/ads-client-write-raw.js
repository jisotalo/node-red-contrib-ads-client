const { Buffer } = require('buffer');

module.exports = function (RED) {

  function AdsClientWriteRaw(config) {
    RED.nodes.createNode(this, config);

    //Properties
    this.name = config.name;
    this.indexGroup = config.indexGroup === '' ? null : parseInt(config.indexGroup);
    this.indexOffset = config.indexOffset === '' ? null : parseInt(config.indexOffset);
    this.targetAdsPort = config.targetAdsPort === '' ? null : parseInt(config.targetAdsPort);
      
    //Getting the ads-client instance
    this.connection = RED.nodes.getNode(config.connection);

    //When input is toggled, try to read data
    this.on('input', async (msg, send, done) => {

      if (!this.connection) {
        this.status({ fill: 'red', shape: 'dot', text: `Error: No connection configured` })
        var err = new Error(`No connection configured`);
        done ? done(err) : this.error(err, msg);
        return;
      }

      //Override with msg.topic properties (if any)
      if (typeof msg.topic === 'object') {
        //indexGroup
        if (msg.topic.indexGroup !== undefined) {
          if (typeof msg.topic.indexGroup !== 'number') {
            this.status({ fill: 'red', shape: 'dot', text: `Error: Input msg.topic.indexGroup is not a valid number` })
            var err = new Error(`Error: Input msg.topic.indexGroup is not a valid number`);
            done ? done(err) : this.error(err, msg);
            return;
          } else {
            this.indexGroup = msg.topic.indexGroup;
          }
        }

        //indexOffset
        if (msg.topic.indexOffset !== undefined) {
          if (typeof msg.topic.indexOffset !== 'number') {
            this.status({ fill: 'red', shape: 'dot', text: `Error: Input msg.topic.indexOffset is not a valid number` })
            var err = new Error(`Error: Input msg.topic.indexOffset is not a valid number`);
            done ? done(err) : this.error(err, msg);
            return;
          } else {
            this.indexOffset = msg.topic.indexOffset;
          }
        }
        
        //targetAdsPort
        if (msg.topic.targetAdsPort !== undefined) {
          if (typeof msg.topic.targetAdsPort !== 'number') {
            this.status({ fill: 'red', shape: 'dot', text: `Error: Input msg.topic.targetAdsPort is not a valid number` })
            var err = new Error(`Error: Input msg.topic.targetAdsPort is not a valid number`);
            done ? done(err) : this.error(err, msg);
            return;
          } else {
            this.targetAdsPort = msg.topic.targetAdsPort;
          }
        }
      }

      //Checking that all required parameters are provided
      if (this.indexGroup == null) {
        this.status({ fill: 'red', shape: 'dot', text: `Error: Index group is not valid` });
        var err = new Error(`Index group is not valid`);
        done ? done(err) : this.error(err, msg);
        return;
      }
      if (this.indexOffset == null) {
        this.status({ fill: 'red', shape: 'dot', text: `Error: Index offset is not valid` });
        var err = new Error(`Index offset is not valid`);
        done ? done(err) : this.error(err, msg);
        return;
      }

      //Checking that payload is correct type
      if (!Buffer.isBuffer(msg.payload)) {
        this.status({ fill: 'red', shape: 'dot', text: `Error: Input msg.payload is not a valid Buffer object` })
        var err = new Error(`Error: Input msg.payload is not a valid Buffer object`);
        done ? done(err) : this.error(err, msg);
        return;
      }

      if (!this.connection.isConnected()) {
        //Try to connect
        try {
          await this.connection.connect();
          
        } catch (err) {
          //Failed to connect, we can't work..
          this.status({ fill: 'red', shape: 'dot', text: `Error: Not connected` });
          done ? done(err) : this.error(err, msg);
          return;
        }
      }

      //Finally, writing the data
      try {
        const res = await this.connection.getClient().writeRaw(this.indexGroup, this.indexOffset, msg.payload, this.targetAdsPort);

        //We are here -> success
        this.status({ fill: 'green', shape: 'dot', text: 'Last write successful' });

        send({
          ...msg,
          payload: res
        });

        if (done) {
          done();
        }

      } catch (err) {
        this.status({ fill: 'red', shape: 'dot', text: `Error: Last write failed` });
        this.connection.formatError(err, msg);
        done ? done(err) : this.error(err, msg);
        return;
      }

    })
  }

  RED.nodes.registerType('ads-client-write-raw', AdsClientWriteRaw);
}
