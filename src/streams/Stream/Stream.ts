import { Core } from '../../definitions';
import { Handler } from '../../helpers';
import { Talkback } from './Talkback';
import {
  toConstituent,
  validateCounterpart,
  validateHearback
} from './helpers';

const $source = Symbol('source');
const $provider = Symbol('provider');

export class Stream<O, I = void> implements Core.Stream<O, I> {
  private [$provider]: Core.Provider<O, I>;
  private [$source]: Core.Source<O, I> | void;
  public constructor(provider: Core.Provider<O, I>) {
    validateCounterpart(provider);
    this[$provider] = provider;
  }
  public get source(): Core.Source<O, I> {
    const source = this[$source];
    if (source) return source;

    return (this[$source] = toConstituent(this[$provider]));
  }
  public consume(consumer: Core.Consumer<O, I>): void {
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
        afterTerminate: () => itb.terminate(),
        onFail(err) {
          if (!itb.closed) return itb.error(err);

          Handler.catches(otb.terminate.bind(otb));
          throw err;
        }
      });

      itb = new Talkback(() => getIhb() || ihb, {
        afterTerminate: () => otb.terminate(),
        onFail(err) {
          if (!otb.closed) return otb.error(err);

          Handler.catches(itb.terminate.bind(itb));
          throw err;
        }
      });

      return itb;
    });

    if (isConsumerNoop) return;
    getIhb();
    if (isProviderNoop) otb.terminate();
  }
}
