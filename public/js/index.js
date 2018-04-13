//Make connection from client to server 
var socket = io.connect('http://localhost:8080');

// Query DOM
var testBtn = document.getElementById('sendButton');

// Emit events

testBtn.addEventListener('click', function() {
    //emit(name, data)
    socket.emit('btn_clicked', {
        
    });
});

// Recieve events

socket.on('btn_clicked', function() {
    console.log('Click recieved');
});
