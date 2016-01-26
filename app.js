// TODO: Load from environment variables
global.PORT = 3000;
global.URL = process.env.URL || "http://localhost:3000";

var nunjucks = require('nunjucks');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var crypto = require('crypto');
var LRU = require('lru-cache');

var cache = new LRU(130*2*1000);

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
  var room;

  socket.on('newdhe', function() {
    var dhe = crypto.createECDH('secp256k1');
    dhe.generateKeys();

    var full_public = dhe.getPublicKey('hex');
    var short_public = parseInt(full_public.substring(0, 7), 16).toString(36)
    cache.set(short_public, full_public)

    socket.emit('dhekeys', {
      private: dhe.getPrivateKey('hex'),
      public: full_public,
      short_public: short_public
    });
  });

  socket.on('getsecret', function(keys) {
    // TODO: Confirm that keys are the correct size

    var dhe = crypto.createECDH('secp256k1');
    dhe.setPrivateKey(keys.private, 'hex');
    dhe.setPublicKey(keys.public, 'hex');

    var shared_secret = dhe.computeSecret(cache.get(keys.other_public), 'hex', 'hex');
    socket.emit('sharedsecret', shared_secret);
  });

	socket.on('join', function (data) {
		// Join channel based off of the sha sum in data
		// TODO: Confirm that data is a valid sha checksum
		socket.join(data);
    room = data;
		console.log("A user joined room " + room + "...");
	});

	socket.on('message', function (data) {
		// TODO: Do some checks to make sure data is am AES encrypted string
		console.log("Message: " + data);
		socket.broadcast.to(room).emit('message', data);
	});
});

server.listen(3000, function() {
	console.log("Running at " + URL);
});
