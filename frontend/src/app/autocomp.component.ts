import { Component, ElementRef, Output, EventEmitter } from '@angular/core';
import { GoogleAutocompService } from './google-autocomp.service';

@Component({
  selector: 'autocomp',
  templateUrl: './autocomp.component.html',
})
export class AutocompComponent {

  protected autocomp;
  
  constructor(private el: ElementRef, private googleAutocompService: GoogleAutocompService) { }

  ngOnInit()
  {
    let that = this;

    that.autocomp = this.googleAutocompService.bind(that.el.nativeElement.firstChild, {
      componentRestrictions : {country: 'fr'}
    });
  }
}
