export type ObservableSymbol = '@@observable';

export interface ObservableConstructor {
  new <T>(subscriber: Subscriber<T>): Observable<T>;
  of<T>(...items: T[]): Observable<T>;
  from<T>(item: Observable<T> | Compatible<T> | Iterable<T>): Observable<T>;
  prototype: Observable;
}

export type Compatible<T = any> = {
  [P in ObservableSymbol]: () => Observable<T>;
};

export interface Observable<T = any> extends Compatible<T> {
  subscribe(observer: Observer<T>): Subscription;
  subscribe(
    onNext: (value: T) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Subscription;
}

export interface Subscription {
  closed: boolean;
  unsubscribe(): void;
}

export interface Observer<T = any> {
  start?: (subscription: Subscription) => void;
  next?: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
}

export interface SubscriptionObserver<T = any> {
  closed: boolean;
  next(value: T): void;
  error(error: Error): void;
  complete(): void;
}

export type Subscriber<T = any> = (
  observer: SubscriptionObserver<T>
) => (() => void) | Subscription;
