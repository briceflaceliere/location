import { Component, ElementRef } from '@angular/core';
import { GoogleMapsService } from './google-map.service';

@Component({
  selector: 'autocomp',
  templateUrl: './autocomp.component.html',
  providers: [GoogleMapsService]
})
export class AutocompComponent {

  private autocomp;

  constructor(private el: ElementRef, private googleMapService: GoogleMapsService) { }

  ngOnInit()
  {
    var options = { componentRestrictions : {country: 'fr'}};
    this.autocomp = this.googleMapService.bindAutocomp(this.el.nativeElement.firstChild, {
      componentRestrictions : {country: 'fr'}
    });
  }
}
