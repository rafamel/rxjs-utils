interface TestRunner {
  logger: Logger;
  injections: Record<string, any>;
}

interface Logger {
  passed: number;
  failed: number;
  failedList: any[];
  path: any[];
  margin: boolean;
}

export declare const runTests: (constructor: any) => Promise<TestRunner>;
