import { loadPosts, isReady } from "./lib/post.js";

const posts = loadPosts();

for (const post of posts) {
  console.log(post.data.text);
  console.log(isReady(post.data));
}
