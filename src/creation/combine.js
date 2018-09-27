import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

export default function combine(obj) {
  const keys = Object.keys(obj);

  return combineLatest(...keys.map((key) => obj[key])).pipe(
    map((arr) => {
      return keys.reduce((acc, key, i) => {
        acc[key] = arr[i];
        return acc;
      }, {});
    })
  );
}
