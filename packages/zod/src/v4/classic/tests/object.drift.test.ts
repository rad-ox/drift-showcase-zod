import { describe, test } from "vitest";
import * as z from "zod/v4";
import { runDriftCase } from "../../../../../../tools/drift-bridge/drift.mjs";

const UserProfileSchema = z.object({
  name: z.string(),
  age: z.number(),
  nickname: z.string().optional(),
});

function selectPointsSchema(mode: string) {
  const base = z.object({ points: z.number() });
  if (mode === "strict") return base.strict();
  if (mode === "passthrough") return base.passthrough();
  return base.strip();
}

function summarizeParse(result: z.ZodSafeParseResult<Record<string, unknown>>) {
  if (result.success) {
    return {
      success: true,
      issue_count: 0,
      issue_code: "none",
      issue_path: "",
      output_json: JSON.stringify(result.data),
      has_optional: Object.prototype.hasOwnProperty.call(result.data, "nickname") && result.data.nickname !== undefined,
    };
  }
  const first = result.error.issues[0];
  return {
    success: false,
    issue_count: result.error.issues.length,
    issue_code: first?.code ?? "none",
    issue_path: first ? first.path.join(".") : "",
    output_json: "",
    has_optional: false,
  };
}

describe("DRIFT object-required-fields contract", () => {
  const cases = [
    "valid-all-fields",
    "valid-optional-omitted",
    "missing-required-field",
    "wrong-field-type",
    "non-object-input",
  ] as const;

  for (const caseId of cases) {
    test(caseId, async () => {
      await runDriftCase(
        {
          contract: "object-required-fields",
          test: `object.drift.test.ts#${caseId}`,
          cases: [caseId],
          level: "unit",
        },
        async (d) => {
          const input = JSON.parse(String(d.when(caseId, "input_json")));
          const summary = summarizeParse(UserProfileSchema.safeParse(input));
          const expected =
            caseId === "valid-all-fields" || caseId === "valid-optional-omitted"
              ? {
                  success: summary.success,
                  issue_count: summary.issue_count,
                  issue_code: summary.issue_code,
                  issue_path: summary.issue_path,
                  has_optional: summary.has_optional,
                }
              : {
                  success: summary.success,
                  issue_count: summary.issue_count,
                  issue_code: summary.issue_code,
                  issue_path: summary.issue_path,
                };
          await d.check(caseId, expected);
        }
      );
    });
  }
});

describe("DRIFT object-unknown-keys contract", () => {
  const cases = ["strip-unknown", "strict-rejects-unknown", "passthrough-preserves-unknown"] as const;

  for (const caseId of cases) {
    test(caseId, async () => {
      await runDriftCase(
        {
          contract: "object-unknown-keys",
          test: `object.drift.test.ts#${caseId}`,
          cases: [caseId],
          level: "unit",
        },
        async (d) => {
          const mode = String(d.when(caseId, "mode"));
          const input = JSON.parse(String(d.when(caseId, "input_json")));
          const summary = summarizeParse(selectPointsSchema(mode).safeParse(input));
          const expected =
            caseId === "strict-rejects-unknown"
              ? {
                  success: summary.success,
                  issue_count: summary.issue_count,
                  issue_code: summary.issue_code,
                  issue_path: summary.issue_path,
                }
              : {
                  success: summary.success,
                  issue_count: summary.issue_count,
                  issue_code: summary.issue_code,
                  output_json: summary.output_json,
                };
          await d.check(caseId, expected);
        }
      );
    });
  }
});
