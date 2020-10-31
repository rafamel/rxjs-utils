import { Core } from '../../definitions';
import { Talkback } from './Talkback';
import {
  toConstituent,
  validateCounterpart,
  validateHearback
} from './helpers';

const $source = Symbol('source');
const $provider = Symbol('provider');

export class Stream<O, R = void, I = void, S = void>
  implements Core.Stream<O, R, I, S> {
  private [$provider]: Core.Provider<O, R, I, S>;
  private [$source]: Core.Source<O, R, I, S> | void;
  public constructor(provider: Core.Provider<O, R, I, S>) {
    validateCounterpart(provider);
    this[$provider] = provider;
  }
  public get source(): Core.Source<O, R, I, S> {
    const source = this[$source];
    if (source) return source;

    return (this[$source] = toConstituent(this[$provider]));
  }
  public consume(consumer: Core.Consumer<O, R, I, S>): void {
    const provider = this[$provider];
    validateCounterpart(consumer);

    let otb: any;
    let itb: any;
    let ihb: any;
    let hasIhb = false;
    let isConsumerNoop = true;
    let isProviderNoop = true;

    function getIhb(): null {
      if (hasIhb) return null;
      hasIhb = true;

      try {
        provider((_ihb) => {
          validateHearback(_ihb);
          isProviderNoop = false;

          ihb = _ihb;
          return otb;
        });
      } catch (err) {
        try {
          otb.terminate();
        } catch (_) {}
        throw err;
      }

      return null;
    }

    consumer((ohb) => {
      validateHearback(ohb);
      isConsumerNoop = false;

      otb = new Talkback(() => ohb || {}, {
        afterTerminate: () => itb.terminate()
      });

      itb = new Talkback(() => getIhb() || ihb, {
        afterTerminate: () => otb.terminate()
      });

      return itb;
    });

    if (isConsumerNoop) return;
    getIhb();
    if (isProviderNoop) otb.terminate();
  }
}
