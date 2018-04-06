var express = require('express');
var app = express();

app.get('/', function(req, res) {
	res.send('Hello');
});

var server = app.listen(process.env.PORT || 8080, function() {
	var port = server.address().port;
	console.log('Running on port', port);
});

