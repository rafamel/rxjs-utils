import { Push } from '@definitions';
import { operate } from '../../utils/operate';
import { NullaryFn, TypeGuard } from 'type-core';

export interface DelayOptions<T> {
  /** Delay in millisecons */
  due?: number;
  /** Whether to also delay error and completion signals */
  signals?: boolean;
  condition?: (value: T, index: number) => boolean;
}

export function delay<T>(due?: number | DelayOptions<T>): Push.Operation<T> {
  const options = !due || TypeGuard.isNumber(due) ? { due } : due;
  const condition = options.condition;
  const signals = options.signals || false;
  const ms = options.due || 0;

  return operate<T>((obs) => {
    const pending: NullaryFn[] = [];
    const timeouts: Set<NodeJS.Timeout> = new Set();

    function queue(delay: boolean, fn: NullaryFn): void {
      if (delay) {
        schedule(fn);
      } else {
        if (timeouts.size) pending.push(fn);
        else fn();
      }
    }

    function schedule(fn: NullaryFn): void {
      const timeout = setTimeout(() => {
        timeouts.delete(timeout);
        fn();
        if (!timeouts.size) {
          while (pending.length) {
            const item = pending.shift() as NullaryFn;
            item();
          }
        }
      }, ms);
      timeouts.add(timeout);
    }

    let index = 0;
    let final = false;
    return [
      null,
      condition
        ? (value) => queue(condition(value, index++), obs.next.bind(obs, value))
        : (value) => queue(true, obs.next.bind(obs, value)),
      function error(error) {
        final = true;
        queue(signals, obs.error.bind(obs, error));
      },
      function complete() {
        final = true;
        queue(signals, obs.complete.bind(obs));
      },
      function teardown() {
        if (final) return;

        for (const timeout of timeouts) {
          clearTimeout(timeout);
        }
      }
    ];
  });
}
