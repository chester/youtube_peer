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

io.on('connection', function() {
	console.log('Socket connection made');
});