#!/usr/bin/env node
import { writeFileSync } from "node:fs";
process.stdout.write(`${JSON.stringify({ state: "intake", workflowId: "workflow-demo" }, null, 2)}\n`);
