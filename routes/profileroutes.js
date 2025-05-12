import { Router } from "express";
import fs from "fs/promises";
import multer from "multer";
import path from "path";
import {
	getUserById,
	getUserByUsername,
	updateUserTags
} from "../data/users.js";
import { idVal, stringVal, TERMS_AND_DOMAINS } from "../helpers.js";
import { isLoggedIn } from "./middleware.js";
import { processUploadedResume } from "../src/lib/resume-parse.js";
import { getPostsByUserId } from "../data/posts.js";
const router = Router();

// https://www.npmjs.com/package/multer
// Store uploaded resume file temporarily in ../uploads
const upload = multer({
	dest: path.join(process.cwd(), "../uploads"),
	limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
	fileFilter: (req, file, cb) => {
		if (file.mimetype === "application/pdf") {
			cb(null, true);
		} else {
			cb(new Error("Only PDF files are allowed."));
		}
	}
});

router.route("/").get(isLoggedIn, async (req, res) => {
	if (req.authorized) {
		let username = req.cookies["username"];
		let user = await getUserByUsername(username);
		return res.redirect("/profile/" + user._id);
	} else {
		return res.redirect("/login");
	}
});

router.route("/:id").get(isLoggedIn, async (req, res) => {
	// Display a user profile
	try {
		const userId = idVal(req.params.id);
		const user = await getUserById(userId);
		if (!user) {
			return res
				.status(404)
				.render("error", { message: "User not found", title: "Error" });
		}
		// Get the projects created by the user
		const userPosts = await getPostsByUserId(userId);
		res.render("profile", {
			user: user,
			title: user.user_name,
			userProjects: userPosts
		});
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.render("error", { message: "Internal server error", title: "Error" });
	}
});
router
	.route("/:id/edit")
	.get(isLoggedIn, async (req, res) => {
		// Display edit profile page
		try {
			const userId = idVal(req.params.id);
			const user = await getUserById(userId);
			if (!user) {
				return res
					.status(404)
					.render("error", { message: "User not found", title: "Error" });
			}
			if (user.user_name !== stringVal(req.cookies["username"])) {
				return res.status(403).render("error", {
					message: "You can only edit your own profile.",
					title: "Error"
				});
			}
			// Extract all unique tags (programming languages and domains)
			const allTags = [
				...new Set([
					...Object.keys(TERMS_AND_DOMAINS),
					...Object.values(TERMS_AND_DOMAINS).map((item) => item.domain)
				])
			];
			// Get the projects created by the user
			const userProjects = await getPostsByUserId(userId);
			res.render("editProfile", {
				user: user,
				title: "Edit Profile",
				allTags: allTags,
				userProjects: userProjects
			});
		} catch (error) {
			res
				.status(500)
				.render("error", { message: "Internal server error", title: "Error" });
		}
	})
	.post(isLoggedIn, async (req, res) => {
		// Perform an update
		try {
			const userId = idVal(req.params.id);
			const user = await getUserById(userId);
			if (!user) {
				return res
					.status(404)
					.render("error", { message: "User not found", title: "Error" });
			}
			if (user.user_name !== stringVal(req.body.username)) {
				return res.status(403).render("error", {
					message: "You can only edit your own profile.",
					title: "Error"
				});
			}

			// TODO
			// Implement profile updating features
			// After done, hitting "save" will redirect back to profile view

			res.render("profile", { user: user, title: user.user_name });
		} catch (error) {
			res
				.status(500)
				.render("error", { message: "Internal server error", title: "Error" });
		}
	});
router
	.route("/:id/resume")
	.post(isLoggedIn, upload.single("resume"), async (req, res) => {
		try {
			const userId = idVal(req.params.id);
			const user = await getUserById(userId);
			if (!user) {
				return res
					.status(404)
					.render("error", { message: "User not found", title: "Error" });
			}
			if (user.user_name !== stringVal(req.cookies["username"])) {
				return res.status(403).render("error", {
					message: "You can only edit your own profile.",
					title: "Error"
				});
			}
			if (!req.file) {
				return res
					.status(400)
					.render("error", { message: "No file uploaded", title: "Error" });
			}

			const tags = await processUploadedResume(req.file);
			// Remove commas from all strings in the tags object
			for (const key in tags) {
				if (Array.isArray(tags[key])) {
					tags[key] = tags[key].map((tag) => tag.replace(/,/g, ""));
				}
			}
			// https://www.geeksforgeeks.org/node-js-fs-unlink-method/
			await fs.unlink(req.file.path);
			const newTags = [
				...new Set([
					...tags.ProgrammingLanguages,
					...tags.Libraries,
					...tags.Frameworks,
					...tags.Tools,
					...tags.CloudPlatforms
				])
			];
			await updateUserTags(userId, newTags);
			res.render("profile", { user: user, title: user.user_name });
		} catch (error) {
			res
				.status(500)
				.render("error", { message: "Internal server error", title: "Error" });
		}
	});

export default router;
