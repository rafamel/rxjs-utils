import { Empty, NoParamFn, Push, UnaryFn } from '@definitions';
import { Handler, TypeGuard } from '@helpers';
import { isObservableCompatible, isObservableLike } from '../../utils';
import { Observable } from '../Observable';
import { Broker } from './Broker';
import 'symbol-observable';
import { terminateToAsyncFunction } from './helpers';

const $producer = Symbol('producer');
const $observable = Symbol('observable');

export class PushStream<T = any> implements Push.Stream<T> {
  public static of<T>(...items: T[]): PushStream<T> {
    const Constructor = typeof this === 'function' ? this : PushStream;
    return Observable.of.call(Constructor, ...items) as any;
  }
  public static from<T>(
    item: Push.Observable<T> | Push.Compatible<T> | Push.Like<T> | Iterable<T>
  ): PushStream<T> {
    const Constructor = TypeGuard.isFunction(this) ? this : PushStream;
    const from = Observable.from.bind(Constructor);

    if (isObservableCompatible(item)) return from(item) as any;
    if (isObservableLike(item)) {
      const compatible: any = { [Symbol.observable]: () => item };
      return from(compatible) as any;
    }
    return from(item) as any;
  }
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
    onFinally?: NoParamFn
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
