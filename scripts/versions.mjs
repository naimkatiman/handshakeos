// Turns docs/versions.md into JSON the /versions page imports, so the Worker never reads the filesystem.
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const rows = readFileSync("docs/versions.md", "utf8")
  .split(/\r?\n/)
  .filter((l) => /^\|\s*v\d+/.test(l))
  .map((l) => {
    const [v, change = "", why = ""] = l.replace(/^\||\|\s*$/g, "").split(" | ").map((c) => c.trim());
    return { v, change, why };
  });
const out = "app/(app)/versions/versions.json";
const json = JSON.stringify(rows, null, 1) + "\n";
// Skip identical content (ignoring line endings) so a build never dirties a clean checkout.
if (!existsSync(out) || readFileSync(out, "utf8").replace(/\r\n/g, "\n") !== json) writeFileSync(out, json);
console.log(`versions.json: ${rows.length} releases`);
