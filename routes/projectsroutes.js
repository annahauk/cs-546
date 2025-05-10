import { Router } from "express";
const router = Router();
import { getAllPosts, getPostById, createPost } from "../data/posts.js";
import { getUserByUsername, getUserById } from "../data/users.js";
import { createComment } from "../data/comments.js";
import { isLoggedIn } from "./middleware.js";
import { stringVal, idVal } from "../helpers.js";
import { ObjectId } from "mongodb";

router.route("/").get(isLoggedIn, async (req, res) => {
	try {
		// Filter by tags, languages, or active/inactive
		// Can change based on however we store the tags
		// let tags = req.query;
		let allPosts = await getAllPosts();
		/* Removing for now since we need to figure out how to filter exactly
            if (tags) {
                // trim and lowercase may be redundant but we can simplify later
                tags = tags.split(',').map(tag => tag.trim().toLowerCase());
                allPosts = allPosts.filter(post => post.topic_tags.some(tag => tags.includes(tag.toLowerCase())));
            }
        */
		console.log("All posts:");
		console.log(allPosts);
		res.render("projects", {
			posts: allPosts,
			hasPosts: Array.isArray(allPosts) && allPosts.length > 0
		});
	} catch (error) {
		console.error(error);
		res.status(500).render("error", { message: "Internal server error" });
	}
});

router
	.route("/projectcreate")
	.get(isLoggedIn, async (req, res) => {
		try {
			res.render("projectcreate", {});
		} catch (error) {
			console.error(error);
			res.status(500).render("error", { message: "Internal server error" });
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
			const post = await getPostById(projectId);
			if (!post) {
				return res
					.status(404)
					.render("error", { message: "Project not found" });
			}
			// Get the project creator
			let creatorUser = await getUserById(post.ownerId);
			let username = creatorUser.user_name;
			res.render("project", { project: post, creatorUsername: username });
		} catch (error) {
			console.error(error);
			res.status(500).render("error", { message: "Internal server error" });
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
			const post = await getPostById(projectId);
			const user = await getUserByUsername(stringVal(req.body.username));
			if (!post) {
				return res
					.status(404)
					.render("error", { message: "Project not found" });
			}
			if (!user) {
				return res.status(404).render("error", { message: "User not found" });
			}
			if (action === "comment") {
				await createComment(content, projectId, user._id);
				return res.status(200).json({ message: "Comment added successfully" });
			} else if (action === "join") {
				// TODO
				// Implement join functionality
			} else {
				return res.status(400).render("error", { message: "Invalid action" });
			}
		} catch (error) {
			console.error(error);
			res.status(500).render("error", { message: "Internal server error" });
		}
	});

export default router;
