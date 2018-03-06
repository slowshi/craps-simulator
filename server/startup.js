import Promise from 'promise'
import socketio from 'socket.io'
import express from 'express'
import path from 'path'
import http from 'http'
let app = express();

module.exports = {
  initialize: function() {
    return new Promise(function (resolve, reject) {
      let serverUrl = 'localhost'
      let server = http.createServer(app);
      server.listen(3030, serverUrl);
      let io = socketio.listen(server);
      io.set('log level', 1);
      console.log('Server Ready! Go to:', serverUrl + ':' + 3030);
      app.use(express.static(path.join(__dirname, '../')));
      resolve({app: app, io: io});
    });
  }
};
