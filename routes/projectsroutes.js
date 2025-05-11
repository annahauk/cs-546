import { Router } from "express";
const router = Router();
import {
	getAllPosts,
	getPostById,
	createPost,
	grabfilteredPosts,
	post_has_member,
	get_project_application,
	remove_project_applicaiton,
	add_project_member,
	create_project_application,
	remove_project_member
} from "../data/posts.js";
import { getUserByUsername, getUserById } from "../data/users.js";
import { createComment } from "../data/comments.js";
import { isLoggedIn } from "./middleware.js";
import { stringVal, idVal, TERMS_AND_DOMAINS } from "../helpers.js";
import { ObjectId } from "mongodb";

router
	.route("/")
	.get(isLoggedIn, async (req, res) => {
		try {
			let allPosts = await getAllPosts();
			console.log("All posts:");
			console.log(allPosts);
			res.render("projects", {
				posts: allPosts,
				hasPosts: Array.isArray(allPosts) && allPosts.length > 0,
				termsAndDomains: TERMS_AND_DOMAINS,
				title: "Projects"
			});
		} catch (error) {
			console.error(error);
			res
				.status(500)
				.render("error", { message: "Internal server error", title: "Error" });
		}
	})
	.post(isLoggedIn, async (req, res) => {
		try {
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
			// Render the Handlebars partial with the filtered posts
			res.render("partials/projectList", {
				// Disable the main layout for partial rendering
				layout: false,
				posts: filteredPosts,
				hasPosts: Array.isArray(filteredPosts) && filteredPosts.length > 0,
				title: "Projects"
			});
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

router.route(":id/join/")
	/**
	 * request to join a project
	 * sends notification to project owner with approve/deny links + additional text from user
	 * join request has individual id
	 */
	.post(async(req,res) => {
		if(!req.authorized) {
			// redirect to login
			return await res.redirect("/login");
		}

		let id;
		try {
			id = await idVal(req.params.id);
		} catch (e) {
			return await res.status(400).render("error", {"error": `Bad id format.`});
		}

		// make sure project exists
		let project;
		try {
			project = await getPostById(id);
		} catch (e) {
			return await res.status(404).render("error", {error: `No post with id ${id}`});
		}

		// make sure user is not in project. If so, redirec to project page
		let user = await getUserByUsername(req.cookies["username"]);
		if(!user) {
			return await res.status(500).render("error", {error: "User not found."});
		}
		if(await post_has_member(project, user._id)) {
			// user is member
			return await res.redirect(`/projects/${project._id.toString()}`);
		}

		// create application
		let application;
		try {
			await create_project_application(project, user, req.body["text"]);
		} catch (e) {
			return await res.status(500).render("error", {error: `Failed to create project application ${e}`});
		}

		// TODO:: Send notification
		// XSS
		console.log(`[NOTIF]: You have successfully applied to ${project.title} ==> ${application.applicant_id.toString()}`);
		console.log(`[NOTIF]: ${application.applicant} has requested to join ${project.title}: ${application.message}
			[Approve this application](/projects/${project._id.toString()}/join/${application._id.toString()}/approve)
			[Deny this application](/projects/${project._id.toString()}/join/${application._id.toString()}/deny)`);

		res.redirect(`/projects/${project._id}`);
	})

router.route(":id/join/:applicationId/approve")
	/**
	 * approve application to join project
	 * send notification back to user saying application was approved + additional text and linking to project
	 * add user id to project members
	 * add project id to user projects
	 */
	.post(async(req,res) => {
		let project;

		if(!req.authorized) {
			// redirect to login
			return await res.redirect("/login");
		}

		let id;
		let appId;
		try {
			id = await idVal(req.params.id);
			appId = await idVal(req.params.applicationId);
		} catch (e) {
			return await res.status(400).render("error", {error: `${e}`});
		}

		try {
			project = await getPostById(id);
		} catch (e) {
			return await res.status(404).render("error", {error: `${e}`});
		}

		// make sure application exists
		let application = await get_project_application(project, appId);
		if(!application) {
			return await res.status(404).render("error", {error: `No application with id ${appId}`});
		}

		// application approved
		// remove application, add user to project members and notify
		try {
			await remove_project_applicaiton(project, application);
		} catch (e) {
			return await res.status(500).render("error", {error: `Failed to remove application: ${e}`});
		}

		// add member to project
		try {
			await add_project_member(project, application.applicant_id);
		} catch (e) {
			return await res.status(500).render("error", {error: `Could not add user to post: ${e}`});
		}

		console.log(`[NOTIF]: Your application to ${project.title} has been accepted! ==> ${application.applicant_id.toString()}`);

		// redirec to notification page
		res.redirect("/notifications");
	})

router.route(":id/join/:applicationId/deny")
	/**
	 * deny appliaction to join project
	 * send user notification that they were denied + additional text
	 */
	.post(async(req,res) => {
		let project;

		if(!req.authorized) {
			// redirect to login
			return await res.redirect("/login");
		}

		let id;
		let appId;
		try {
			id = await idVal(req.params.id);
			appId = await idVal(req.params.applicationId);
		} catch (e) {
			return await res.status(400).render("error", {error: `${e}`});
		}

		try {
			project = await getPostById(id);
		} catch (e) {
			return await res.status(404).render("error", {error: `${e}`});
		}

		// make sure application exists
		let application = await get_project_application(project, appId);
		if(!application) {
			return await res.status(404).render("error", {error: `No application with id ${appId}`});
		}

		// application approved
		// remove application, add user to project members and notify
		try {
			await remove_project_applicaiton(project, application);
		} catch (e) {
			return await res.status(500).render("error", {error: `Failed to remove application: ${e}`});
		}

		console.log(`[NOTIF]: Your application to ${project.title} has been denied. ==> ${application.applicant_id.toString()}`);

		// redirec to notification page
		res.redirect("/notifications");
	})

router.route(":id/leave")
	/**
	 * leave project
	 * if user is owner then error
	 * else remove user id from project members and project id from user projects
	 */
	.get(async (req,res) => {
		if(!req.authorized) {
			// redirect to login
			return await res.redirect("/login");
		}

		await stringVal(req.cookies["username"]);
		await idVal(req.params.id);

		let id = req.params.id;

		let user = await getUserByUsername(req.cookies["username"]);
		if(!user) {
			return await res.status(500).render("error", {error: `No user found.`});
		}

		let project;
		try {
			project = await getPostById(id);
		} catch (e) {
			return await res.status(404).render("error", {error: `Could not find project: ${e}`})
		}

		// make sure user is not project owner
		if(user._id.toString() === project.ownerId) {
			return await res.status(401).render("error", {error: `Cannot leave project which you are the owner of!`});
		}

		// remove member
		try {
			await remove_project_member(project, user._id);
		} catch (e) {
			return await res.status(500).render("error", {error: `Failed to remove member from project: ${e}`});
		}

		// redirect to project page
		res.redirect(`/projects/${project._id.toString()}`);
	})

export default router;
