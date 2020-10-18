import { Observables } from '../../definitions';
import { Action, invoke, trypipe } from '../../helpers';

export function prepare(
  observer: Observables.Observer<any, any>,
  subscription: Observables.Subscription,
  done: [boolean]
): (action: Action, payload: any) => any {
  return function transact(action, payload) {
    if (done[0]) {
      if (action === Action.Error) throw payload;
      else return;
    }

    if (action !== Action.Next) done[0] = true;

    return trypipe(
      () => invoke(observer, action, payload),
      (err) => {
        if (action !== Action.Next || err !== undefined) {
          subscription.unsubscribe();
        }
      }
    );
  };
}
