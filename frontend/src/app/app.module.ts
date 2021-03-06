import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';

import { AppComponent } from './components/app/app.component';
import { MapComponent } from './components/map/map.component';
import { SearchComponent } from './components/search/search.component';
import { AutocompComponent } from './components/autocomp/autocomp.component';
import { ResultsComponent } from "./components/results/results.component";

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    SearchComponent,
    AutocompComponent,
    ResultsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
