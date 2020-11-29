import { Push } from '@definitions';
import { Handler } from '@helpers';
import { Hooks } from '../classes/assistance/Hooks';
import { Empty } from 'type-core';

const defaults = {
  onUnhandledError(error: Error): void {
    setTimeout(() => Handler.throws(error), 0);
  }
};

let pojo: Push.Hooks = { ...defaults };
let instance: Hooks = new Hooks(pojo);

export class HooksManager {
  public static set(hooks?: Push.Hooks | Empty): void {
    pojo = hooks ? { ...pojo, ...hooks } : { ...defaults };
    instance = new Hooks(pojo);
  }
  public static get(): Hooks {
    return instance;
  }
}
