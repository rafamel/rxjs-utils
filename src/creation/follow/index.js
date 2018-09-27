import { of as observableOf, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import parseProperties from './parse-properties';

export default function examine(obj, properties) {
  properties = parseProperties(properties);
  if (!Object.keys(properties).length) return observableOf(obj);

  return createCombinedObservable(observableOf(obj), properties);
}

function createCombinedObservable(obs, properties) {
  const keys = Object.keys(properties);

  return obs.pipe(
    switchMap((res) => {
      return combineLatest(
        ...keys.map((key) => {
          const nextProperties = properties[key];
          return Object.keys(nextProperties).length
            ? createCombinedObservable(res[key], nextProperties)
            : res[key];
        })
      ).pipe(
        map((all) => {
          return all.reduce(
            (acc, val, i) => {
              acc[keys[i]] = val;
              return acc;
            },
            { _: res }
          );
        })
      );
    })
  );
}
