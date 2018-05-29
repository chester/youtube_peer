//Make connection from client to server 
var socket = io.connect('http://localhost:8080');
//var socket = io.connect('https://yt-peer.herokuapp.com');


// Query DOM
var testBtn = document.getElementById('sendButton');

// Set up Video Player
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        width: 600,
        height: 400,
        videoId: 'zxwfDlhJIpw',
        playerVars: {
            color: 'white',
            rel: 0

        },
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange
        }
    });
}

// Start Video Player at 0:00
var count = 0;
var intervalId = null;
var time_update = function() {
    if( count < 5 ) {
        player.playVideo();
        player.pauseVideo();
        count++;
    } else {
        clearInterval(intervalId);
        updateServerStateBool = false;
        getCurrentState();
    }
}

function onPlayerReady(event) {
    console.log("Player Ready");

    intervalId = setInterval(time_update, 1000);
}

/*
update_log = setInterval(function() {
    console.log(player.getPlayerState());
}, 1000)
*/

////////// Helper Methods /////////
/*
$('form').submit(function() {
    // Add url to queue 
    console.log($('#urlSubmit').val());
    var new_url = $('#urlSubmit').val();
    var ul = document.getElementById('url_queue');
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(new_url));
    ul.appendChild(li);
    
    // Process queue conditionally

    
    return false;
});
*/ 
$("#url_form button").click(function(e) {
    e.preventDefault();
    if( $(this).attr("value") == 'add_queue_btn') {
        console.log('add queue');
        console.log($('#urlSubmit').val());
        var new_url = $('#urlSubmit').val();
        var ul = document.getElementById('url_queue');
        var li = document.createElement('li');
        li.appendChild(document.createTextNode(new_url));
        ul.appendChild(li);

    } else if( $(this).attr("value") == 'push_btn') {
        console.log('queue btn');
        //var queue_list = document.getElementById("url_queue");
        //console.log(queue_list.childNodes[0]);
        //console.log(queue_list.childElementCount);
        var videoUrl = $('#urlSubmit').val();
        console.log(videoUrl);

        // Get ID from url
        var split = videoUrl.split('=');
        var videoID = split[1];

        //player.loadVideoById(videoID, 0);
        //player.pauseVideo();

        // Emit new video pushed
        socket.emit('emit_video_pushed', {
            'pushed_url': videoID
        });
    } 
})

////////// Emit Events //////////

var updateServerStateBool = false;
function updateServerState() {

    // video has been in a started state, pass updates to server
    if( updateServerStateBool )  {
        socket.emit('update_state', {
            'current_state':player.getPlayerState(),
            'current_time':player.getCurrentTime()
        });
    }
}

function onPlayerStateChange(event) {

    if( event.data == YT.PlayerState.PLAYING) {

        updateServerStateBool = true;
        updateServerState();
      
        socket.emit('emit_play', {
        });
    }

    if( event.data == YT.PlayerState.PAUSED) {

        updateServerStateBool = true;
        updateServerState();

        socket.emit('emit_pause', {
            'current_time': player.getCurrentTime()
        });
    }

    if( event.data == YT.PlayerState.BUFFERING) {
//        console.log('buffering');
        socket.emit('emit_buffering', {
        });
    }

    if( event.data == YT.PlayerState.ENDED ) {
        
    }
}

function getCurrentState() {
    socket.emit('get_state', {
    });
}

testBtn.addEventListener('click', function() {
    //emit(name, data)
    socket.emit('btn_clicked', {
    });
});


////////// Recieve events //////////

socket.on('btn_click_recieved', function() {
    console.log('broadcast recieved from server side');
});

socket.on('play_recieved', function() {
    player.playVideo();
});

socket.on('pause_recieved', function(data) {
//    console.log("pause recieved at: " + player.getCurrentTime());
//    console.log("update bool: " + updateServerStateBool);
    //console.log(data['time_seconds']['current_time']);
    var currentTime = data['time_seconds']['current_time'];
    player.seekTo(currentTime, true);
    player.pauseVideo();
});

socket.on('buffering_recieved', function() {
   player.pauseVideo();

});

socket.on('get_state_recieved', function(data){
    let state = data['state'];
    let time = data['time'];
    player.seekTo(time, true);

    if( state == YT.PlayerState.PLAYING ) {
        player.playVideo();
    } else if( state == YT.PlayerState.PAUSE ) {
        player.pauseVideo();
    }   
    // After checking state
    // If state still unstarted, go to 0:0
    if( state == -1 ) {
        player.playVideo();
        player.pauseVideo();
        player.seekTo(0, true);
    }
}); 

socket.on('video_push_recieved', function(data) {
    let video_id = data['video_id'];

    
    player.cueVideoById(video_id, 0);
    player.seekTo(0, true);

    player.playVideo();
    player.pauseVideo();

    player.playVideo();
    player.pauseVideo();
    
    player.playVideo();
    player.pauseVideo();
});