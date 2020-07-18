import { ObserverSpec, SubscriberSpec } from './spec';

export type Observer<T = any> = ObserverSpec<T>;
export type Subscriber<T = any> = SubscriberSpec<T>;
