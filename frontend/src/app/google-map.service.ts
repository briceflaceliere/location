import { Injectable } from '@angular/core';

declare var google: any;

const url = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBYnpxWkyjCS0cfkGgRqbLpdhfH49pjcZ0&libraries=places&callback=__onGoogleLoaded';

@Injectable()
export class GoogleMapsService {
    private promise;

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

    public bindMap(el, options) {
        return new google.maps.Map(el, options);
    }

    public bindAutocomp(el, options) {
        return new google.maps.places.Autocomplete(el, options);
    }
}