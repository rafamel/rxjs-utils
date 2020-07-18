export type SymbolObservable = '@@observable';

export interface ObservableConstructorSpec {
  new <T>(subscriber: SubscriberSpec<T>): ObservableSpec<T>;
  of<T>(...items: T[]): ObservableSpec<T>;
  from<T>(
    item: ObservableSpec<T> | CompatibleObservableSpec<T> | Iterable<T>
  ): ObservableSpec<T>;
  prototype: ObservableSpec;
}

export type CompatibleObservableSpec<T = any> = {
  [P in SymbolObservable]: () => ObservableSpec<T>;
};

export interface ObservableSpec<T = any> extends CompatibleObservableSpec<T> {
  subscribe(observer: ObserverSpec<T>): SubscriptionSpec;
  subscribe(
    onNext: (value: T) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): SubscriptionSpec;
}

export interface SubscriptionSpec {
  closed: boolean;
  unsubscribe(): void;
}

export interface ObserverSpec<T = any> {
  start?: (subscription: SubscriptionSpec) => void;
  next?: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
}

export interface SubscriptionObserverSpec<T = any> {
  closed: boolean;
  next(value: T): void;
  error(error: Error): void;
  complete(): void;
}

export type SubscriberSpec<T = any> = (
  observer: SubscriptionObserverSpec<T>
) => (() => void) | SubscriptionSpec;
