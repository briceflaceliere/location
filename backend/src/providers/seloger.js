var async = require('async');
var Crawler = require("crawler");
var moment = require('moment');

var baseUrl = 'http://www.seloger.com/list.htm?idtt=1&naturebien=1&tri=d_dt_crea';

module.exports.name = providerName = 'seloger.com';

module.exports.search = function (search, cities, progress, mainCallback) {
    var zipcodes = getZipcodes(cities);
    var length = Object.keys(zipcodes).length;
    progress.setMax('seloger.com', length);

    getAds(search, zipcodes, progress, mainCallback);
};


function getAds(search, zipcodes, progress, mainCallback) {
    var results = [];
    async.forEachOf(zipcodes, function (cities, zipcode, callback) {
        crawl(search, zipcode, function (err, ads) {
            if (!err) {
                results = results.concat(dispatchResult(cities, ads));
            }
            progress.next('seloger.com');
            callback(err);
        })
    }, function (err) {
        if (err) {
            console.error(err);
        }

        progress.done('seloger.com');
        mainCallback(err, results);
    });
}

function crawl(search, zipcode, callback) {
    var ads = [];
    var page = 1;
    var url = baseUrl;
    url += '&cp=' + zipcode;

    var room = [];
    if (search.room > 5) {
        room.push('5 et +');
    } else {
        for (var i = search.room; i <= 5; i++) {
            if (i == 5) {
                room.push('5 et +');
            } else {
                room.push(i);
            }
        }
    }
    url += '&nb_piece=' +  room.join(',');

    if (search.price) {
        url += '&pxmax=' + Math.round(search.price);
    }

    if (search.type == 1) {
        url += '&si_meuble=1';
    } else if (search.type == 2) {
        url += '&si_meuble=0';
    }

    var type = [];
    if (search.house) {
        type.push(2);
    }

    if (search.apartment) {
        type.push(1);
    }

    if (type.length == 0) {
        type = [1, 2];
    }

    url += '&idtypebien=' + type.join(',');

    console.log('First crawl: ' + url);

    var c = new Crawler({
        headers: {
            'Cookie': '__uzma=toto;__uzmd=toto;__uzmb=toto;__uzmc=toto'
        },
        maxConnections : 1,
        callback : function (error, res, done) {
            console.log('Crawl: ' + res.request.uri.href);
            if(error){
                console.error(error);
            }else{
                var results = findAds(res.$);
                if (results.length > 0) {
                    ads = ads.concat(results);

                    var nextEl = res.$('.pagination_next.active');
                    if (nextEl && nextEl.attr('href')) {
                        c.queue(nextEl.attr('href'));
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
    $('.main-wrap .content_result .liste_resultat article').each(function (index) {
        var el = $(this);
        var ad = {title: null, id: null, link: null, city: null, price: null, date: null, accuracy: 'low', roadTime: null, distance: null, images: [], provider: 'seloger.com'};
        ad.id = parseInt(el.attr('data-publication-id'));
        ad.link = el.find('.title a').attr('href');
        ad.city = el.find('.locality').text().trim();
        ad.title = el.find('.title a').text().trim();
        el.find('.property_list li').each(function () {
            ad.title += ' - ' + $(this).text().trim();
        });
        ad.price = parseInt(el.find('.price').text().trim().replace('[^0-9]', ''));
        if (el.find('.listing_photo_container img').length > 0) {
            ad.images.push(el.find('.listing_photo_container img').attr('src'));
        }

        console.log(ad);
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