import { NoParamFn, Push, UnaryFn } from '@definitions';
import { Handler, TypeGuard } from '@helpers';
import { isSubscriptionLike } from '../utils/type-guards';
import { Broker } from './assistance/Broker';

const empty = Promise.resolve();
const noop = (): Promise<void> => empty;

export function terminateToAsyncFunction(
  terminate: Push.Teardown
): NoParamFn<Promise<void>> {
  function each(item: Exclude<Push.Teardown, any[]>): NoParamFn<Promise<void>> {
    if (TypeGuard.isEmpty(item)) return noop;
    if (TypeGuard.isFunction(item)) {
      return () => {
        try {
          return Promise.resolve(item());
        } catch (err) {
          return Promise.reject(err);
        }
      };
    }
    if (isSubscriptionLike(item)) {
      return () => {
        item.unsubscribe();
        return Promise.resolve(item).then(Handler.noop);
      };
    }
    throw new TypeError(
      'Expected subscriber terminate to be a function, a subscription, or an array of them'
    );
  }

  if (!Array.isArray(terminate)) return each(terminate);

  const fns = terminate.map(each);
  return () => Promise.all(fns.map((fn) => fn())).then(Handler.noop);
}

const $promise = Symbol('promise');
const $actions = Symbol('actions');
export class ManagePromise {
  public static getPromise(broker: Broker): Promise<void> {
    const instance = broker as any;
    const promise = instance[$promise];
    if (promise) return promise;

    return (instance[$promise] = new Promise<void>((resolve, reject) => {
      instance[$actions] = [resolve, reject];
    }));
  }
  public static getActions(broker: Broker): [NoParamFn, UnaryFn<Error>] {
    const instance = broker as any;
    const actions = instance[$actions];
    if (actions) return actions;

    this.getPromise(broker);
    return (broker as any)[$actions];
  }
}
