var app = require('express')();
var server = require('http').Server(app);
var WebSocket = require('ws');

var wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log('server: receive connection.');
  let i = 0;
  ws.on('message', (message) => {
    try{
      console.log('server: received: %s', message);
      setTimeout(()=>{
        //延迟1秒回应
        ws.send(i++ + " : " + message);
      },1000);
    }catch(e){
      console.log("ws server is error", e);
    }
  });
});
console.log("websocket server is listening...");