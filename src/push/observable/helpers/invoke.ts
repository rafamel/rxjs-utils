import { Push, UnaryFn } from '@definitions';
import { TypeGuard } from '@helpers';
import { ManageObserver } from './manage-observer';
import { Subscription } from '../Subscription';

const $empty = Symbol('empty');

export function invoke(
  action: keyof Push.Observer,
  payload: any,
  subscription: Subscription,
  report: UnaryFn<Error>
): void {
  if (ManageObserver.isClosed(subscription)) return;

  const observer = ManageObserver.get(subscription);
  if (action === 'error' || action === 'complete') {
    ManageObserver.close(subscription);
  }

  let method: any = $empty;
  try {
    method = observer[action];
    if (action === 'complete') method.call(observer);
    else method.call(observer, payload);
  } catch (err) {
    if (!TypeGuard.isEmpty(method)) report(err);
    else if (action === 'error') report(payload);
  } finally {
    if (action === 'error' || action === 'complete') {
      try {
        subscription.unsubscribe();
      } catch (err) {
        report(err);
      }
    }
  }
}
