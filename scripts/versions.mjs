// Turns docs/versions.md into JSON the /versions page imports, so the Worker never reads the filesystem.
import { readFileSync, writeFileSync } from "node:fs";

const rows = readFileSync("docs/versions.md", "utf8")
  .split(/\r?\n/)
  .filter((l) => /^\|\s*v\d+/.test(l))
  .map((l) => {
    const [v, change = "", why = ""] = l.replace(/^\||\|\s*$/g, "").split(" | ").map((c) => c.trim());
    return { v, change, why };
  });
writeFileSync("app/(app)/versions/versions.json", JSON.stringify(rows, null, 1) + "\n");
console.log(`versions.json: ${rows.length} releases`);
