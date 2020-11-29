import { Push } from '@definitions';
import { Observable } from '../classes/Observable';
import { TypeGuard } from 'type-core';

export function fromEvent<T>(
  source: NodeJS.EventEmitter,
  name: string | symbol
): Push.Observable<T>;
export function fromEvent(
  source: EventTarget,
  name: string,
  capture?: boolean
): Push.Observable<Event>;
export function fromEvent(
  source: NodeJS.EventEmitter | EventTarget,
  name: string | symbol,
  capture?: boolean
): Push.Observable {
  if (TypeGuard.isEventTarget(source)) {
    return new Observable<Event>((obs) => {
      function listener(event: Event): void {
        obs.next(event);
      }

      try {
        source.addEventListener(name as string, listener, capture);
      } catch (error) {
        obs.error(error);
      }

      return () => source.removeEventListener(name as string, listener);
    });
  }

  if (TypeGuard.isEventEmitterLike(source)) {
    return new Observable((obs) => {
      function listener(...events: any[]): void {
        events.length > 1 ? obs.next(events) : obs.next(events[0]);
      }

      try {
        source.addListener(name, listener);
      } catch (error) {
        obs.error(error);
      }

      return () => source.removeListener(name, listener);
    });
  }

  throw new Error('Source must be an EventEmitter or EventTarget');
}
