import { Router } from "express";
import { isLoggedOut } from "./middleware.js";
import { getProjectCount, getTopPostTags, getOldestPost, getNewestPost } from "../data/posts.js"
import { getUserCount, getTopUserTags } from "../data/users.js";
const router = Router();

router.route("/").get(isLoggedOut, async (req, res) => {
	const numProjects = await getProjectCount();
	const numUsers = await getUserCount();
	const topPostTags = await getTopPostTags(3);
	const topUserTags = await getTopUserTags(10);
	const chartData = {
		tags: topUserTags.map(tag => tag[0]),
		counts: topUserTags.map(tag => tag[1])
	};
	let oldestPost = "";
	let newestPost = "";
	try {
		oldestPost = (await getOldestPost()).createdAt;
		newestPost = (await getNewestPost()).createdAt;
	} catch (e) {
		oldestPost = "No posts yet";
		newestPost = "No posts yet";
	}
	
	const stats = {
		numProjects: numProjects,
		numUsers: numUsers,
		topPostTags: topPostTags,
		topUserTags: topUserTags,
		oldestPost: oldestPost,
		newestPost: newestPost
	};
	res.render("landing", { title: "GitMatches", stats: stats, chartData });
});

// TEMPORARY - TO allow browser login
router.route("/login").get(async (req, res) => {
	return await res.redirect("/auth/login");
});

router.route("/register").get(async (req, res) => {
	return await res.redirect("/auth/register");
});

export default router;
