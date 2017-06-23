import { Component, Output, EventEmitter, OnInit, Input, ChangeDetectorRef} from '@angular/core';

import { GoogleAutocompService } from './google-autocomp.service';

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit{

  public selectedPlace;

  constructor(private changeDetector: ChangeDetectorRef, private googleAutocompService: GoogleAutocompService) { }

  ngOnInit()
  {
    let that = this;

    this.googleAutocompService.placeChangeEvent.subscribe(function(place){
      that.selectedPlace = place;
      that.changeDetector.detectChanges();
      console.log(that);
    });
  }

  public onSubmit(search)
  {
    console.log(search);


  }

}
