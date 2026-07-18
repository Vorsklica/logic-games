import { loadPosts } from "./lib/post.js";

const posts = loadPosts();

console.log(JSON.stringify(posts, null, 2));
