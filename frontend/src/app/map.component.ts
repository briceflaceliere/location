import { Component, OnInit, ElementRef } from '@angular/core';
import { GoogleMapsService } from './google-map.service';

@Component({
    selector: 'map',
    template: '<div id="map"></div>',
    styleUrls: ['./map.component.css'],
    providers: [GoogleMapsService]
})
export class MapComponent implements OnInit
{
    private map;

    constructor(private  el: ElementRef, private googleMapService: GoogleMapsService) { }

    ngOnInit()
    {
        this.map = this.googleMapService.bindMap(this.el.nativeElement.firstChild, {
            center: {lat: 46.864716, lng: 2.349014},
            zoom: 6
        });
    }

}