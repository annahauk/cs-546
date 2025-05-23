import { Router } from "express";
import { isLoggedOut } from "./middleware.js";
import { getProjectCount, getTopPostTags, getOldestActivePost, getNewestActivePost } from "../data/posts.js"
import { getUserCount, getTopUserTags } from "../data/users.js";
const router = Router();

router.route("/").get(isLoggedOut, async (req, res) => {
	const numProjectsActive = await getProjectCount("active");
	const numProjectsCompleted = await getProjectCount("completed");
	const numUsers = await getUserCount();
	const topPostTags = await getTopPostTags(10);
	const topUserTags = await getTopUserTags(10);
	const userChartData = {
		tags: topUserTags.map(tag => tag[0]),
		counts: topUserTags.map(tag => tag[1])
	};
	const postChartData = {
		tags: topPostTags.map(tag => tag[0]),
		counts: topPostTags.map(tag => tag[1])
	};
	let oldestPost = "";
	let newestPost = "";
	try {
		oldestPost = (await getOldestActivePost()).createdAt;
		newestPost = (await getNewestActivePost()).createdAt;
	} catch (e) {
		oldestPost = "No posts yet";
		newestPost = "No posts yet";
	}
	
	const stats = {
		numProjectsActive: numProjectsActive,
		numProjectsCompleted: numProjectsCompleted,
		numUsers: numUsers,
		oldestPost: oldestPost,
		newestPost: newestPost
	};
	res.render("landing", { title: "GitMatches", stats: stats, userChartData, postChartData });
});

// TEMPORARY - TO allow browser login
router.route("/login").get(async (req, res) => {
	return await res.redirect("/auth/login");
});

router.route("/register").get(async (req, res) => {
	return await res.redirect("/auth/register");
});

export default router;
