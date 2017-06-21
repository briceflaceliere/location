import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';

declare var google: any;

@Injectable()
export class GoogleAutocompService {

    protected autocomplete;

    public placeChangeEvent = new Subject();

    public bind(el, options) {
        let that = this;

        this.autocomplete = new google.maps.places.Autocomplete(el, options);

        this.autocomplete.addListener('place_changed', function(){
            var place = that.autocomplete.getPlace();
            if (!place) {
                return;
            }

            that.placeChangeEvent.next(place);
        });

        return this.autocomplete;
    }
}