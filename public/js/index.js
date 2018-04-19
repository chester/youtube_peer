//Make connection from client to server 
var socket = io.connect('http://localhost:8080');

// Query DOM
var testBtn = document.getElementById('sendButton');


var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        width: 600,
        height: 400,
        videoId: '7LEmer7wwHI',
        playerVars: {
            color: 'white',
        },
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange
        }
    });
}


function onPlayerReady(event) {
    console.log("Player Ready")
}

var done = false;
function onPlayerStateChange(event) {
    if( event.data == YT.PlayerState.PAUSED && !done) {
        socket.emit('emit_pause', {

        });
    }
}



// Emit events

testBtn.addEventListener('click', function() {
    //emit(name, data)
    socket.emit('btn_clicked', {
    });
});





// Recieve events

socket.on('btn_click_recieved', function() {
    console.log('broadcast recieved from server side');
});

socket.on('pause_recieved', function() {
    player.pauseVideo();
});