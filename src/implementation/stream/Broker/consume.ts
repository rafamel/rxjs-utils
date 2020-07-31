import { StreamProvider, StreamConsumer, StreamReason } from '@definitions';
import {
  externalPromise,
  ExternalPromise
} from '../../helpers/external-promise';
import { handleMaybePromise } from '../../helpers/maybe-promise';

export interface ConsumeResponse {
  done: boolean;
  promise: Promise<void>;
  cancel: () => void;
}

export function consume<T>(
  executor: () => StreamProvider<T>,
  consumer: StreamConsumer<T>
): ConsumeResponse {
  return consumeInitialization(executor, consumer);
}

function consumeInitialization<T>(
  executor: () => StreamProvider<T>,
  consumer: StreamConsumer<T>
): ConsumeResponse {
  const external = externalPromise<void>();

  let provider: StreamProvider<T>;
  try {
    provider = executor();
  } catch (err) {
    consumeCapture(consumer, external, 'terminate', err);
    return {
      done: true,
      promise: external.promise,
      cancel(): void {
        return undefined;
      }
    };
  }

  const result = {
    get done(): boolean {
      return external.done;
    },
    promise: external.promise,
    cancel(): void {
      if (external.done) return;
      consumeFinalize(provider, consumer, external, 'cancel');
    }
  };

  consumeProcess(provider, consumer, external);
  return result;
}

function consumeProcess<T>(
  provider: StreamProvider<T>,
  consumer: StreamConsumer<T>,
  external: ExternalPromise<void>
): void {
  if (external.done) return;

  handleMaybePromise(
    () => provider.data(),
    (result) => {
      if (!result || typeof result !== 'object') {
        return consumeProviderTerminate(
          provider,
          consumer,
          external,
          Error('Stream provider response is not an object')
        );
      }

      if (external.done) return;
      if (result.complete) {
        return consumeFinalize(provider, consumer, external, 'complete');
      }

      handleMaybePromise(
        () => consumer.data(result.value as T),
        (done) => {
          if (done) {
            return consumeFinalize(provider, consumer, external, 'cancel');
          }
          return consumeProcess(provider, consumer, external);
        },
        (err) => {
          return external.done
            ? undefined
            : consumeConsumerTerminate(provider, consumer, external, err);
        }
      );
    },
    (err) => {
      return external.done
        ? undefined
        : consumeProviderTerminate(provider, consumer, external, err);
    }
  );
}

function consumeProviderTerminate<T>(
  provider: StreamProvider<T>,
  consumer: StreamConsumer<T>,
  external: ExternalPromise<void>,
  error: Error
): void {
  try {
    provider.close();
  } catch (_) {}
  return consumeCapture(consumer, external, 'terminate', error);
}

function consumeConsumerTerminate<T>(
  provider: StreamProvider<T>,
  consumer: StreamConsumer<T>,
  external: ExternalPromise<void>,
  error: Error
): void {
  let err: undefined | Error;
  try {
    provider.close();
  } catch (e) {
    err = e;
  }
  try {
    consumer.close('terminate', err);
  } catch (_) {}

  return external.reject(error);
}

function consumeFinalize<T>(
  provider: StreamProvider<T>,
  consumer: StreamConsumer<T>,
  external: ExternalPromise<void>,
  reason: StreamReason
): void {
  try {
    provider.close();
  } catch (err) {
    return consumeCapture(consumer, external, reason, err);
  }

  try {
    consumer.close(reason);
  } catch (err) {
    return external.reject(err);
  }

  return external.resolve();
}

function consumeCapture<T>(
  consumer: StreamConsumer<T>,
  external: ExternalPromise<void>,
  reason: StreamReason,
  error: Error
): void {
  try {
    consumer.close(reason, error);
  } catch (err) {
    return external.reject(err);
  }
  return external.resolve();
}
