import { StreamProvider, StreamConsumer, StreamResult } from '../definitions';

export interface Controller {
  getDone(): boolean;
  setDone(): void;
}

export function consume<T, Primer extends T | void>(
  a: () => StreamProvider<T, Primer>,
  b: () => StreamConsumer<T, Primer>,
  controller: Controller
): () => void {
  return consumeInitialization(a, b, controller);
}

function consumeInitialization<T, Primer extends T | void>(
  a: () => StreamProvider<T, Primer>,
  b: () => StreamConsumer<T, Primer>,
  controller: Controller
): () => void {
  const provider = a();

  let primer: Primer;
  let consumer: StreamConsumer<T, Primer>;
  try {
    primer = provider.open ? provider.open() : (undefined as any);
    consumer = b();
  } catch (err) {
    try {
      if (provider.close) provider.close();
    } catch (_) {}
    throw err;
  }

  try {
    consumer.open ? consumer.open(primer) : (undefined as any);
  } catch (err) {
    try {
      if (consumer.close) consumer.close();
    } catch (_) {}
    try {
      if (provider.close) provider.close();
    } catch (_) {}
    throw err;
  }

  consumeProcess(provider, consumer, controller).catch((err) =>
    consumeFinalize(provider, consumer, controller, null, err)
  );

  // Cancellation
  return (): void => {
    if (controller.getDone()) return;
    const error = consumeClose(provider, consumer, controller, null);
    if (error) throw error;
  };
}

async function consumeProcess<T, Primer extends T | void>(
  provider: StreamProvider<T, Primer>,
  consumer: StreamConsumer<T, Primer>,
  controller: Controller
): Promise<void> {
  if (controller.getDone()) return;
  if (!provider.data) {
    return consumeFinalize(provider, consumer, controller, null, null);
  }

  let result: StreamResult<T>;
  try {
    result = await provider.data();
  } catch (err) {
    return consumeFinalize(provider, consumer, controller, err, null);
  }

  if (controller.getDone()) return;
  if (result.done || !consumer.data) {
    return consumeFinalize(provider, consumer, controller, null, null);
  }

  const isDone = await consumer.data(result.value as T);
  if (isDone) {
    return consumeFinalize(provider, consumer, controller, null, null);
  }

  return consumeProcess(provider, consumer, controller);
}

function consumeFinalize<T, Primer extends T | void>(
  provider: StreamProvider<T, Primer>,
  consumer: StreamConsumer<T, Primer>,
  controller: Controller,
  capture: Error | null,
  raise: Error | null
): void {
  if (controller.getDone()) return;
  const err = consumeClose(provider, consumer, controller, capture);

  if (raise || err) {
    setTimeout(() => {
      throw raise || err;
    }, 0);
  }
}

function consumeClose<T, Primer extends T | void>(
  provider: StreamProvider<T, Primer>,
  consumer: StreamConsumer<T, Primer>,
  controller: Controller,
  capture: Error | null
): Error | null {
  let error: Error | null = null;

  if (consumer.close) {
    try {
      consumer.close(capture || undefined);
    } catch (err) {
      error = err;
    }
  } else {
    error = capture;
  }

  try {
    if (provider.close) provider.close();
  } catch (err) {
    if (!error) error = err;
  }

  controller.setDone();
  return error;
}
