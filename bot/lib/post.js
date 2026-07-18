import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTBOX_DIR = path.join(__dirname, "..", "outbox");

/**
 * Завантажує всі JSON-файли з папки outbox.
 * Повертає масив об'єктів:
 * [
 *   {
 *     file: ".../post.json",
 *     data: { ... }
 *   }
 * ]
 */
export function loadPosts() {
  const files = fs.readdirSync(OUTBOX_DIR);

  return files
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const filePath = path.join(OUTBOX_DIR, file);

      return {
        file: filePath,
        data: JSON.parse(fs.readFileSync(filePath, "utf8")),
      };
    });
}

/**
 * Зберігає JSON назад у файл.
 */
export function savePost(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}
