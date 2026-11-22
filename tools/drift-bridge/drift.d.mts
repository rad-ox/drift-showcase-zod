export interface DriftContext {
  when(caseId: string, key: string): unknown;
  findWhen(caseId: string, key: string, fallback?: unknown): unknown;
  whenTable(caseId: string): Record<string, unknown>;
  expect(caseId: string, key: string): unknown;
  findThen(caseId: string, key: string, fallback?: unknown): unknown;
  then(caseId: string): Record<string, unknown>;
  check(caseId: string, checks: Record<string, unknown>, when?: Record<string, unknown> | null): Promise<void>;
  forEachCase(fn: (caseId: string, when: Record<string, unknown>) => unknown): Promise<void>;
}

export interface RunDriftCaseOptions {
  contract: string;
  test?: string;
  t?: unknown;
  cases: string[];
  level?: string;
}

export function runDriftCase(
  options: RunDriftCaseOptions,
  fn: (ctx: DriftContext) => unknown | Promise<unknown>
): Promise<string>;

export function shouldRun(contractId: string, testId: string, cases?: string[]): boolean;
export function resetDriftCache(): void;
