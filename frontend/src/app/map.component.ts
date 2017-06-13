import { Component, OnInit, ElementRef } from '@angular/core';
declare var google: any;

@Component({
    selector: 'map',
    template: '<div id="map"></div>',
    styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit
{
    public name;

    constructor(private  el: ElementRef) {}

    ngOnInit()
    {
       var map = new google.maps.Map(this.el.nativeElement.firstChild, {
            center: {lat: 46.864716, lng:  2.349014},
            zoom: 6
       });
    }
}