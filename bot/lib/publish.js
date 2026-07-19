import { loadPosts, savePost, isReady } from "./post.js";

import { publishPost } from "./telegram.js";
export async function publish() {
  const posts = loadPosts();

  for (const post of posts) {
    if (!isReady(post)) {
      continue;
    }

    try {
      const messageId = await publishPost(post);

      post.data.status = "published";
      post.data.messageId = messageId;
      post.data.publishedAt = new Date().toISOString();
    } catch (error) {
      post.data.status = "error";
      post.data.error = error.message;
    }

    savePost(post);
  }
}
