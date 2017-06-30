var async = require('async');
var Crawler = require("crawler");
var moment = require('moment');
var http = require('http');

var baseUrl = 'http://www.logic-immo.com/location-immobilier-toutes-communes-17000';

module.exports.name = providerName = 'logic-immo.com';

module.exports.search = function (search, cities, progress, mainCallback) {
    getZipcodes(cities, function(err, zipcodes){
        console.log(zipcodes);
        var length = Object.keys(zipcodes).length;
        progress.setMax('logic-immo.com', length);

        getAds(search, zipcodes, progress, mainCallback);
    });

};


function getAds(search, zipcodes, progress, mainCallback) {
    var results = [];
    async.forEachOf(zipcodes, function (cities, zipcode, callback) {
        crawl(search, zipcode, function (err, ads) {
            if (!err) {
                results = results.concat(dispatchResult(cities, ads));
            }
            progress.next('logic-immo.com');
            callback(err);
        })
    }, function (err) {
        if (err) {
            console.error(err);
        }

        progress.done('logic-immo.com');
        mainCallback(err, results);
    });
}

function crawl(search, zipcode, callback) {
    var ads = [];
    var page = 1;
    var url = baseUrl;
    url += ',' + zipcode;

    var type = [];
    if (search.house) {
        type.push(2);
        type.push(6);
        type.push(7);
        type.push(12);
    }

    if (search.apartment) {
        type.push(1);
    }

    if (type.length == 0) {
        type = [1,2,6,7,12,15];
    }

    url += '/options/groupprptypesids=' + type.join(',');

    if (search.price) {
        url += '/pricemax=' + Math.round(search.price);
    }

    var room = [];
    if (search.room > 6) {
        room.push(6);
    } else {
        for (var i = search.room; i <= 6; i++) {
            room.push(i);
        }
    }
    url += '/nbrooms=' +  room.join(',');


    if (search.type == 1) {
        url += '/searchoptions=4';
    }

    console.log('First crawl: ' + url);

    var c = new Crawler({
        maxConnections : 2,
        callback : function (error, res, done) {
            console.log('Crawl: ' + res.request.uri.href);
            if(error){
                console.error(error);
            }else{
                var results = findAds(res.$);
                if (results.length > 0) {
                    var last = results[results.length - 1];
                    var nextPage = moment(last.date).isSameOrAfter(search.maxDate, 'day');

                    results = results.filter(function (ad) {
                        return moment(ad.date).isSameOrAfter(search.maxDate, 'day');
                    });

                    ads = ads.concat(results);

                    if (nextPage) {
                        var nextEl = res.$('.pagination .next a');
                        if (nextEl && nextEl.attr('href')) {
                            var url = 'https:' + nextEl.attr('href');
                            c.queue(url);
                        }
                    }
                }
            }
            done();
        }
    });

    c.queue(url);

    c.on('drain',function(){
        callback(null, ads);
    });
}

function findAds($) {
    var ads = [];
    $('.container .offer-list-content div[itemtype="http://schema.org/ApartmentComplex"]').each(function (index) {
        var el = $(this).children();
        var ad = {title: null, id: null, link: null, city: null, price: null, date: null, accuracy: 'low', roadTime: null, distance: null, images: [], provider: 'seloger.com'};
        ad.id = el.attr('id').substring(13);
        var linkEl = el.find('.offer-type a');
        if (linkEl.attr('data-orpi')) {
            ad.link = 'http://www.logic-immo.com' + linkEl.attr('data-orpi');
        } else {
            ad.link = linkEl.attr('href');
        }
        ad.title = el.find('.offer-type a').attr('title');
        ad.city = el.find('.offer-places-block span').first().text().trim();
        if (ad.city == '') {
            ad.city = el.find('.offer-places-block h2').first().html().trim();
            ad.city = ad.city.split('<')[0].trim();
        }
        ad.price = parseInt(el.find('.offer-price span').text().trim().replace(/[^0-9]/g, ''));
        if (el.find('.offer-picture img[itemprop="image"]').length > 0) {
            ad.images.push(el.find('.offer-picture img[itemprop="image"]').attr('src'));
        }
        var date = el.find('.offer-update').first().text().trim().replace(/[^0-9/]/g, '').split('/');
        ad.date = date[2] + '-' + date[1] + '-' + date[0];

        console.log(ad);
        ads.push(ad);
    });
    return ads;
}

function getZipcodes(cities, mainCallback) {
    var zipcodes = {};
    for (var i in cities) {
        var city = cities[i];
        if (zipcodes[city.zipcode] == undefined || !Array.isArray(zipcodes[city.zipcode])) {
            zipcodes[city.zipcode] = [];
        }

        city.matchKey = getMatchKey(city.name);
        zipcodes[city.zipcode].push(city);
    }

    var finalList = {};
    async.eachOf(zipcodes, function (cities, zipcode, callback) {
        var url = 'http://www.logic-immo.com/asset/t9/getLocalityT9.php?site=fr&lang=fr&json="' + zipcode + '"';
        console.log('Autocomp :' + url);
        http.get(url, function(res) {
            if (res.statusCode !== 200) {
                callback(new Error('Autocomp failed'));
                res.resume();
            } else {
                res.setEncoding('utf8');
                var rawData = '';
                res.on('data', function(chunk) { rawData += chunk; });
                res.on('end', function() {
                    console.log('row data');
                    console.log(rawData);
                    var parsedData = JSON.parse(rawData);
                    for (var i in parsedData) {
                        if (parsedData[i].name == 'Ville(s)') {
                            var city = parsedData[i].children[0];
                            finalList[city.lct_id + '_' + city.lct_level] = cities;
                            break;
                        }
                    }
                    callback();
                });
            }
        });
    }, function() {
        mainCallback(null, finalList);
    });
}


function getMatchKey(name) {
    var excludeWords = ['ST', 'STE', 'SAINTE', 'SAINT'];
    var words = accentsTidy(name).toUpperCase().split(/[^A-Z]/g);
    var key = '';
    for (var i in words) {
        var word = words[i];
        //console.log(word, excludeWords.indexOf(word));
        if (word.length >= 3 && excludeWords.indexOf(word) == -1) {
            key += word;
        }
    }
    return key;
}

function dispatchResult(zipcode, ads) {
    var cityKey = [];
    for (var i in zipcode) {
        cityKey.push(zipcode[i].matchKey);
    }

    for (var i in ads) {
        var ad = ads[i];
        var adKey = getMatchKey(ad.city);
        var index = cityKey.indexOf(adKey);

        if (index != -1) {
            ads[i].accuracy = 'high';
        } else {
            ads[i].accuracy = 'low';
            index = 0;
        }
        
        ads[i].cityId = zipcode[index]._id;
        ads[i].roadTime = zipcode[index].roadTime;
        ads[i].distance = zipcode[index].distance;
    }

    return ads;
}

accentsTidy = function(s){
    var r=s.toLowerCase();
    r = r.replace(new RegExp(/[àáâãäå]/g),"a");
    r = r.replace(new RegExp(/æ/g),"ae");
    r = r.replace(new RegExp(/ç/g),"c");
    r = r.replace(new RegExp(/[èéêë]/g),"e");
    r = r.replace(new RegExp(/[ìíîï]/g),"i");
    r = r.replace(new RegExp(/ñ/g),"n");
    r = r.replace(new RegExp(/[òóôõö]/g),"o");
    r = r.replace(new RegExp(/œ/g),"oe");
    r = r.replace(new RegExp(/[ùúûü]/g),"u");
    r = r.replace(new RegExp(/[ýÿ]/g),"y");
    return r;
};