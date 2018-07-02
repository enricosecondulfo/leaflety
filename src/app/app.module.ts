import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LeafletMapModule } from 'projects/leaflety-lib/src/public_api';
import {} from 'lottiery';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, LeafletMapModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
