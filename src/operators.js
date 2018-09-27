import { switchMap } from 'rxjs/operators';
import combine from './creation/combine';
import follow from './creation/follow';

export function switchCombine(cb) {
  // eslint-disable-next-line standard/no-callback-literal
  return switchMap((...args) => combine(cb(...args)));
}

export function switchFollow(properties) {
  return switchMap((res) => follow(res, properties));
}
