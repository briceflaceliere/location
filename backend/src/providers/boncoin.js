
var baseUrl = 'https://www.leboncoin.fr/locations/offres/ile_de_france/occasions/?th=1&location=21000%2C17000'
var maxCityByRequest = 3;

module.exports.name = 'leboncoin.fr';

module.exports.search = function (search, cities, progress, mainCallback) {
    var zipcodes = getZipcodes(cities);
    var countPage = countPages(zipcodes);
    console.log(zipcodes);
};


function countPage(zipcodes) {
    var count = 0;
    var groupZipCode = [];
    for (var i in cities) {

    }
    return zipcodes;
}


function getZipcodes(cities) {
    var zipcodes = {};
    for (var i in cities) {
        var city = cities[i];
        if (zipcodes[city.zipcode] == undefined || !Array.isArray(zipcodes[city.zipcode])) {
            zipcodes[city.zipcode] = [];
        }

        zipcodes[city.zipcode].push(city);
    }
    return zipcodes;
}
