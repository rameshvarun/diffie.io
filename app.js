// TODO: Load from environment variables
global.PORT = 3000;
global.URL = process.env.URL || "http://localhost:3000";

var nunjucks = require('nunjucks');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

nunjucks.configure('templates', {
    autoescape: true,
    express: app,
    watch: true
});

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.render("index.html", {
  	URL: URL
  });
});

io.on('connection', function (socket) {
	var ROOM;
	socket.on('join', function (data) {
		// Join channel based off of the sha sum in data
		// TODO: Confirm that data is a valid sha checksum
		socket.join(data);
		ROOM = data;
		console.log("A user joined room " + ROOM + "...");
	});

	socket.on('message', function (data) {
		// TODO: Do some checks to make sure data is am AES encrypted string
		console.log("Message: " + data);
		socket.broadcast.to(ROOM).emit('message', data);
	});
});

server.listen(3000);
