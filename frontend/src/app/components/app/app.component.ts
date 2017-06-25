import { Component, OnInit } from '@angular/core';
import { GoogleMapsService } from '../../services/google-map.service';
import { GoogleAutocompService } from '../../services/google-autocomp.service';
import { SearchService } from "../../services/search.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [GoogleMapsService, GoogleAutocompService, SearchService]
})
export class AppComponent {
  title = 'Find home';
}
