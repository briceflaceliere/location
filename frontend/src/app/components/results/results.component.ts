import { Component, Output, EventEmitter, OnInit, Input, ChangeDetectorRef} from '@angular/core';
import { SearchService } from "../../services/search.service";
import {GoogleMapsService} from "../../services/google-map.service";
import {CitiesService} from "../../services/cities.service";

declare var $: any;
declare var google: any;

@Component({
  selector: 'results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
})
export class ResultsComponent implements OnInit {

  public results = null;

  public scroll = 0;

  public filteredCity = null;

  public filteredCityName = null;

  public filteredCityMarker = null;

  constructor(private changeDetector: ChangeDetectorRef,
              private googleMapService: GoogleMapsService,
              private searchService: SearchService,
              private citiesService: CitiesService) { }

  ngOnInit()
  {
    let that = this;

    this.searchService.resultsEvent.subscribe(function(results: any){
      that.results = results;

      var citiesCount = {};
      for (var i in that.results) {
        var result = that.results[i];
        if (result.cityId != null) {
          if (citiesCount[result.cityId] == undefined) {
            citiesCount[result.cityId] = 0;
          }
          citiesCount[result.cityId]++;
          that.citiesService.get(result.cityId).marker.setLabel()
        }
      }

      for (var id in citiesCount) {
        var city = that.citiesService.get(id);
        var marker = that.citiesService.get(id).marker;
        marker.setLabel({
          text: citiesCount[id].toString(),
          color: '#000000',
          fontWeight: 'bold'
        });
        marker.setIcon(that.getIcon());
        var addClick = function (marker, id, name) {
          marker.addListener('click', function () {
            if (that.filteredCity != null) {
              that.filteredCity.marker.setIcon(that.getIcon());
            }

            if (that.filteredCity != null && that.filteredCity.id == id) {
              that.filteredCity = null;
            } else {
              that.filteredCity = {id: id, marker: marker, name: name};
              marker.setIcon(that.getIcon(true));
            }
          });
        };
        addClick(marker, id, city.name);
      }
    });

    window.addEventListener('scroll', function () {
      that.scroll = document.body.scrollTop;
    });
  }

  onDeleteFilter() {
    if (this.filteredCity == null) {
      return null;
    }

    this.filteredCity.marker.setIcon(this.getIcon());
    this.filteredCity = null;
  }

  onOver(result) {
    if (result.cityId == null) {
      return;
    }
    var marker = this.citiesService.get(result.cityId).marker;
    marker.setIcon(this.getIcon(true));
  }

  onLeave(result) {
    if (this.filteredCity != null || result.cityId == null) {
      return;
    }
    var marker = this.citiesService.get(result.cityId).marker;
    marker.setIcon(this.getIcon());
  }

  topOfPage() {
    var pos = this.scroll;
    var interval = setInterval(function() {
      pos = pos - 100;
      document.body.scrollTop = document.documentElement.scrollTop = pos;
      if (pos <= 0) {
        clearInterval(interval);
      }
    }, 10)
  }

  protected getIcon(hover = false) {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 15,
      strokeWeight: 1,
      strokeColor: hover ? '#DF0101' : '#009900', // '#F00'
      fillColor: hover ? '#DF0101' : '#009900',
      fillOpacity: 0.7
    };
  }
}
