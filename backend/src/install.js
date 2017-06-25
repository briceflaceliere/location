var fs = require('fs');
var assert = require('assert')
var db = require('./mongodb.js').db;

module.exports.install = function () {
  console.log('***** Install ******');
  console.log('- City import in mongo');

  var cities = JSON.parse(fs.readFileSync(__dirname + '/../data/city.json'));

  //format city data
  for (var i in cities) {
    var city = cities[i];
    city = {
        name: city.nom_commune,
        zipcode: city.cp,
        insee: city.insee,
        location:  {lat: city.latitude, lng: city.longitude},
        geoJson: {type: "Point", coordinates: [city.longitude, city.latitude]}
    };
    cities[i] = city;
  }
  db.collection('directionCaches').drop();

  var collection = db.collection('cities');
  collection.drop(function () {
     collection.createIndex({geoJson: '2dsphere'}, {}, function () {
        // Insert some documents
        collection.insertMany(
            cities
            , function(err, result) {
                assert.equal(err, null);
                assert.equal(cities.length, result.result.n);
                assert.equal(cities.length, result.ops.length);
                console.log('- City import in mongo : done');
                db.close();
                console.log('***** Install : done ******');
            });
    });
  });



};
