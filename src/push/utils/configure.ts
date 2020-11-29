import { Push } from '@definitions';
import { Empty } from 'type-core';
import { HooksManager } from '../helpers';

export function configure(hooks?: Push.Hooks | Empty): void {
  HooksManager.set(hooks);
}
