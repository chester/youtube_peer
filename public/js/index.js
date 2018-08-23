//Make connection from client to server 
//var socket = io.connect('http://localhost:8080');
var socket = io.connect('https://yt-peer.herokuapp.com');


// Query DOM
var testBtn = document.getElementById('sendButton');

// Set up Video Player
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        width: 600,
        height: 400,
        videoId: 'qfPF4KHN340',
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

// Handle force playing and enqueueing videos 
$("#url_form button").click(function(e) {
    e.preventDefault();

    // Add Queue Button
    if( $(this).attr("value") == 'add_queue_btn') {

        var new_url = $('#urlSubmit').val();
        var ul = document.getElementById('url_queue');

        var numElems = 0;
        $('#url_queue li').each(function() {
            numElems++;
        });

        // If Queue empty, push directly
        if ( numElems == 0 && (player.getPlayerState() == YT.PlayerState.ENDED) ) {
            var videoUrl = $('#urlSubmit').val();
            var split = videoUrl.split('=');
            var videoID = split[1];
            socket.emit('emit_video_pushed', {
                'pushed_url': videoID
            });
        
        // Queue Not Empty, add to queue
        } else {
            
            var li = document.createElement('li');
            li.appendChild(document.createTextNode(new_url));
            ul.appendChild(li);

            var url_list = [];

            $('#url_queue li').each(function() {
                url_list.push(
                    $(this).text()
                );
            });

            var url_json = url_list;

            // Now pass updated queue to backend
            socket.emit('emit_video_enqueued', {
                'urls': url_json
            });
        }
        // Clear Submit
        document.getElementById('urlSubmit').value = "";

    // Push Button
    } else if( $(this).attr("value") == 'push_btn') {
        //console.log('queue btn');

        var videoUrl = $('#urlSubmit').val();

        // Get ID from url
        var split = videoUrl.split('=');
        var videoID = split[1];

        // Emit new video pushed
        socket.emit('emit_video_pushed', {
            'pushed_url': videoID
        });
        // Clear Submit
        document.getElementById('urlSubmit').value = "";
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
        socket.emit('emit_buffering', {
        });
    }


    // Video Ended: Check Queue
    if( event.data == YT.PlayerState.ENDED ) {
        var queue_list = document.getElementById("url_queue");
        //console.log(queue_list.getElementsByTagName('li')[0].innerHTML);

        if ( queue_list.length != 0 ) {
            //var nextVideoURL = queue_list.childNodes[0].nodeValue;
            var nextVideoURL = queue_list.getElementsByTagName('li')[0].innerHTML;
            var split = nextVideoURL.split('=');
            var videoID = split[1];

            //console.log(videoID);

            $('#url_queue li').first().remove();

            socket.emit('emit_video_pushed', {
                'pushed_url': videoID
            });
        }
        
    }
}

function getCurrentState() {
    socket.emit('get_state', {
    });
}

//testBtn.addEventListener('click', function() {
//    socket.emit('btn_clicked', {
//    });
//});


////////// Recieve events //////////

socket.on('btn_click_recieved', function() {
    console.log('broadcast recieved from server side');
});

socket.on('play_recieved', function() {
    player.playVideo();
});

socket.on('pause_recieved', function(data) {
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

socket.on('video_enqueue_recieved', function(data) {

    var back_to_list = data['urls'];

    // Code to convert back to UL
    $('#url_queue li').remove();
    var i = 0;
    for( i = 0; i < back_to_list.length; i++) {
        var new_url = back_to_list[i];
        var ul = document.getElementById('url_queue');
        var li = document.createElement('li');
        li.appendChild(document.createTextNode(new_url));
        ul.appendChild(li);
    }
        
});