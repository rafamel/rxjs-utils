import { PushStream, isObservableCompatible, isObservableLike } from '@push';
import assert from 'assert';

test(`PushStream is Observable`, () => {
  const instance = new PushStream(() => undefined);
  assert(isObservableLike(instance));
  assert(isObservableCompatible(instance));
});
test(`PushStream.from creates from Like`, () => {
  const instance = new PushStream((obs) => obs.next('foo'));
  const obs = { subscribe: instance.subscribe.bind(instance) };

  let response: any;
  PushStream.from(obs).subscribe((value) => (response = value));

  assert(response === 'foo');
});
