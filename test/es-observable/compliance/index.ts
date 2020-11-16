import { Push } from '@definitions';
import { engine, Logging, Response } from './engine';
import { tests } from './tests';

export function compliance(
  name: string,
  Constructor: Push.ObservableConstructor,
  logging: Logging,
  spec: boolean
): Promise<Response> {
  return engine(name, tests(Constructor, spec), logging);
}
