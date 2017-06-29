var async = require('async');
var Crawler = require("crawler");
var moment = require('moment');

var baseUrl = 'https://www.leboncoin.fr/locations/offres/ile_de_france/occasions/?th=1&location=21000%2C17000';

module.exports.name = providerName = 'leboncoin.fr';

module.exports.search = function (search, cities, progress, mainCallback) {
    var zipcodes = getZipcodes(cities);
    var length = Object.keys(zipcodes).length;
    progress.setMax(providerName, length);

    getAds(search, zipcodes, progress, mainCallback);
};


function getAds(search, zipcodes, progress, mainCallback) {
    var results = [];
    async.forEachOf(zipcodes, function (cities, zipcode, callback) {
        crawl(search, zipcode, function (err, ads) {
            if (!err) {
                results = results.concat(dispatchResult(cities, ads));
            }
            progress.next(providerName);
            callback(err);
        })
    }, function (err) {
        if (err) {
            console.error(err);
        }
        mainCallback(err, results);
    });
}

function crawl(search, zipcode, callback) {
    var ads = [];

    var page = 1;
    var url = baseUrl;
    url += '&o=' + page;
    url += '&location=' + zipcode;

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
                        var nextEl = res.$('a#next');
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
    $('#listingAds .mainList .tabsContent li[itemtype="http://schema.org/Offer"]').each(function (index) {
        var el = $(this);
        var ad = {title: null, id: null, link: null, city: null, price: null, date: null, roadTime: null, ditance: null, images: [], provider: providerName};
        var linkEl = el.children();
        var infoEl = el.find('.item_infos');
        ad.title = linkEl.attr('title');
        ad.link = 'https:' + linkEl.attr('href');
        ad.id = parseInt(el.find('.saveAd').attr('data-savead-id'));
        ad.city = infoEl.find('[itemprop=address]').first().attr('content');
        ad.price = parseInt(infoEl.find('[itemprop=price]').attr('content'));
        ad.date = infoEl.find('[itemprop=availabilityStarts]').attr('content');

        var imgSrc = el.find('.item_imagePic .lazyload').first().attr('data-imgsrc');
        if (imgSrc) {
            ad.images.push('https:' + imgSrc);
        }

        ads.push(ad);
    });
    return ads;
}

function getZipcodes(cities) {
    var zipcodes = {};
    for (var i in cities) {
        var city = cities[i];
        if (zipcodes[city.zipcode] == undefined || !Array.isArray(zipcodes[city.zipcode])) {
            zipcodes[city.zipcode] = [];
        }

        city.matchKey = getMatchKey(city.name);
        zipcodes[city.zipcode].push(city);
    }
    return zipcodes;
}


function getMatchKey(name) {
    var excludeWords = ['ST', 'STE', 'SAINTE', 'SAINT']
    var words = name.toUpperCase().split(/[^A-Z]/);
    var key = '';
    for (var i in words) {
        var word = words[i];
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
            ads[i].cityId = zipcode[index]._id;
            ads[i].roadTime = zipcode[index].roadTime;
            ads[i].distance = zipcode[index].distance;
        }
    }

    return ads;
}