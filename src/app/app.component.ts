import {
  Component,
  NgZone,
  OnInit,
  OnDestroy,
  AfterContentChecked
} from '@angular/core';
import { merge, of, fromEvent, Subscription, interval, Subject } from 'rxjs';
import { switchMap, first, throttleTime } from 'rxjs/operators';

const WARNING_AFTER = 10000;

@Component({
  selector: 'app-root',
  template: `
    <h1>Inactivity Warning</h1>
  `
})
export class AppComponent implements OnInit, OnDestroy, AfterContentChecked {
  private subscriptions: Subscription[] = [];

  constructor(private zone: NgZone) {}

  public ngOnInit(): void {
    const mouseInteractionStream = this.zone.runOutsideAngular(() => {
      const mouseMoveSubject = new Subject();
      merge(
        of(''),
        fromEvent(document, 'click'),
        fromEvent(document, 'mousemove'),
        fromEvent(document, 'mousedown'),
        fromEvent(document, 'touchstart'),
        fromEvent(document, 'keypress'),
        fromEvent(document, 'scroll')
      )
        .pipe(throttleTime(1000))
        .subscribe(mouseMoveSubject);

      return mouseMoveSubject.asObservable();
    });

    mouseInteractionStream
      .pipe(switchMap(() => interval(WARNING_AFTER).pipe(first())))
      .subscribe(() => {
        window.alert('you are inactive');
      });
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public ngAfterContentChecked(): void {
    console.log('change');
  }
}
