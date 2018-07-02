import { Injectable } from '@angular/core';
import * as Leaflet from 'leaflet';
import { Map, LatLng, LeafletEvent } from 'leaflet';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

@Injectable()
export class MapManager {
  map$: BehaviorSubject<Map> = new BehaviorSubject<Map>(null);

  create(
    container: HTMLElement,
    latitude: number,
    longitude: number,
    zoom: number = 9
  ): void {
    const map: Map = new Map(container).setView([latitude, longitude], zoom);
    this.map$.next(map);

    Leaflet.tileLayer(
      'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
      {
        attribution: 'test',
        maxZoom: 20,
        id: 'mapbox.light',
        accessToken:
          'pk.eyJ1IjoiZW5yaWNvc2Vjb25kdWxmbyIsImEiOiJjamlhOHNkZjAwNmV2M2pvN3c5Y2E1bWlvIn0.jBjBHEUPVgkRboL6ZZuPSQ'
      }
    ).addTo(map);
  }

  updateCenter(latLng: [number, number][]): void {
    this.map$
      .pipe(filter(map => map !== null))
      .subscribe(map => map.flyToBounds(latLng));
  }

  flyToCoordinates(latLng: LatLng, zoom: number = 10): void {
    this.map$
      .pipe(filter(map => map !== null))
      .subscribe(map => map.flyTo(latLng, zoom));
  }

  createObservable<T extends LeafletEvent>(
    eventName: string
  ): Observable<LeafletEvent> {
    const event: Subject<T> = new Subject<T>();

    return this.map$.pipe(filter(map => map !== null)).pipe(
      switchMap(map => {
        map.on(eventName, (e: T) => {
          event.next(e);
        });

        return event;
      })
    );
  }
}
