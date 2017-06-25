var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

var db;

module.exports.connect = function(url, callback) {
    MongoClient.connect(url, function(err, dbInstance) {
        assert.equal(null, err);
        module.exports.db = db = dbInstance;
        callback();
    });
};

module.exports.close = function() {
    db.close();
};