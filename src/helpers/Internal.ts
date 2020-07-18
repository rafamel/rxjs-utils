export class Internal<S extends symbol, T extends object> {
  public constructor(symbol: S, value: T) {
    this.set(symbol, value);
  }
  public get(symbol: S): T;
  public get<K extends keyof T>(symbol: S, key: K): T[K];
  public get(symbol: S, ...args: any[]): any {
    return args.length < 1
      ? (this as any)[symbol]
      : (this as any)[symbol][args[0]];
  }
  public set(symbol: S, value: T): void;
  public set<K extends keyof T>(symbol: S, key: K, value: T[K]): void;
  public set(symbol: S, ...args: any[]): void {
    if (args.length < 2) {
      (this as any)[symbol] = args[0];
    } else {
      (this as any)[symbol][args[0]] = args[1];
    }
  }
}
