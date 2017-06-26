import { Component, Output, EventEmitter, OnInit, Input, ChangeDetectorRef} from '@angular/core';
import { Search } from './search';
import { GoogleAutocompService } from '../../services/google-autocomp.service';
import { SearchService } from "../../services/search.service";
import {Progress} from "./progress";
import {GoogleMapsService} from "../../services/google-map.service";

declare var $: any;
declare var google: any;

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit {

  public open = true;

  public waitSearch = false;

  public progress = new Progress();

  public search = new Search();
  
  public maxDates = [
    {value: 1, label: 'Hier'}, 
    {value: 2, label: 'Avant-hier'}, 
    {value: 7, label: 'Moins 1 semaine'},
    {value: 15, label: 'Moins 2 semaines'},
    {value: 31, label: 'Moins 1 mois'},
  ];

  public types = [
    {value: 0, label: 'Indiférent'},
    {value: 1, label: 'Meublé'},
    {value: 2, label: 'Non meublé'},
  ];

  constructor(private changeDetector: ChangeDetectorRef,
              private googleAutocompService: GoogleAutocompService,
              private googleMapService: GoogleMapsService,
              private searchService: SearchService) { }

  ngOnInit()
  {
    let that = this;

    this.googleAutocompService.placeChangeEvent.subscribe(function(place: any){
      that.search.lat = place.geometry.location.lat();
      that.search.lng = place.geometry.location.lng();
      that.changeDetector.detectChanges();
    });

    this.searchService.connect('http://localhost:8078');

    this.searchService.searchProgressEvent.subscribe(function(progress: Progress) {
      that.progress = progress;
    });

    this.searchService.addCityEvent.subscribe(function(city: any) {
      that.googleMapService.addMarker(city.location, {
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          strokeWeight: 1,
          strokeColor: '#404040', // '#F00'
          fillColor: '#404040',
          fillOpacity: 0.7
        },
        title: city.name + ' (' + (city.roadTime - 5) + '-' + city.roadTime + 'min | ' + city.roadTime + 'km)'
      });
    });
  }

  public onSubmit()
  {
    this.googleMapService.clear();
    this.waitSearch = true;

    this.searchService.search(this.search);
  }

  public onClose()
  {
    console.log('close');
  }

}
