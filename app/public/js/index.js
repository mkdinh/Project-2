// DECLARE GLOBAL VARIABLES
// ---------------------------------------------------------------------
var socket;


// SERVER CONNECTION TO SOCKET.IO
// ---------------------------------------------------------------------

// intializze socket.io upon onnection
function initalizeIOConn(){
    socket = io.connect('http://localhost:3000');

    socket.on('connect', function(data) {
        socket.on('broadcast', function(message) {
            $('#messages').append('<p>'+message+'<p>')
        });
    })
}

// login persistence with localstorage
if(localStorage.hasOwnProperty('user')){
    var user = JSON.parse(localStorage.getItem('user'));
    
    var loginInfo = {
        username: user.username,
        password: user.password
    }
    
    $.ajax({
        method: 'POST',
        url: '/users/login',
        data: loginInfo,
        success: function(res){
            $('.login-status').text('true')
            initalizeIOConn();
        }
    })
}

// on click submit, send form to server and authenticate with passport.js and initialize io
$('#login-submit').on('click', function(ev){
    ev.preventDefault();
    var loginInfo = {
        username: $('#login-username').val().trim(),
        password: $('#login-password').val().trim()
    }
    
    $.ajax({
        method: 'POST',
        url: '/users/login',
        data: loginInfo,
        success: function(res){
            console.log(res)
            localStorage.setItem('user',JSON.stringify(loginInfo));
            initalizeIOConn();
        }
    })
})

// SOCKET MESSAGING LOGICS
// ---------------------------------------------------------------------

// update message to browser DOM
function updateMessage(message) {
    $("#messages").prepend('<p>'+message+'</p>')
}

// on click, save message onto database and emit message to all clients
$('#message-submit').click(function(ev){
    ev.preventDefault()
    
    var newMessage = {
        body: $('#new-message').val().trim()
    };
    
    $.ajax({
        method: 'POST',
        url: '/messages/new',
        data: newMessage,
        success: function(message){
            socket.emit('message', message.body)
        }
    })
});