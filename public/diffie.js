var socket = io(APP_URL);
socket.on('message', function(data) {
    var decrypted = CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(data, SHARED_SECRET.toString()));
    addMessage(false, decrypted);
});

function addMessage(mine, message) {
    var text = mine ? "<b>Me:<\/b> " : "<b>Them:<\/b> ";
    text += message;
    text += "<br>";
    $("#chatlog").html($("#chatlog").html() + text);
}

function randomInt(min, max) { return Math.floor(Math.random() * (max - min)) + min; }
function modExp(base, exponent, mod) {
    var answer = 1;
    for(var i = 0; i < exponent; ++i) {
        answer = (answer * base) % mod;
    }
    return answer;
}

var DHE_PRIME = 2698727; // Should be a safe prime
var DHE_BASE = 5;

var MY_SECRET = randomInt(0, 4000);
var MY_PUBLIC_KEY = modExp(DHE_BASE, MY_SECRET, DHE_PRIME);

var THEIR_PUBLIC_KEY;
var SHARED_SECRET;

var alphabet = "abcdefghijklmnopqrstuvwxyz";
var valid_characters = "-()0123456789" + alphabet;

$(function() {
    $('#publickey').html(MY_PUBLIC_KEY.toString(36));
    $('#start').click(function() {
        THEIR_PUBLIC_KEY = parseInt($('#theirkey').val(), 36);
        SHARED_SECRET = modExp(THEIR_PUBLIC_KEY, MY_SECRET, DHE_PRIME);
        $('#shared').html(SHARED_SECRET.toString(36));
        $("#keyenter").fadeOut();
        $('#communicate').fadeIn();

        // TODO: Connect to a channel based off the sha-1 sum of the secret
        var sha = CryptoJS.SHA1(SHARED_SECRET.toString()).toString();
        socket.emit("join", sha);
    });

    $('#send').click(function() {
        var message = $('#message').val();
        socket.emit("message", CryptoJS.AES.encrypt(message, SHARED_SECRET.toString()).toString());
        addMessage(true, message);
        $('#message').val("");
    });
})