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
	remove_project_member,
	getPostsByUserId,
	updatePost,
	doPostLikeAction,
	user_has_application,
	user_owns_post
} from "../data/posts.js";
import {
	getUserByUsername,
	getUserById,
	getUserTags,
	addAchievement,
	pendingNotifs
} from "../data/users.js";
import { createComment, getAllCommentsByUserId } from "../data/comments.js";
import { isLoggedIn } from "./middleware.js";
import {
	stringVal,
	idVal,
	TERMS_AND_DOMAINS,
	validObjectId,
	parse_sanitized_array
} from "../helpers.js";
import { ObjectId } from "mongodb";
import { all } from "axios";
import { createNotif } from "../data/notifications.js";

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
					const aMatchCount = aPost.topic_tags.filter((tag) =>
						userTags.includes(tag)
					).length;
					const bMatchCount = bPost.topic_tags.filter((tag) =>
						userTags.includes(tag)
					).length;
					return bMatchCount - aMatchCount;
				});
				// console.log("All posts (sorted):");
				// console.log(allPosts);
				const notifs = await pendingNotifs(userId);
				res.render("projects", {
					posts: allPosts,
					hasPosts: Array.isArray(allPosts) && allPosts.length > 0,
					termsAndDomains: TERMS_AND_DOMAINS,
					title: "Projects",
					notifs: notifs
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
				let { search, tags, languages, status, reset } = req.body;
				// Get the filtered posts or full posts depending on what's needed

				tags = parse_sanitized_array(tags);
				languages = parse_sanitized_array(languages);

				let filteredPosts = null;
				let tagsAndLanguages = [
					...(Array.isArray(tags) ? tags : [tags]).filter(Boolean),
					...(Array.isArray(languages) ? languages : [languages]).filter(
						Boolean
					)
				];
				if (!reset) {
					filteredPosts = await grabfilteredPosts(
						tagsAndLanguages,
						search,
						status
					);
				} else {
					filteredPosts = await getAllPosts();
				}
				let userTags = await getUserTags(userId);
				filteredPosts.sort((aPost, bPost) => {
					const aMatchCount = aPost.topic_tags.filter((tag) =>
						userTags.includes(tag)
					).length;
					const bMatchCount = bPost.topic_tags.filter((tag) =>
						userTags.includes(tag)
					).length;
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
			if (!req.authorized) {
				return res.redirect("/login");
			}
			let user = await getUserByUsername(req.cookies["username"]);
			if (!user) {
				return res.status(500).render("error", { error: `No user found.` });
			}
			const notifs = await pendingNotifs(user._id.toString());
			res.render("projectcreate", {
				title: "New Project",
				termsAndDomains: TERMS_AND_DOMAINS,
				notifs: notifs
			});
		} catch (error) {
			console.error(error);
			res.status(500).render("error", {
				message: "Internal server error",
				title: "Error"
			});
		}
	})
	.post(isLoggedIn, async (req, res) => {
		let ownerId = "";
		let ownerUsername = "";
		if (req.authorized) {
			ownerUsername = req.cookies["username"];
			let owner = await getUserByUsername(ownerUsername);
			ownerId = owner._id.toString();
		} else {
			return res.redirect("/login");
		}
		try {
			// Accept JSON data from AJAX
			let { title, description, repoLink, combinedTags } = req.body;
			combinedTags = parse_sanitized_array(combinedTags);
			const errors = [];

			// Validate inputs (server-side, always!)
			if (!title || typeof title !== "string" || title.trim() === "") {
				errors.push("Title is required.");
			}
			if (title.trim().length < 5 || title.trim().length > 50) {
				errors.push("Title must be between 5 and 50 characters.");
			}
			if (
				!description ||
				typeof description !== "string" ||
				description.trim() === ""
			) {
				errors.push("Description is required.");
			}
			if (description.trim().length < 10 || description.trim().length > 2000) {
				errors.push("Description must be between 10 and 2000 characters.");
			}
			if (
				!repoLink ||
				typeof repoLink !== "string" ||
				!/^https?:\/\/.+/.test(repoLink.trim())
			) {
				errors.push("A valid repository link is required.");
			}
			if (!Array.isArray(combinedTags) || combinedTags.length === 0) {
				errors.push("Please select at least one tag.");
			}

			if (errors.length > 0) {
				return res.status(400).json({ message: errors.join(" ") });
			}

			// Create the project post
			try {
				// Err if post title/link already exists
				const post = await createPost(
					title.trim(),
					ownerId,
					description.trim(),
					repoLink.trim(),
					combinedTags.map((tag) => tag.trim())
				);
				const postId = post._id.toString();
				const numPosts = (await getPostsByUserId(ownerId)).length;
				await addAchievement(ownerId, "post", numPosts);
				return res.status(200).json({ message: "Project created", postId });
			} catch (e) {
				return res.status(400).json({ message: e });
			}
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	});

router.route("/:id").get(isLoggedIn, async (req, res) => {
	// Display a specific project
	const projectId = idVal(req.params.id);
	let post = null;
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

		// get current user (to check if theyre a member)
		let user = await getUserByUsername(req.cookies["username"]);
		if (!user) {
			return await res.status(500).render("error", { error: `No user found.` });
		}

		post["memberInfo"] = [];
		// for each member of project
		for (const ii in post.members) {
			// get user from member id
			let user = await getUserById(post.members[ii].toString());

			// assign member id/name combination to project member info position
			post["memberInfo"][ii] = {
				id: post.members[ii].toString(),
				name: user.user_name
			};
		}


		const notifs = await pendingNotifs(user._id.toString());

		res.render("project", {
			project: post,
			creatorUsername: username,
			title: post.title,
			isMember: await post_has_member(post, user._id),
			isOwner: await user_owns_post(post, user._id),
			hasApplication: await user_has_application(post, user._id.toString()),
			notifs: notifs
});
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.render("error", { message: "Internal server error", title: "Error" });
	}
});

router
	.route("/:id/join/")
	/**
	 * request to join a project
	 * sends notification to project owner with approve/deny links + additional text from user
	 * join request has individual id
	 */
	.post(async (req, res) => {
		if (!req.authorized) {
			// redirect to login
			return await res.redirect("/login");
		}

		let id;
		try {
			id = await idVal(req.params.id);
		} catch (e) {
			return await res.status(400).render("error", { error: `Bad id format.` });
		}

		// make sure project exists
		let project;
		try {
			project = await getPostById(id);
		} catch (e) {
			return await res
				.status(404)
				.render("error", { error: `No post with id ${id}` });
		}

		// make sure user is not in project. If so, redirec to project page
		let user = await getUserByUsername(req.cookies["username"]);
		if (!user) {
			return await res
				.status(500)
				.render("error", { error: "User not found." });
		}
		if (await post_has_member(project, user._id)) {
			// user is member
			return await res.redirect(`/projects/${project._id.toString()}`);
		}

		// make sure user doesnt have a pending application
		if(await user_has_application(project, user._id.toString())) {
			return res.status(400).render("error", {error: `User already has an application for this project.`});
		}

		// create application
		let application;
		let text = req.body["text"];
		if (text) {
			text = text.trim();
			if (text.length > 200) return res.status(400).json({ message: "Message must be up to 200 characters" });
		}
		try {
			application = await create_project_application(
				project,
				user,
				text
			);
		} catch (e) {
			return await res.status(500).render("error", {
				error: `Failed to create project application ${e}`
			});
		}

		// TODO:: Send notification
		// XSS

		try {
			// applicant notification (nclude reference post, NOT reference application)
			await createNotif(
				application.applicant_id.toString(),
				`You have successfully applied to ${project.title}`,
				`Once the owner of this project reveiws your application, you will see a new notification here.`,
				project._id,
				null,
				"GitMatches System",
				null,
				null,
				project.ownerId,
				project._id,
				null,
				null
			);

			// owner notification, requires approval, include reference application and post
			let message = req.body["text"] ? text : "";
			//console.log(`join message: ${message}`, req.body);
			await createNotif(
				project.ownerId,
				`${application.applicant} as applied to join ${project.title}`,
				`${application.applicant} has requested to join ${project.title}. "${
					message.length > 0 ? `${message}\n` : ""
				}". Here you may choose to accept or deny their application.`,
				project._id,
				null,
				"GitMatches System",
				null,
				null,
				project.ownerId,
				project._id,
				true,
				application._id.toString()
			);
		} catch (e) {
			console.error(e);
			return await res
				.status(500)
				.render("error", { error: `Failed to push notifications.` });
		}

		res.redirect(`/projects/${project._id}`);
	});

router
	.route("/:id/join/:applicationId/approve")
	/**
	 * approve application to join project
	 * send notification back to user saying application was approved + additional text and linking to project
	 * add user id to project members
	 * add project id to user projects
	 */
	.post(async (req, res) => {
		let project;

		if (!req.authorized) {
			// redirect to login
			return await res.redirect("/login");
		}

		let id;
		let appId;
		try {
			id = await idVal(req.params.id);
			appId = await idVal(req.params.applicationId);
		} catch (e) {
			return await res.status(400).render("error", { error: `${e}` });
		}

		try {
			project = await getPostById(id);
		} catch (e) {
			return await res.status(404).render("error", { error: `${e}` });
		}

		// make sure application exists
		let application = await get_project_application(project, appId);
		if (!application) {
			return await res
				.status(404)
				.render("error", { error: `No application with id ${appId}` });
		}

		// application approved
		// remove application, add user to project members and notify
		try {
			await remove_project_applicaiton(
				project,
				application,
				true,
				req.body["text"]
			);
		} catch (e) {
			return await res
				.status(500)
				.render("error", { error: `Failed to remove application: ${e}` });
		}

		// add member to project
		try {
			await add_project_member(project, application.applicant_id);
		} catch (e) {
			return await res
				.status(500)
				.render("error", { error: `Could not add user to post: ${e}` });
		}

		// joiner and joinee achievements
		// Lot of comments here because this is a lil confusing lol
		// Get all projects
		const allProjs = await getAllPosts();
		// To track when joiner is a member
		let thisUserCount = 0;
		// To track distinct members when the joinee is the owner
		let allMembers = [];
		for (let proj of allProjs) {
			// Iterate over all membrs
			let members = proj.members;
			for (let member of members) {
				// Count when this joiner is a member
				if (member.toString() === application.applicant_id.toString())
					thisUserCount++;
				// Count when this joinee is the owner (project.ownerId should be a string)
				if (
					proj.ownerId.toString() === project.ownerId &&
					!allMembers.includes(member.toString())
				)
					allMembers.push(member.toString());
			}
		}
		await addAchievement(
			application.applicant_id.toString(),
			"join",
			thisUserCount
		);
		await addAchievement(project.ownerId, "othersJoined", allMembers.length);

		try {
			// anonymous
			let message = req.body["text"] ? req.body["text"] : "";
			//console.log(`approve message: ${message}`, req.body);
			await createNotif(
				application.applicant_id.toString(),
				`You have been accepted to ${project.title}!`,
				`Your application to join ${project.title} has been accepted. "${message}"`,
				undefined,
				undefined,
				"GitMatches System"
			);
		} catch (e) {
			throw new Error(`Failed to create acception notification`);
		}

		// redirec to notification page
		res.redirect("/notifications");
	});

router
	.route("/:id/join/:applicationId/deny")
	/**
	 * deny appliaction to join project
	 * send user notification that they were denied + additional text
	 */
	.post(async (req, res) => {
		let project;

		if (!req.authorized) {
			// redirect to login
			return await res.redirect("/login");
		}

		let id;
		let appId;
		try {
			id = await idVal(req.params.id);
			appId = await idVal(req.params.applicationId);
		} catch (e) {
			return await res.status(400).render("error", { error: `${e}` });
		}

		try {
			project = await getPostById(id);
		} catch (e) {
			return await res.status(404).render("error", { error: `${e}` });
		}

		// make sure application exists
		let application = await get_project_application(project, appId);
		if (!application) {
			return await res
				.status(404)
				.render("error", { error: `No application with id ${appId}` });
		}

		// application denied
		// remove application, add user to project members and notify
		try {
			await remove_project_applicaiton(
				project,
				application,
				false,
				req.body["text"]
			);
		} catch (e) {
			return await res
				.status(500)
				.render("error", { error: `Failed to remove application: ${e}` });
		}

		try {
			// anonymous
			let message = req.body["text"] ? req.body["text"] : "";
			//console.log(`deny additional message: ${message}`, req.body);
			await createNotif(
				application.applicant_id.toString(),
				`Application ${project.title} was denied.`,
				`Your application to join ${project.title} has been denied. "${message}"`,
				undefined,
				undefined,
				"GitMatches System"
			);
		} catch (e) {
			throw new Error(`Failed to create acception notification`);
		}

		// redirec to notification page
		res.redirect("/notifications");
	});

router
	.route("/:id/leave")
	/**
	 * leave project
	 * if user is owner then error
	 * else remove user id from project members and project id from user projects
	 */
	.post(async (req, res) => {
		if (!req.authorized) {
			// redirect to login
			return await res.redirect("/login");
		}

		await stringVal(req.cookies["username"]);
		await idVal(req.params.id);

		let id = req.params.id;

		let user = await getUserByUsername(req.cookies["username"]);
		if (!user) {
			return await res.status(500).render("error", { error: `No user found.` });
		}

		let project;
		try {
			project = await getPostById(id);
		} catch (e) {
			return await res
				.status(404)
				.render("error", { error: `Could not find project: ${e}` });
		}

		// make sure user is not project owner
		if (user._id.toString() === project.ownerId) {
			return await res.status(401).render("error", {
				error: `Cannot leave project which you are the owner of!`
			});
		}

		// remove member
		try {
			await remove_project_member(project, user._id);
		} catch (e) {
			return await res.status(500).render("error", {
				error: `Failed to remove member from project: ${e}`
			});
		}

		// redirect to project page
		res.redirect(`/projects/${project._id.toString()}`);
	});

router.route("/:id/comments").post(isLoggedIn, async (req, res) => {
	try {
		const projectId = req.params.id;
		const { comment } = req.body;

		if (!comment || typeof comment !== "string" || comment.trim() === "") {
			return res.status(400).json({ message: "Invalid comment." });
		}
		const username = req.cookies["username"]
		let ownerId = await getUserByUsername(username);
		ownerId = ownerId._id.toString();
		// Add the comment to the database
		const newComment = await createComment(comment, projectId, ownerId);

		// Fetch the updated project and its comments
		const updatedProject = await getPostById(projectId);
		const comments = updatedProject.comments.map((comment) => ({
			...comment,
			_id: comment._id.toString(),
			ownerId: comment.ownerId.toString(),
			postId: comment.postId.toString()
		}));
		const numComments = (await getAllCommentsByUserId(ownerId)).length;
		await addAchievement(ownerId, "comment", numComments);
		try {
			// Notification to the project owner
			await createNotif(
				updatedProject.ownerId,
				`${username} commented on your project ${updatedProject.title}`,
				`"${comment}"`,
				projectId,
				newComment._id.toString(),
				"GitMatches System",
				null,
				null,
				ownerId, // maybe should be null?
				projectId, // maybe should be null?
				null,
				null
			);
		} catch (e) {
			console.error(e);
			return res.status(500).render("error", {
				error: `Failed to push notifications.`
			});
		}
		res.render("partials/commentsList", {
			comments,
			layout: false
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error." });
	}
});

// Route for updating project
router.post("/:id/edit", isLoggedIn, async (req, res) => {
	try {
		const projectId = idVal(req.params.id);
		let { title, content, repoLink, status, topic_tags } = req.body;

		topic_tags = parse_sanitized_array(topic_tags);

		// Validate inputs
		if (!title || typeof title !== "string" || title.trim() === "") {
			return res.status(400).json({ message: "Title is required." });
		}
		if (!content || typeof content !== "string" || content.trim() === "") {
			return res.status(400).json({ message: "Content is required." });
		}
		if (
			!repoLink ||
			typeof repoLink !== "string" ||
			!/^https?:\/\/.+/.test(repoLink.trim())
		) {
			return res
				.status(400)
				.json({ message: "A valid repository link is required." });
		}
		if (!["active", "completed"].includes(status)) {
			return res.status(400).json({ message: "Invalid status value." });
		}
		if (
			!Array.isArray(topic_tags) ||
			topic_tags.some((tag) => typeof tag !== "string")
		) {
			return res.status(400).json({ message: "Invalid topic tags." });
		}

		// Update the project
		const updateData = {
			title: title.trim(),
			content: content.trim(),
			repoLink: repoLink.trim(),
			status,
			topic_tags: topic_tags.map((tag) => tag.trim())
		};

		await updatePost(projectId, updateData);

		res.json({ message: "Project updated successfully." });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error." });
	}
});

// Route for removing user from project
router.route("/:id/removeMember/:memberId").post(async (req, res) => {
	let project;
	let user;
	let memberId;

	try {
		memberId = idVal(req.params.memberId);
	} catch (e) {
		console.error(e);
		return await res.status(400).render("error", { error: `Bad member id` });
	}

	try {
		let projId = idVal(req.params.id, "projId", "removeMember_route");
		project = await getPostById(projId);
	} catch (e) {
		console.error(e);
		console.log(`404 project`);
		return await res
			.status(404)
			.render("error", { error: `No project with Id: ${req.params.id}` });
	}

	try {
		let usrname = stringVal(req.cookies["username"]);
		user = await getUserByUsername(usrname);
	} catch (e) {
		console.error(e);
		return await res.status(500).render("error", { error: `No user found.` });
	}

	// make sure user is owner of project
	if (user._id.toString() !== project.ownerId) {
		res
			.status(401)
			.render("error", { error: `Only project owners can remove members.` });
	}

	// check if member of project
	if (
		!(await project.members
			.map((id) => {
				return id.toString();
			})
			.includes(memberId))
	) {
		console.log("404 user not in project");
		return await res
			.status(404)
			.render("error", { error: `Member not found in project.` });
	}

	// remove user and send them a notif
	try {
		await remove_project_member(project, new ObjectId(memberId));
	} catch (e) {
		console.error(e);
		return await res
			.status(500)
			.render("error", { error: `Failed to remove member from project,` });
	}

	// send user notification
	await createNotif(
		memberId,
		`You have been removed from ${project.title}.`,
		`The owner of ${project.title} has removed you from the project.`,
		project._id,
		null,
		`GitMatches System`,
		false,
		false,
		project.ownerId,
		project._id,
		false,
		null
	);

	res.redirect(`/profile/${user._id.toString()}/edit`);
});

router.route("/:id/like").post(isLoggedIn, async (req, res) => {
	try {
		let projectId = req.params.id;
		let username = req.cookies["username"];
		let user = await getUserByUsername(username);
		let userId = user._id.toString();
		if (!userId) {
			return res.status(401).json({ error: "Unauthorized" });
		}
		projectId = idVal(projectId, "projectId", "like(route)");
		let post = null;
		try {
			post = await getPostById(projectId);
		} catch (e) {
			return res
				.status(404)
				.render("error", { errorMessage: "Project not found", title: "Error" });
		}
		userId = idVal(userId, "userId", "like(route)");
		const updatedPost = await doPostLikeAction(projectId, userId);
		try {
			if (updatedPost.likes.includes(userId)) {
				// Notification to the project owner
				await createNotif(
					post.ownerId,
					`${username} liked your project ${post.title}`,
					`Your post now has ${updatedPost.likes.length} like${updatedPost.likes.length === 1 ? "" : "s"}.`,
					projectId,
					null,
					"GitMatches System",
					null,
					null,
					userId, // maybe should be null?
					projectId, // maybe should be null?
					null,
					null
				);
			}
		} catch (e) {
			console.error(e);
			return res.status(500).render("error", {
				error: `Failed to push notifications.`
			});
		}
		// Return updated like count
		res.json({ likes: updatedPost.likes.length });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
