import { NoParamFn, Push } from '@definitions';
import { TypeGuard } from '@helpers';
import { operate } from '../utils';

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

  return operate<T>((tb) => {
    const pending: NoParamFn[] = [];
    const timeouts: Set<NodeJS.Timeout> = new Set();

    function queue(delay: boolean, fn: NoParamFn): void {
      if (delay) {
        schedule(fn);
      } else {
        if (timeouts.size) pending.push(fn);
        else fn();
      }
    }

    function schedule(fn: NoParamFn): void {
      const timeout = setTimeout(() => {
        timeouts.delete(timeout);
        fn();
        if (!timeouts.size) {
          while (pending.length) {
            const item = pending.shift() as NoParamFn;
            item();
          }
        }
      }, ms);
      timeouts.add(timeout);
    }

    let index = 0;
    let final = false;
    return {
      next: condition
        ? (value) => queue(condition(value, index++), tb.next.bind(tb, value))
        : (value) => queue(true, tb.next.bind(tb, value)),
      error(error) {
        final = true;
        queue(signals, tb.error.bind(tb, error));
      },
      complete() {
        final = true;
        queue(signals, tb.complete.bind(tb));
      },
      terminate() {
        if (final) return;

        for (const timeout of timeouts) {
          clearTimeout(timeout);
        }
      }
    };
  });
}