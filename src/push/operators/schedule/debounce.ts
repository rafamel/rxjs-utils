import { Push } from '@definitions';
import { operate } from '../../utils/operate';
import { NullaryFn } from 'type-core';

export function debounce<T>(due: number): Push.Operation<T> {
  return operate<T>((obs) => {
    let timeout: void | NodeJS.Timeout;
    let push: void | NullaryFn;

    return [
      null,
      function next(value) {
        if (timeout) clearTimeout(timeout);

        push = () => {
          push = undefined;
          obs.next(value);
        };

        timeout = setTimeout(() => (push ? push() : null), due);
      },
      null,
      function complete() {
        if (timeout) clearTimeout(timeout);
        if (push) push();
        obs.complete();
      },
      function teardown() {
        if (timeout) clearTimeout(timeout);
      }
    ];
  });
}
