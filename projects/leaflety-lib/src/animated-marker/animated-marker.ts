import {
  Component,
  OnDestroy,
  AfterContentInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { Subject } from 'rxjs';
import { MarkerManager } from './marker.manager';
import { LeafletEvent } from 'leaflet';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'leaflety-animated-marker',
  template: '<ng-content></ng-content>'
})
export class AnimatedMarker implements AfterContentInit, OnChanges, OnDestroy {
  @Input() latitude: number;
  @Input() longitude: number;
  @Input() width: number;
  @Input() height: number;
  @Input() assetPath: string;
  @Input() prerender: string;
  @Input() loop: boolean;
  @Input() speed: number;
  @Input() steps: [number, number][];
  @Input() state: number;

  @Output() click: EventEmitter<void>;

  private onDestroy$: Subject<boolean>;
  private addedToManager: boolean;

  constructor(private manager: MarkerManager) {
    this.click = new EventEmitter<void>();
    this.onDestroy$ = new Subject<boolean>();
    this.addedToManager = false;
  }

  ngAfterContentInit(): void {
    this.manager.add(this, this.steps[this.state]);
    this.addedToManager = true;

    this.addListeners();
  }

  private addListeners(): void {
    this.manager
      .createObservable<LeafletEvent>('click', this)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(_ => {
        this.click.emit(null);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['state']) {
      this.manager.playSequence(this, this.steps[this.state]);
    }

    /*  if (changes['iconUrl'] || changes['iconWidth'] || changes['iconHeight']) {
      this.manager.updateIcon(this);
    } */
  }

  // TODO
  ngOnDestroy(): void {
    this.manager.remove(this);
    this.onDestroy$.next(null);
  }
}
