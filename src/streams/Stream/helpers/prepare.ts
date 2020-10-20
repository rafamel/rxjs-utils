import { Core, NoParamFn } from '../../../definitions';
import { invoke, Action, trypipe } from '../../../helpers';

export function prepare(
  hearback: Core.Hearback<any, any>,
  before?: NoParamFn,
  after?: NoParamFn
): (action: Action, payload: any) => any {
  let open = false;
  let closed = false;
  let terminated = false;

  return function transact(action, payload) {
    if (!open) {
      open = true;
      if (before) before();
    }

    if (action === Action.Terminate) {
      if (terminated) return;
    } else if (closed || terminated) {
      if (action === Action.Error) throw payload;
      else return;
    }

    if (action === Action.Complete) {
      closed = true;
    } else if (action === Action.Terminate) {
      terminated = true;
    }

    return trypipe(
      () => invoke(hearback, action, payload),
      (err) => {
        if (action === Action.Complete || err !== undefined) {
          transact(Action.Terminate, undefined);
        }
      },
      () => {
        if (after && action === Action.Terminate) {
          after();
        }
      }
    );
  };
}
