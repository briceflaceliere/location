import { Component, OnInit } from '@angular/core';
import { GoogleMapsService } from './google-map.service';
import { GoogleAutocompService } from './google-autocomp.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [GoogleMapsService, GoogleAutocompService]
})
export class AppComponent {
  title = 'Find home';
}
