import { Broker, Observable, PushStream, tap } from '@push';
import { into } from 'pipettes';
import assert from 'assert';

test(`returns PushStream`, () => {
  const obs = into(new Observable(() => undefined), tap());
  assert(obs instanceof PushStream);
});
test(`Hearback.start`, () => {
  let pass = false;

  const obs = into(
    new PushStream<number>(() => undefined),
    tap({
      start(broker) {
        pass = broker instanceof Broker;
      }
    })
  );

  obs.subscribe();
  assert(pass);
});
test(`Hearback.next`, () => {
  const times = [0, 0, 0];
  const values: [any[], any[]] = [[], []];

  const obs = into(
    new PushStream<number>((obs) => {
      obs.next(1);
      obs.next(2);
      obs.next(3);
    }),
    tap({
      next(x: number) {
        times[0]++;
        values[0].push(x);
      },
      terminate: () => times[2]++
    })
  );

  const subscription = obs.subscribe((x) => {
    times[1]++;
    values[1].push(x);
  });

  assert.deepStrictEqual(times, [3, 3, 0]);
  assert.deepStrictEqual(values, [
    [1, 2, 3],
    [1, 2, 3]
  ]);

  subscription.unsubscribe();
  assert.deepStrictEqual(times, [3, 3, 1]);
});
test(`Hearback.error`, () => {
  const times = [0, 0, 0];
  const values: [Error[], Error[]] = [[], []];

  const error = Error('foo');
  const obs = into(
    new PushStream<number>((obs) => {
      obs.error(error);
    }),
    tap({
      error(err) {
        times[0]++;
        values[0].push(err);
      },
      terminate: () => times[2]++
    })
  );

  obs.subscribe({
    error: (x) => {
      times[1]++;
      values[1].push(x);
    }
  });

  assert.deepStrictEqual(times, [1, 1, 1]);
  assert.deepStrictEqual(values, [[error], [error]]);
});
test(`Hearback.complete`, () => {
  const times = [0, 0, 0];

  const obs = into(
    new PushStream<number>((obs) => {
      obs.complete();
    }),
    tap({
      complete: () => times[0]++,
      terminate: () => times[2]++
    })
  );

  obs.subscribe({ complete: () => times[1]++ });

  assert.deepStrictEqual(times, [1, 1, 1]);
});
