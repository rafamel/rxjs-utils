import { StreamProvider, StreamConsumer, StreamResponse } from '../definitions';
import {
  externalPromise,
  ExternalPromise
} from '../../helpers/external-promise';

export interface Result {
  done: boolean;
  promise: Promise<void>;
  cancel: () => void;
}

export function consume<T, Primer>(
  executor: () => StreamProvider<T, Primer>,
  consumer: StreamConsumer<T, Primer>
): Result {
  return consumeInitialization(executor, consumer);
}

function consumeInitialization<T, Primer>(
  executor: () => StreamProvider<T, Primer>,
  consumer: StreamConsumer<T, Primer>
): Result {
  const external = externalPromise<void>();

  let provider: StreamProvider<T, Primer>;
  try {
    provider = executor();
  } catch (err) {
    consumeCapture(consumer, external, err);
    return {
      done: true,
      promise: external.promise,
      cancel: (): void => undefined
    };
  }

  const result = {
    get done(): boolean {
      return external.done;
    },
    promise: external.promise,
    cancel(): void {
      if (!external.done) consumeFinalize(provider, consumer, external);
    }
  };

  let primer: Primer;
  try {
    primer = provider.prime();
  } catch (err) {
    consumeProviderTerminate(provider, consumer, external, err);
    return result;
  }

  let done: boolean | void;
  try {
    done = consumer.prime(primer);
  } catch (err) {
    consumeConsumerTerminate(provider, consumer, external, err);
    return result;
  }
  if (done) {
    consumeFinalize(provider, consumer, external);
    return result;
  }

  consumeProcess(provider, consumer, external).then(
    () => {
      if (external.done) return;
      consumeFinalize(provider, consumer, external);
    },
    (err) => {
      if (external.done) return;
      consumeConsumerTerminate(provider, consumer, external, err);
    }
  );
  return result;
}

async function consumeProcess<T, Primer>(
  provider: StreamProvider<T, Primer>,
  consumer: StreamConsumer<T, Primer>,
  external: ExternalPromise<void>
): Promise<void> {
  if (external.done) return;

  let response: StreamResponse<T>;
  try {
    response = await provider.data();
  } catch (err) {
    return external.done
      ? undefined
      : consumeProviderTerminate(provider, consumer, external, err);
  }

  if (external.done) return;
  if (typeof response !== 'object' || response === null) {
    return consumeProviderTerminate(
      provider,
      consumer,
      external,
      Error('Stream provider response is not an object')
    );
  }
  if (response.done) {
    return consumeFinalize(provider, consumer, external);
  }

  let done: void | boolean;
  try {
    done = await consumer.data(response.value as T);
  } catch (err) {
    return external.done
      ? undefined
      : consumeConsumerTerminate(provider, consumer, external, err);
  }

  if (done) {
    return consumeFinalize(provider, consumer, external);
  }

  return consumeProcess(provider, consumer, external);
}

function consumeProviderTerminate<T, Primer>(
  provider: StreamProvider<T, Primer>,
  consumer: StreamConsumer<T, Primer>,
  external: ExternalPromise<void>,
  error: Error
): void {
  try {
    provider.close();
  } catch (_) {}
  return consumeCapture(consumer, external, error);
}

function consumeConsumerTerminate<T, Primer>(
  provider: StreamProvider<T, Primer>,
  consumer: StreamConsumer<T, Primer>,
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
    consumer.close(err);
  } catch (_) {}

  return external.reject(error);
}

function consumeFinalize<T, Primer>(
  provider: StreamProvider<T, Primer>,
  consumer: StreamConsumer<T, Primer>,
  external: ExternalPromise<void>
): void {
  try {
    provider.close();
  } catch (err) {
    return consumeCapture(consumer, external, err);
  }

  try {
    consumer.close();
  } catch (err) {
    return external.reject(err);
  }

  return external.resolve();
}

function consumeCapture<T, Primer>(
  consumer: StreamConsumer<T, Primer>,
  external: ExternalPromise<void>,
  error: Error
): void {
  try {
    consumer.close(error);
  } catch (err) {
    return external.reject(err);
  }
  return external.resolve();
}
