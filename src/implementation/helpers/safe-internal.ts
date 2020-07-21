export class SafeInternal<
  T extends object,
  R extends object = object,
  M extends WeakMap<R, T> = WeakMap<R, T>
> {
  private reference: R;
  public constructor(reference: R, map: M, value: T) {
    this.reference = reference;

    if (map.has(reference)) {
      throw Error(`Reference already exists in map: ${reference}`);
    }

    map.set(reference, value);
  }
  public get(map: M): T;
  public get<K extends keyof T>(map: M, key: K): T[K];
  public get(map: M, ...args: any[]): any {
    const value: any = map.get(this.reference);
    return args.length < 1 ? value : value[args[0]];
  }
  public set(map: M, value: T): void;
  public set<K extends keyof T>(map: M, key: K, value: T[K]): void;
  public set(map: M, ...args: any[]): void {
    if (args.length < 2) {
      map.set(this.reference, args[0]);
    } else {
      const value: any = this.get(map);
      value[args[0]] = args[1];
    }
  }
}
