import { NgModule } from '@angular/core';
import { Map } from './map';
import { MapManager } from './map.manager';
import { AnimatedMarker } from '../animated-marker/animated-marker';
import { MarkerManager } from '../animated-marker/marker.manager';

@NgModule({
  declarations: [Map, AnimatedMarker],
  exports: [Map, AnimatedMarker],
  providers: [MapManager, MarkerManager]
})
export class LeafletMapModule {}
