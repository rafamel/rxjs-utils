import {
  PushStream,
  Observable,
  isObservableCompatible,
  isObservableLike
} from '@push';
import assert from 'assert';

test(`PushStream is ObservableLike`, () => {
  const instance = new PushStream(() => undefined);
  assert(isObservableLike(instance));
});
test(`PushStream is ObservableCompatible`, () => {
  const instance = new PushStream(() => undefined);
  assert(isObservableCompatible(instance));

  const observable = instance[Symbol.observable]();
  assert(observable instanceof Observable);
});
