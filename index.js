var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var geolib = require('geolib');
var fs = require('fs');
var app = express();
var cityDatabase = JSON.parse(fs.readFileSync('bdd/city.json'));

var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyBdUsv0R31zgmKVgZZwd9gNllln2TGbIG4'
});

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(express.static('public'));

app.get('/', function(req, res) {
    res.render('index.ejs', {results : null});
});

app.post('/', function(req, res) {

    var params = req.body;
    if (!params.data || !params.time || !params.nbPiece) {
        res.redirect('/');
        return;
    }

    params.data = JSON.parse(params.data);
    params.time = parseInt(params.time);
    params.nbPiece = parseInt(params.nbPiece);

    var location = params.data.geometry.location;
    var radius = (2.166666667 * params.time) * 1000;

    searchCity(location, radius, params.time, res);
});


app.listen(8078);

function searchCity(latLng, radius, time, res) {
    var cacheKey = 'cache/' + latLng.lat + '-' + latLng.lng + '-' + radius
    if (fs.existsSync(cacheKey)) {
        console.log('result in cache');
        var results = JSON.parse(fs.readFileSync(cacheKey));
        res.render('index.ejs', {results : results});
        return;
    }

    var resuls = [];
    for (var i in cityDatabase) {

        var distance = geolib.getDistanceSimple(
            cityDatabase[i],
            latLng
        );

        if (distance <= radius) {
            resuls.push(cityDatabase[i]);
        }
    }

    console.log(resuls.length);

    async.filter(resuls, function(result, callback) {

        googleMapsClient.directions({
            origin: latLng,
            destination: [result.latitude, result.longitude],
            alternatives: false,
            units: 'metric',
            region: 'fr'
        }, function(err, response) {
            if (!err && response.json.routes[0]) {
                var roadTime = response.json.routes[0].legs[0].duration.value / 60;
                console.log(roadTime + 'min');
                callback(null, roadTime < time + 1);
            } else {
                console.log(err.json);
                callback(err, !err);
            }
        });
    }, function (err, results) {
        console.log(resuls.length);
        fs.writeFileSync(cacheKey, JSON.stringify(results));
        res.render('index.ejs', {results : results});
    });

    return resuls;
}