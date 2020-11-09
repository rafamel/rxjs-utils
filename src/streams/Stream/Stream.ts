import { Core } from '../../definitions';
import { Handler } from '../../helpers';
import { Talkback } from './Talkback';
import { validateCounterpart, validateHearback } from './validate';

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

    const counterpart = this[$provider];
    validateCounterpart(counterpart);
    return (this[$source] = function source(exchange) {
      return counterpart((hb) => {
        validateHearback(hb);

        const tb = exchange(
          new Talkback<I>(() => hb || {}, {
            afterTerminate: () => tb.terminate()
          })
        );
        return tb;
      });
    });
  }
  public consume(consumer: Core.Consumer<O, I>): void {
    const provider = this[$provider];
    validateCounterpart(consumer);
    let otb: any;
    let itb: any;
    let ihb: any;
    let ohb: any;
    let hasIhb = false;
    let isConsumerNoop = true;
    let isProviderNoop = true;

    function getIhb(): null {
      if (hasIhb) return null;
      hasIhb = true;

      try {
        provider((_ihb) => {
          ihb = _ihb;

          validateHearback(ihb);
          isProviderNoop = false;

          return otb;
        });
      } catch (err) {
        Handler.catches(otb.terminate.bind(otb));
        throw err;
      }

      return null;
    }

    try {
      consumer((_ohb) => {
        ohb = _ohb;

        validateHearback(ohb);
        isConsumerNoop = false;

        otb = new Talkback(() => ohb || {}, {
          afterTerminate: () => itb.terminate(),
          onFail(err) {
            if (itb.closed || otb.closed) {
              Handler.catches(otb.terminate.bind(otb));
              throw err;
            }
            return itb.error(err);
          }
        });

        itb = new Talkback(() => getIhb() || ihb, {
          afterTerminate: () => otb.terminate(),
          onFail(err) {
            if (otb.closed || itb.closed) {
              Handler.catches(itb.terminate.bind(itb));
              throw err;
            }
            return otb.error(err);
          }
        });

        return itb;
      });
    } catch (err) {
      Handler.catches(() => otb.terminate());
      throw err;
    }

    if (isConsumerNoop) return;
    getIhb();
    if (isProviderNoop) otb.terminate();
  }
}
