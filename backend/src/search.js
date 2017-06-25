var db = require('./mongodb.js').db;
var assert = require('assert');
var async = require('async');
var progressBuilder = require('./progress.js');
var providers = require('./providers.js').getProviders();

var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyBdUsv0R31zgmKVgZZwd9gNllln2TGbIG4'
});

module.exports.search = function (socket, search, callback) {
    console.log('** Search **', search);
    var progress = progressBuilder.init(providers);
    socket.emit('search-progress', progress.getProgress());

    var radius = (2.166666667 * search.time) * 1000;
    getNearCities(search.lat, search.lng, radius, function (cities) {

        progress.setMax('city', cities.length);
        var filteredCities = [];

        async.each(cities, function (city, callback) {
            getDirection({lat: search.lat, lng: search.lng}, city, function(city) {
                console.log('Direction request: ', city);
                socket.emit('search-progress', progress.next('city'));
                if (city.roadTime && city.roadTime < search.time + 5) {
                    filteredCities.push(city);
                    socket.emit('city', city);
                }
                callback();
            });
        }, function () {
            progress.city = true;
            socket.emit('search-progress', progress.done('city'));
        });
    });
};


function getNearCities(lat, lng, radius, callback) {
    var collection = db.collection('cities');
    var request = {
        geoJson: {
            $near: {
                $geometry: {
                    type: "Point" ,
                    coordinates: [lng, lat]
                },
                $maxDistance: radius
            }
        }
    };
    collection.find(request).toArray(function(err, cities) {
        assert.equal(err, null);
        console.log("City found: " + cities.length);
        callback(cities);
    });
}

function getDirection(origin, city, callback) {
    var directionCaches = db.collection('directionCaches');
    directionCaches.findOne({origin: origin, destination: city.location}, function (err, cache) {
        assert.equal(err, null);
        if (cache) {
            console.log('In cache');
            callback(cache.city);
        } else {
            googleMapsClient.directions({
                origin: origin,
                destination: city.location,
                alternatives: false,
                units: 'metric',
                region: 'fr'
            }, function(err, response) {
                if (!err && response.json.routes[0]) {
                    var roadTime = response.json.routes[0].legs[0].duration.value / 60;
                    var distance = response.json.routes[0].legs[0].distance.value / 1000;
                    city.roadTime = Math.round(roadTime);
                    city.distance = Math.round(distance * 10) / 10;
                }
                directionCaches.insert({
                    city: city, origin: origin, destination: city.location
                }, function(err, result) {
                    callback(city);
                });
            });
        }
    });
}