var express = require('express');
var exphbs = require('express-handlebars');
var path = require('path');
var socket = require('socket.io');
var app = express();

// set view engine
//app.engine('handlebars', exphbs({defaultLayout: 'index'}));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
	res.render('index', {

	});
});

var server = app.listen(process.env.PORT || 8080, function() {
	var port = server.address().port;
	console.log('Running on port', port);
});

//Setup Socket
var io = socket(server);

var global_state = "";
var global_current_time = 0;

io.on('connection', function(socket) {
	console.log('Socket connection made');

	update_log = setInterval(function () {
		console.log('State: ' + global_state);
		console.log('Time: ' + global_current_time);
	}, 1000);

	socket.on('btn_clicked', function() {
		console.log('button click recieved from client side');
		io.emit('btn_click_recieved', {
			
		});
	});

	socket.on('emit_play', function() {
		io.emit('play_recieved', {

		});
	});

	socket.on('emit_pause', function(data) {
		//console.log(data);
		io.emit('pause_recieved', {
			time_seconds: data
		});
	});

	socket.on('emit_buffering', function() {
		io.emit('buffering_recieved', {

		});
	});

	socket.on('get_state', function() {
		io.emit('get_state_recieved', {
			state: global_state,
			time: global_current_time
		})
	});

	socket.on('update_state', function(data) {
		global_state = data['current_state'];
		global_current_time = data['current_time'];
	});


});
