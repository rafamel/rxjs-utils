/* eslint-disable promise/param-names */
import { Push } from '@definitions';
import { Handler } from '@helpers';
import { Subscription } from '../Observable';

class Broker<T = any> extends Subscription<T> implements Push.Broker {
  public constructor(hearback: Push.Hearback<T>, producer: Push.Producer<T>) {
    let ready = false;

    let error: null | [Error] = null;
    super(
      hearback,
      (obs) => (error ? undefined : producer(obs)),
      (err: Error) => {
        if (ready) {
          Handler.tries(this.unsubscribe.bind(this));
          throw err;
        } else {
          if (!error) error = [err];
        }
      }
    );

    if (error) {
      this.unsubscribe();
      throw error[0];
    }

    ready = true;
  }
}

Broker.prototype.constructor = Object;

export { Broker };
