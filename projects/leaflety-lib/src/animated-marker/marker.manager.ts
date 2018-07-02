import { Injectable } from '@angular/core';
import * as Leaflet from 'leaflet';
import {
  Marker,
  Map as LMap,
  LatLng,
  MarkerOptions,
  LeafletEvent
} from 'leaflet';
import { filter } from 'rxjs/operators';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { AnimatedMarker } from './animated-marker';
import { MapManager } from '../map/map.manager';
import * as Lottie from 'lottie-web';

@Injectable()
export class MarkerManager {
  private markers = new Map<
    AnimatedMarker,
    { drawedMarker: Marker; animation: any }
  >();

  private markerCreated$ = new BehaviorSubject<AnimatedMarker>(null);

  constructor(private mapManager: MapManager) {}

  add(marker: AnimatedMarker, sequence: [number, number]): void {
    this.mapManager.map$
      .pipe(filter(map => map !== null))
      .subscribe((map: LMap) => {
        const { drawedMarker, animation } = this.createMarker(marker, map);

        this.markers.set(marker, {
          drawedMarker: drawedMarker,
          animation: animation
        });

        this.markerCreated$.next(marker);
      });
  }

  playSequence(
    marker: AnimatedMarker,
    sequence: [number, number] | [number, number][],
    loop: boolean = false
  ): void {
    this.markerCreated$
      .pipe(filter(currentMarker => currentMarker === marker))
      .subscribe(_ => {
        const { animation } = this.markers.get(marker);

        animation.addEventListener('DOMLoaded', () => {
          // animation.loop = true;
          animation.playSegments(sequence, true);
        });
      });
  }

  remove(marker: AnimatedMarker): void {
    this.markerCreated$
      .pipe(filter(currentMarker => currentMarker === marker))
      .subscribe(_ => {
        const { drawedMarker, animation } = this.markers.get(marker);
        drawedMarker.remove();
        animation.destroy();
      });
  }

  createObservable<T extends LeafletEvent>(
    eventName: string,
    marker: AnimatedMarker
  ): Observable<T> {
    const event: Subject<T> = new Subject<T>();

    this.markerCreated$
      .pipe(filter(currentMarker => currentMarker === marker))
      .subscribe(_ => {
        const { drawedMarker } = this.markers.get(marker);
        drawedMarker.on(eventName, (e: T) => {
          event.next(e);
        });
      });

    return event;
  }

  private createMarker(
    marker: AnimatedMarker,
    map: LMap
  ): { drawedMarker: Marker; animation: any } {
    const markerOptions: MarkerOptions = <MarkerOptions>{
      icon: Leaflet.divIcon({
        iconSize: [marker.width || 40, marker.height || 40]
      })
    };

    const drawedMarker: Marker = Leaflet.marker(
      <LatLng>{
        lat: marker.latitude,
        lng: marker.longitude
      },
      markerOptions
    );
    drawedMarker.addTo(map);

    // Temp Implementation
    drawedMarker.getElement().style.backgroundColor = 'transparent';
    drawedMarker.getElement().style.border = 'none';

    const animationOptions = {
      container: drawedMarker.getElement(),
      path: marker.assetPath || '',
      prerender: marker.prerender || true,
      autoplay: false,
      loop: false
    };

    const animation = Lottie.loadAnimation(animationOptions);

    return { drawedMarker: drawedMarker, animation: animation };
  }
}
