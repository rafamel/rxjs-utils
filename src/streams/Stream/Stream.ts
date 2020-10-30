import { Core } from '../../definitions';
import { toConstituent } from './to-constituent';
import { Talkback } from './Talkback';

const $source = Symbol('source');

export class Stream<O, R = void, I = void, S = void>
  implements Core.Stream<O, R, I, S> {
  private [$source]: Core.Source<O, R, I, S>;
  public constructor(provider: Core.Provider<O, R, I, S>) {
    this[$source] = toConstituent(provider);
  }
  public get source(): Core.Source<O, R, I, S> {
    return this[$source];
  }
  public consume(consumer: Core.Consumer<O, R, I, S>): void {
    const source: Core.Source<O, R, I, S> = this.source;
    const sink: Core.Sink<O, R, I, S> = toConstituent(consumer);

    let otb: any;
    let itb: any;
    let isSinkNoop = true;
    let isSourceNoop = true;
    let provideCalled = false;

    function provide(): undefined {
      if (provideCalled) return;
      provideCalled = true;

      try {
        source((talkback) => {
          isSourceNoop = false;
          itb = talkback;
          return otb;
        });
      } catch (err) {
        try {
          otb.terminate();
        } catch (_) {}
        throw err;
      }
    }

    sink((talkback) => {
      isSinkNoop = false;
      otb = talkback;
      return new Talkback(
        {
          next: (value) => itb.next(value),
          error: (error) => itb.error(error),
          complete: (reason) => itb.complete(reason),
          terminate: () => itb.terminate()
        },
        { beforeOpen: provide }
      );
    });

    if (isSinkNoop) return;

    try {
      provide();
    } catch (err) {
      try {
        otb.terminate();
      } catch (_) {}
      throw err;
    }

    if (isSourceNoop) otb.terminate();
  }
}
