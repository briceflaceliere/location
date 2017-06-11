function init() {

    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 46.864716, lng:  2.349014},
        zoom: 6
    });
    var placeService = new google.maps.places.PlacesService(map);

    var bounds = new google.maps.LatLngBounds();

    if (results) {
        var cityMarkers = [];
        for (var i in results) {
            var latlng = new google.maps.LatLng(results[i].latitude,results[i].longitude);
            var cityMarker = new google.maps.Marker({
                position: latlng,
                map: map,
                title: results[i].nom_commune
            });
            cityMarkers.push(cityMarker);
           /* var infowindow = new google.maps.InfoWindow({
                content: results[i].nom_commune
            });

            cityMarker.addListener('click', function() {
                infowindow.open(map, cityMarker);
            });*/
            bounds.extend(latlng);
        }
        map.fitBounds(bounds);
    } else {
        var input = document.getElementById('localisation');

        var options = { componentRestrictions : {country: 'fr'}};
        var autocomplete = new google.maps.places.Autocomplete(input, options);
        autocomplete.bindTo('bounds', map);

        var marker = new google.maps.Marker({
            map: map,
            anchorPoint: new google.maps.Point(0, -29)
        });

        var timeInput = document.getElementById('time');
        var circle = null;

        var changeFn = function() {
            marker.setVisible(false);
            var submit = document.getElementById('submit');
            var dataInput = document.getElementById('data');
            dataInput.value = '';
            submit.disabled = true;
            if (circle) {
                circle.setMap(null);
            }

            var place = autocomplete.getPlace();
            if (!place) {
                return;
            }

            if (!place.geometry) {
                alert('Place detail not found');
                return;
            }


            marker.setIcon(/** @type {google.maps.Icon} */({
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(35, 35)
            }));
            marker.setPosition(place.geometry.location);
            marker.setVisible(true);

            var distance =  (2.166666667 * timeInput.value);
            console.log(distance + " km");

            circle = new google.maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.20,
                map: map,
                center: place.geometry.location,
                radius: distance * 1000
            });

            map.fitBounds(circle.getBounds());

            dataInput.value = JSON.stringify(place);
            submit.disabled = false;
        };

        timeInput.addEventListener('change', changeFn);
        autocomplete.addListener('place_changed', changeFn);
    }
}