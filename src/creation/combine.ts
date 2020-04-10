import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

export type ObservablesRecord<T = any> = Record<any, Observable<T>>;

export type ObservablesRecordType<T extends ObservablesRecord> = {
  [P in keyof T]: T[P] extends Observable<infer U> ? U : never;
};

export function combine<T extends ObservablesRecord>(
  observables: T
): Observable<ObservablesRecordType<T>> {
  const entries = Object.entries(observables);
  const list: Array<Observable<any>> = [];

  for (const entry of entries) {
    const observable = entry[1];
    list.push(observable);
  }

  return combineLatest(list).pipe(
    map((values) => {
      const record: any = {};
      for (let i = 0; i < values.length; i++) {
        record[entries[i][0]] = values[i];
      }
      return record;
    })
  );
}
