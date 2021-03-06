import { Push } from '@definitions';
import { from } from '../creators/from';
import { Talkback } from '../classes/assistance/Talkback';

export interface InterceptOptions {
  /** See TalkbackOptions.multicast */
  multicast: boolean;
}

export function intercept<T, U>(
  convertible: Push.Convertible<T>,
  to: Push.SubscriptionObserver<U>,
  between: Push.Observer<T>,
  options?: InterceptOptions
): Push.Subscription {
  return from(convertible).subscribe(
    new Talkback<any>([between, to], {
      multicast: options && options.multicast,
      onError: to.error.bind(to)
    })
  );
}
