import { Push } from '@definitions';
import { Observable } from '../classes/Observable';
import { transform } from '../utils/transform';
import { teardown as _teardown } from '../utils/teardown';

export function finalize<T>(teardown?: Push.Teardown): Push.Operation<T> {
  return transform((observable) => {
    if (!teardown) return observable;

    return new Observable((obs) => {
      const subscription = observable.subscribe(obs);
      return () => {
        subscription.unsubscribe();
        _teardown(teardown)();
      };
    });
  });
}
