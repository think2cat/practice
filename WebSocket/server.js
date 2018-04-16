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
      ws.send("hello" + i++);
    }catch(e){
      console.log("ws server is error", e);
    }
  });

  //setInterval(() => {
  //ws.send('world: ' + new Date());
  //},5000);
});
console.log("websocket server is listening...");
/*
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.listen(3000);
*/
