import { Empty, NoParamFn, Push, UnaryFn } from '@definitions';
import { Handler, TypeGuard } from '@helpers';
import { Observable } from '../observable';
import { terminateToAsyncFunction } from './helpers';
import { Broker } from './assistance/Broker';
import 'symbol-observable';

const $producer = Symbol('producer');
const $observable = Symbol('observable');

export class PushStream<T = any> implements Push.Stream<T> {
  private [$producer]: Push.Producer<T>;
  private [$observable]: void | Observable<T>;
  public constructor(producer: Push.Producer<T>) {
    if (!TypeGuard.isFunction(producer)) {
      throw new TypeError('Expected producer to be a function');
    }

    this[$producer] = producer;
  }
  public [Symbol.observable](): Observable<T> {
    let observable = this[$observable];
    if (observable) return observable;

    const producer = this[$producer];
    observable = new Observable((obs) => {
      const terminate = producer(obs);
      const fn = terminateToAsyncFunction(terminate);
      return () => {
        fn().catch(Handler.noop);
      };
    });
    return (this[$observable] = observable);
  }
  public subscribe(hearback?: Empty | Push.Hearback<T>): Push.Broker;
  public subscribe(
    onNext: UnaryFn<T>,
    onError?: UnaryFn<Error>,
    onComplete?: NoParamFn,
    onTerminate?: NoParamFn
  ): Push.Broker;
  public subscribe(hearback: any, ...arr: any[]): Push.Broker {
    let producer = this[$producer];

    if (TypeGuard.isFunction(hearback)) {
      hearback = {
        next: hearback,
        error: arr[0],
        complete: arr[1],
        terminate: arr[2]
      };
    } else if (!TypeGuard.isObject(hearback)) {
      if (!TypeGuard.isEmpty(hearback)) {
        producer = () => {
          throw new TypeError(
            `Expected hearback to be an object or a function`
          );
        };
      }
      hearback = {};
    }

    return new Broker(hearback, producer);
  }
}
