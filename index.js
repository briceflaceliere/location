var express = require('express');
var app = express();
var googleKey = 'AIzaSyBdUsv0R31zgmKVgZZwd9gNllln2TGbIG4';


app.use(express.static('public'));

app.listen(8078);