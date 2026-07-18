//import { sendMessage } from "./lib/telegram.js";

//const messageId = await sendMessage("✅ Logic Games Bot успішно підключився.");

//console.log(messageId);

import { loadPosts } from "./lib/post.js";
import { publishPost } from "./lib/telegram.js";

const posts = loadPosts();

//await publishPost(posts[0]);
//=============================
const messageId = await publishPost(posts[0]);

console.log(messageId);
