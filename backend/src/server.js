var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var search = require('./search.js');

module.exports.start = function (port) {
    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

    io.on('connection', function (socket) {
        console.log('onConnect');
        socket.on('search', function (data) {
            search.search(socket, data);
        });
        socket.on('disconnect', function () {
            console.log('onClose');
        });
    });

    server.listen(port);
    console.log('Backend start in port ' + port);
};
