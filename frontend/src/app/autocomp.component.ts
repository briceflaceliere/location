import { Component, ElementRef, OnInit, Output, EventEmitter } from '@angular/core';
import { GoogleAutocompService } from './google-autocomp.service';
import { GoogleMapsService } from './google-map.service';

declare var google: any;

@Component({
  selector: 'autocomp',
  templateUrl: './autocomp.component.html',
})
export class AutocompComponent implements OnInit {

  constructor(private el: ElementRef, private googleMapService: GoogleMapsService, private googleAutocompService: GoogleAutocompService) { }

  ngOnInit()
  {
    let that = this;

    this.googleMapService.load()
        .then(that.onGoogleMapLoaded.bind(this));
  }

  protected onGoogleMapLoaded() {
    this.googleAutocompService.bind(this.el.nativeElement.firstChild, {
      componentRestrictions : {country: 'fr'}
    });

    this.googleAutocompService.placeChangeEvent.subscribe(this.onPlaceChange.bind(this));
  }

  protected onPlaceChange(place)
  {
    if (!place.geometry) {
      alert('Place detail not found');
      return;
    }

    this.googleMapService.clear().addMarker(place.geometry.location, {
      title: place.formatted_address
    });
  }
}
