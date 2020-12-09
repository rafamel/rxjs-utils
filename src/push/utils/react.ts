import { Push } from '@definitions';
import { from } from '../creators/from';
import { Multicast } from '../classes/Multicast';
import { NullaryFn, TypeGuard, UnaryFn } from 'type-core';

export interface ReactHooksDependency {
  useState<S>(initial: S): [S, UnaryFn<S>];
  useMemo<T>(factory: () => T, deps?: any[]): T;
  useEffect(effect: NullaryFn<void | NullaryFn>, deps?: any[]): void;
}

export type ObservableHookResult<T> =
  | { success: true; done: boolean; data: T }
  | { success: false; done: true; data: Error };

export function useObservable<T, U = ObservableHookResult<T> | null>(
  React: ReactHooksDependency,
  observable: Push.Convertible<T> | NullaryFn<Push.Convertible<T>>,
  projection?: UnaryFn<ObservableHookResult<T> | null, U>
): U {
  const state = React.useState(0);

  const store = React.useMemo(() => {
    const members = {
      subscription: null as null | Push.Subscription,
      result: null as ObservableHookResult<T> | null,
      response: null as U | null
    };

    let i = 0;
    let open = false;
    let updated = false;
    function update(value: ObservableHookResult<T> | null): void {
      updated = true;
      const previous = members.response;
      members.result = value;
      members.response = projection ? projection(value) : (value as any);
      if (open && members.response !== previous) state[1]((i = i + 1));
    }

    from(
      TypeGuard.isFunction(observable) ? observable() : observable
    ).subscribe({
      start(subscription) {
        members.subscription = subscription;
      },
      next(item) {
        update({ success: true, done: false, data: item });
      },
      error(reason) {
        update({ success: false, done: true, data: reason });
      },
      complete() {
        update(
          members.result && members.result.success
            ? { success: true, done: true, data: members.result.data }
            : {
                success: false,
                done: true,
                data: Error(`Observable completed before pushing any value`)
              }
        );
      }
    });

    open = true;
    if (!updated && projection) members.response = projection(null);
    return members;
  }, []);

  React.useEffect(
    () => () => {
      if (store.subscription) store.subscription.unsubscribe();
    },
    []
  );

  return store.response as U;
}

export function usePropsMulticast<P, R = P>(
  React: ReactHooksDependency,
  props: P,
  projection?: UnaryFn<P, R>
): Push.Multicast<R> {
  const store = React.useMemo(() => {
    let observer: any;

    const multicast = new Multicast(
      (obs) => {
        observer = obs;
      },
      { replay: true },
      { onCreate: (connect) => connect() }
    );

    observer.next(projection ? projection(props) : props);

    return { props, observer, multicast };
  }, []);

  if (props !== store.props) {
    store.props = props;
    const value = projection ? projection(props) : props;
    if (value !== store.multicast.value) store.observer.next(value);
  }

  return store.multicast;
}
