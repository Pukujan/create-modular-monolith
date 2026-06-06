import { test } from "node:test";
import assert from "node:assert/strict";
import { getHealth } from "../../services/health.service.js";

test("getHealth returns module metadata", () => {
  const result = getHealth({ name: "documents" });
  assert.equal(result.module, "documents");
  assert.equal(result.status, "ok");
});
