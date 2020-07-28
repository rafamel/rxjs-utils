import { StreamProvider, StreamConsumer, StreamResult } from '../definitions';

export interface Controller {
  getDone(): boolean;
  setDone(): void;
}

export function consume<O, I, Primer>(
  controller: Controller,
  providerExecutor: () => StreamProvider<O, I, Primer>,
  consumerExecutor: () => StreamConsumer<O, I, Primer>
): () => void {
  return consumeInitialization(controller, providerExecutor, consumerExecutor);
}

function consumeInitialization<O, I, Primer>(
  controller: Controller,
  providerExecutor: () => StreamProvider<O, I, Primer>,
  consumerExecutor: () => StreamConsumer<O, I, Primer>
): () => void {
  const provider = providerExecutor();

  let primer: Primer;
  let consumer: StreamConsumer<O, I, Primer>;
  try {
    primer = provider.open ? provider.open() : (undefined as any);
    consumer = consumerExecutor();
  } catch (err) {
    try {
      if (provider.close) provider.close();
    } catch (_) {}
    throw err;
  }

  let initial: I;
  try {
    initial = consumer.open ? consumer.open(primer) : (undefined as any);
  } catch (err) {
    try {
      if (consumer.close) consumer.close();
    } catch (_) {}
    try {
      if (provider.close) provider.close();
    } catch (_) {}
    throw err;
  }

  consumeProcess(controller, provider, consumer, initial).then(
    () => consumeFinalize(controller, provider, consumer, null),
    (err) => consumeFinalize(controller, provider, consumer, err)
  );

  // Cancellation
  return (): void => {
    if (controller.getDone()) return;
    const error = consumeClose(controller, provider, consumer, null);
    if (error) throw error;
  };
}

async function consumeProcess<O, I, Primer>(
  controller: Controller,
  to: StreamProvider<O, I, Primer> | StreamConsumer<O, I, Primer>,
  from: StreamConsumer<O, I, Primer> | StreamProvider<O, I, Primer>,
  value: any
): Promise<void> {
  if (controller.getDone() || !to.data) return;

  let result: void | StreamResult<any>;
  try {
    result = await to.data(value);
  } catch (err) {
    if (!from.error) throw err;
    if (controller.getDone()) return;

    const errInput: void | StreamResult<any> = await from.error(err);
    if (!errInput) {
      return consumeProcess(controller, to, from, undefined);
    }
    return errInput.done
      ? undefined
      : consumeProcess(controller, to, from, errInput.value);
  }

  if (!result) return consumeProcess(controller, from, to, undefined);
  return result.done
    ? undefined
    : consumeProcess(controller, from, to, result.value);
}

function consumeFinalize<O, I, Primer>(
  controller: Controller,
  provider: StreamProvider<O, I, Primer>,
  consumer: StreamConsumer<O, I, Primer>,
  error: null | Error
): void {
  error = consumeClose(controller, provider, consumer, error);

  if (error) {
    setTimeout(() => {
      throw error;
    }, 0);
  }
}

function consumeClose<O, I, Primer>(
  controller: Controller,
  provider: StreamProvider<O, I, Primer>,
  consumer: StreamConsumer<O, I, Primer>,
  error: null | Error
): null | Error {
  if (controller.getDone()) return null;

  try {
    if (consumer.close) consumer.close();
  } catch (err) {
    if (!error) error = err;
  }

  try {
    if (provider.close) provider.close();
  } catch (err) {
    if (!error) error = err;
  }

  controller.setDone();
  return error;
}
