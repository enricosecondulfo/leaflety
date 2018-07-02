import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  AfterContentInit,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';
import { MapManager } from './map.manager';
import { LatLng, LeafletMouseEvent } from 'leaflet';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'leaflety-map',
  templateUrl: './map.html',
  styleUrls: ['./map.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Map implements OnInit, AfterContentInit, OnChanges, OnDestroy {
  @Input() latitude: number;
  @Input() longitude: number;
  @Input() zoom: number;

  @Output() click: EventEmitter<void>;

  @ViewChild('mapContainer') mapContainer: ElementRef;

  private onDestroy$: Subject<boolean>;
  private addedToManager: boolean;

  constructor(private mapManager: MapManager) {
    this.click = new EventEmitter<void>();
    this.onDestroy$ = new Subject<boolean>();
    this.addedToManager = false;
  }

  ngOnInit(): void {}

  ngAfterContentInit(): void {
    this.mapManager.create(
      this.mapContainer.nativeElement as HTMLElement,
      this.latitude,
      this.longitude,
      this.zoom
    );

    this.addedToManager = true;
    this.addListeners();
  }

  centerByCoordinates(latLng: [number, number][]): void {
    this.mapManager.updateCenter(latLng);
  }

  flyToCoordinates(latLng: LatLng, zoom): void {
    this.mapManager.flyToCoordinates(latLng, zoom);
  }

  private addListeners(): void {
    this.mapManager
      .createObservable<LeafletMouseEvent>('click')
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((event: LeafletMouseEvent) => this.click.emit(null));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.addedToManager) {
      return;
    }

    if (changes['latitude'] || changes['longitude']) {
      const center: [number, number][] = [
        changes['latitude'].currentValue,
        changes['longitude'].currentValue
      ];

      this.mapManager.updateCenter(center);
    }
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
  }
}
