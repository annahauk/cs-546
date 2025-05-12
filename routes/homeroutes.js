import { Router } from "express";
import { isLoggedOut } from "./middleware.js";
import { getProjectCount, getTopPostTags, getOldestPost, getNewestPost } from "../data/posts.js"
import { getUserCount, getTopUserTags } from "../data/users.js";
const router = Router();

router.route("/").get(isLoggedOut, async (req, res) => {
	const numProjects = await getProjectCount();
	const numUsers = await getUserCount();
	const topPostTags = await getTopPostTags(3);
	const topUserTags = await getTopUserTags(3);
	const oldestPost = await getOldestPost();
	const newestPost = await getNewestPost();
	const stats = {
		numProjects: numProjects,
		numUsers: numUsers,
		topPostTags: topPostTags,
		topUserTags: topUserTags,
		oldestPost: oldestPost,
		newestPost: newestPost
	};
	res.render("landing", { title: "GitMatches", stats: stats });
});

// TEMPORARY - TO allow browser login
router.route("/login").get(async (req, res) => {
	return await res.redirect("/auth/login");
});

router.route("/register").get(async (req, res) => {
	return await res.redirect("/auth/register");
});

export default router;
