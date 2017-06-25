import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';

declare var google: any;

@Injectable()
export class GoogleAutocompService {

    protected autocomplete;

    protected bindPromise;

    public placeChangeEvent = new Subject();

    public bind(el, options) {
        let that = this;

        this.bindPromise = new Promise( resolve => {
            that.autocomplete = new google.maps.places.Autocomplete(el, options);

            that.autocomplete.addListener('place_changed', function () {
                var place = that.autocomplete.getPlace();
                if (!place) {
                    return;
                }

                if (!place.geometry) {
                    alert('Place detail not found');
                    return;
                }

                that.placeChangeEvent.next(place);
            });

            resolve(that.autocomplete);
        });

        return this.bindPromise;
    }
    
    
}