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
 * Зберігає пост у відповідний JSON-файл.
 */
export function savePost(post) {
  fs.writeFileSync(post.file, JSON.stringify(post.data, null, 2), "utf8");
}

/**
 * Перевіряє, чи готовий пост до публікації.
 */
export function isReady(post) {
  if (post.data.status !== "pending") {
    return false;
  }

  if (!post.data.publishAt) {
    return true;
  }

  const now = new Date();

  return now >= new Date(post.data.publishAt);
}
/**
 * Позначає пост як успішно опублікований.
 */
export function markPublished(post, messageId) {
  post.data.status = "published";
  post.data.publishedAt = new Date().toISOString();
  post.data.messageId = messageId;

  delete post.data.error;
}
/**
 * Позначає пост як помилковий.
 */
export function markError(post, error) {
  post.data.status = "error";
  post.data.error = error.message ?? String(error);

  delete post.data.messageId;
  delete post.data.publishedAt;
}
