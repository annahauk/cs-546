import { Router } from "express";
const router = Router();
import {
	getAllPosts,
	getPostById,
	createPost,
	grabfilteredPosts
} from "../data/posts.js";
import { getUserByUsername, getUserById, getUserTags } from "../data/users.js";
import { createComment } from "../data/comments.js";
import { isLoggedIn } from "./middleware.js";
import { stringVal, idVal, TERMS_AND_DOMAINS } from "../helpers.js";
import { ObjectId } from "mongodb";
import { all } from "axios";

router
	.route("/")
	.get(isLoggedIn, async (req, res) => {
		try {
			if (req.authorized) {
				const user = await getUserByUsername(req.cookies["username"]);
				const userId = user._id.toString();
				let allPosts = await getAllPosts();
				let userTags = await getUserTags(userId);
				allPosts.sort((aPost, bPost) => {
					const aMatchCount = aPost.topic_tags.filter((tag) => userTags.includes(tag)).length;
					const bMatchCount = bPost.topic_tags.filter((tag) => userTags.includes(tag)).length;
					return bMatchCount - aMatchCount;
				});
				console.log("All posts (sorted):");
				console.log(allPosts);
				res.render("projects", {
					posts: allPosts,
					hasPosts: Array.isArray(allPosts) && allPosts.length > 0,
					termsAndDomains: TERMS_AND_DOMAINS,
					title: "Projects"
				});
			} else {
				return res.redirect("/login");
			}
		} catch (error) {
			console.error(error);
			res
				.status(500)
				.render("error", { message: "Internal server error", title: "Error" });
		}
	})
	.post(isLoggedIn, async (req, res) => {
		try {
			if (req.authorized) {
				const user = await getUserByUsername(req.cookies["username"]);
				const userId = user._id.toString();
				// Extract filters from the request body
				const { search, tags, languages, status, reset } = req.body;
				// Get the filtered posts or full posts depending on what's needed
				let filteredPosts = null;
				let tagsAndLanguages = [
					...(Array.isArray(tags) ? tags : [tags]).filter(Boolean),
					...(Array.isArray(languages) ? languages : [languages]).filter(Boolean)
				];
				if (!reset) {
					filteredPosts = await grabfilteredPosts(tagsAndLanguages, search);
				} else {
					filteredPosts = await getAllPosts();
				}
				let userTags = await getUserTags(userId);
				filteredPosts.sort((aPost, bPost) => {
					const aMatchCount = aPost.topic_tags.filter((tag) => userTags.includes(tag)).length;
					const bMatchCount = bPost.topic_tags.filter((tag) => userTags.includes(tag)).length;
					return bMatchCount - aMatchCount;
				});
				// Render the Handlebars partial with the filtered posts
				res.render("partials/projectList", {
					// Disable the main layout for partial rendering
					layout: false,
					posts: filteredPosts,
					hasPosts: Array.isArray(filteredPosts) && filteredPosts.length > 0,
					title: "Projects"
				});
			} else {
				return res.redirect("/login");
			}
		} catch (e) {
			console.error(e);
			res
				.status(500)
				.render("error", { message: "Internal server error", title: "Error" });
		}
	});

router
	.route("/projectcreate")
	.get(isLoggedIn, async (req, res) => {
		try {
			res.render("projectcreate", { title: "New Project" });
		} catch (error) {
			console.error(error);
			res
				.status(500)
				.render("error", { message: "Internal server error", title: "Error" });
		}
	})
	.post(isLoggedIn, async (req, res) => {
		let ownerId = "";
		if (req.authorized) {
			ownerUsername = req.cookies["username"];
			let owner = await getUserByUsername(ownerUsername);
			ownerId = owner._id.toString();
		} else {
			return res.redirect("/login");
		}
		try {
			// Accept JSON data from AJAX
			const { title, description, repoLink, topic_tags } = req.body;
			const errors = [];

			// Validate inputs (server-side, always!)
			if (!title || typeof title !== "string" || title.trim() === "") {
				errors.push("Title is required.");
			}
			if (
				!description ||
				typeof description !== "string" ||
				description.trim() === ""
			) {
				errors.push("Description is required.");
			}
			if (
				!repoLink ||
				typeof repoLink !== "string" ||
				!/^https?:\/\/.+/.test(repoLink.trim())
			) {
				errors.push("A valid repository link is required.");
			}
			if (!Array.isArray(topic_tags) || topic_tags.length === 0) {
				errors.push("Please select at least one tag.");
			}

			if (errors.length > 0) {
				return res.status(400).json({ message: errors.join(" ") });
			}

			// Create the project post
			const postId = await createPost(
				title.trim(),
				ownerId,
				description.trim(),
				repoLink.trim(),
				[], // comments
				topic_tags.map((tag) => tag.trim())
			);
			return res.status(200).json({ message: "Project created", postId });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	});

router
	.route("/:id")
	.get(isLoggedIn, async (req, res) => {
		// Display a specific project
		try {
			const projectId = idVal(req.params.id);
			let post = null;
			try {
				post = await getPostById(projectId);
			} catch (e) {
				return res
					.status(404)
					.render("error", { message: "Project not found", title: "Error" });
			}
			// Get the project creator
			let creatorUser = await getUserById(post.ownerId);
			let username = creatorUser.user_name;
			res.render("project", {
				project: post,
				creatorUsername: username,
				title: post.title
			});
		} catch (error) {
			console.error(error);
			res
				.status(500)
				.render("error", { message: "Internal server error", title: "Error" });
		}
	})
	.post(isLoggedIn, async (req, res) => {
		// Add a comment or join a project
		const projectId = req.params.id;
		const action = req.body.action;
		const content = req.body.content;
		try {
			projectId = idVal(projectId);
			action = stringVal(action);
			content = stringVal(content);
		} catch (error) {
			console.error(error);
			return res.status(400).json({ message: error });
		}

		try {
			try {
				const post = await getPostById(projectId);
			} catch (e) {
				return res
					.status(404)
					.render("error", { message: "Project not found", title: "Error" });
			}
			const user = await getUserByUsername(stringVal(req.cookies["username"]));
			if (!user) {
				return res
					.status(404)
					.render("error", { message: "User not found", title: "Error" });
			}
			if (action === "comment") {
				await createComment(content, projectId, user._id.toString());
				return res.status(200).json({ message: "Comment added successfully" });
			} else if (action === "join") {
				// TODO
				// Implement join functionality
			} else {
				return res
					.status(400)
					.render("error", { message: "Invalid action", title: "Error" });
			}
		} catch (error) {
			console.error(error);
			res
				.status(500)
				.render("error", { message: "Internal server error", title: "Error" });
		}
	});

export default router;
