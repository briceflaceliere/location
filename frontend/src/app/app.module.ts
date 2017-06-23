import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';

import { AppComponent } from './app.component';
import { MapComponent } from './map.component';
import { SearchComponent } from './search.component';
import { AutocompComponent } from './autocomp.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    SearchComponent,
    AutocompComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
