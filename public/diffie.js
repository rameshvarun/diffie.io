var socket = io(APP_URL);

socket.emit('newdhe');

var KEYS = {};

function addMessage(mine, message) {
    var text = mine ? "<b>Me:<\/b> " : "<b>Them:<\/b> ";
    text += message;
    text += "<br>";
    $("#chatlog").html($("#chatlog").html() + text);
}

socket.on('dhekeys', function(data) {
  KEYS = data;
  $('#publickey').html(KEYS.short_public);
});

socket.on('sharedsecret', function(data) {
  KEYS.shared_secret = data;

  $('#shared').html(KEYS.shared_secret);
  $("#keyenter").fadeOut();
  $('#communicate').fadeIn();

  // TODO: Connect to a channel based off the sha-1 sum of the secret
  var sha = CryptoJS.SHA1(KEYS.shared_secret).toString();
  socket.emit("join", sha);
});

socket.on('message', function(data) {
    var decrypted = CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(data, KEYS.shared_secret));
    addMessage(false, decrypted);
});

$(function() {

    $('#start').click(function() {
        KEYS.other_public = $('#theirkey').val();
        socket.emit('getsecret', KEYS);
    });

    $('#send').click(function() {
        var message = $('#message').val();
        socket.emit("message", CryptoJS.AES.encrypt(message, KEYS.shared_secret).toString());
        addMessage(true, message);
        $('#message').val("");
    });
})
