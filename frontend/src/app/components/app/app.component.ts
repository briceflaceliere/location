import { Component, OnInit } from '@angular/core';
import { GoogleMapsService } from '../../services/google-map.service';
import { GoogleAutocompService } from '../../services/google-autocomp.service';
import { SearchService } from "../../services/search.service";
import {CitiesService} from "../../services/cities.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [GoogleMapsService, GoogleAutocompService, SearchService, CitiesService]
})
export class AppComponent {
  title = 'Find home';
}
