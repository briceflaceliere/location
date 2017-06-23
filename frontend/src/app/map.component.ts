import { Component, OnInit, ElementRef} from '@angular/core';
import { GoogleMapsService } from './google-map.service';
import { GoogleAutocompService } from './google-autocomp.service';

@Component({
    selector: 'map',
    template: '<div id="map"></div>',
    styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit
{

    constructor(private  el: ElementRef,
                private googleMapService: GoogleMapsService, 
                private googleAutocompService: GoogleAutocompService) { }

    ngOnInit()
    {
        let that = this;
        this.googleMapService.load()
            .then(that.onGoogleMapLoaded.bind(this));
    }

    protected onGoogleMapLoaded() {
        this.googleMapService.bind(this.el.nativeElement.firstChild, {
            center: {lat: 46.864716, lng: 2.349014},
            zoom: 6
        });
    }
}