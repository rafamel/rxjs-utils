import { NoParamFn, UnaryFn } from '@definitions';
import { Broker } from '../assistance';

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
