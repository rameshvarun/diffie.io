// TODO: Load from environment variables
global.PORT = 30;
global.URL = "http://localhost:300";

var nunjucks = require('nunjucks');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

nunjucks.configure('templates', {
    autoescape: true,
    express: app,
    watch: true
});

app.get('/', function (req, res) {
  res.render("index.html", {
  	URL: URL
  });
});

io.on('connection', function (socket) {
	socket.on('join', function (data) {
		// Join channel based off of the sha sum in data
		// TODO: Confirm that data is a valid sha checksum
		socket.join(data);
	});
});

server.listen(3000);