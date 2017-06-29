import { Injectable } from '@angular/core';

declare var google: any;

const url = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBYnpxWkyjCS0cfkGgRqbLpdhfH49pjcZ0&libraries=places&callback=__onGoogleLoaded';

@Injectable()
export class GoogleMapsService {
    private promise;

    private bindPromise;

    private map;

    private markers = [];

    public load() {
        // First time 'load' is called?
        if (!this.promise) {

            // Make promise to load
            this.promise = new Promise( resolve => {

                // Set callback for when google maps is loaded.
                window['__onGoogleLoaded'] = (ev) => {
                    resolve('google maps api loaded');
                };

                let node = document.createElement('script');
                node.src = url;
                node.type = 'text/javascript';
                document.getElementsByTagName('head')[0].appendChild(node);
            });
        }

        // Always return promise. When 'load' is called many times, the promise is already resolved.
        return this.promise;
    }

    public bind(el, options) {
        let that = this;
        this.bindPromise = new Promise( resolve => {
            that.map = new google.maps.Map(el, options);
            resolve(that.map);
        });

        return this.bindPromise;
    }

    public addMarker(position, markerOptions = {}, callback = null)
    {
        let that = this;
        this.bindPromise.then(function () {
            Object.assign(markerOptions, {map: that.map, position: position})
            let marker = new google.maps.Marker(markerOptions);
            that.markers.push(marker);

            //bounds map
            if (that.markers.length == 1) {
                that.map.panTo(that.markers[0].getPosition());
                that.map.setZoom(10);
            } else {
                let bounds = new google.maps.LatLngBounds();
                for (let i in that.markers) {
                    bounds.extend(that.markers[i].getPosition());
                }
                that.map.fitBounds(bounds);
            }
            
            if (callback != null) {
                callback(marker);
            }
        });

        return this;
    }

    public clear()
    {
        for (let i in this.markers) {
            this.markers[i].setMap(null);
        }

        this.markers = [];
        return this;
    }
}