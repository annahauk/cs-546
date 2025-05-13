import { Router } from "express";
import fs from "fs/promises";
import multer from "multer";
import path from "path";
import {
	getUserById,
	getUserByUsername,
	updateUserTags,
	setUserTags,
	users_are_friends,
	create_friend_request,
	user_has_friend_request,
	get_friend_request,
	approve_friend_request,
	deny_friend_request,
	remove_friend,
	pendingNotifs
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

		// get signed in user
		let me;
		try {
			me = await getUserByUsername(req.cookies["username"]);
			me._id = idVal(me._id.toString());
		} catch (e) {
			console.error(e);
			return res.status(400).render(`error`, {errorMessage: `cant get signed in user`});
		}

		let user = await getUserById(userId);
		if (!user) {
			return res
				.status(404)
				.render("error", { errorMessage: "User not found", title: "Error" });
		}
		// Figure out if you're looking at your profile or not
		let isMyProfile = false;
		let myUsername = req.cookies["username"];
		let myUserObj = await getUserByUsername(myUsername);
		if (myUserObj._id.toString() === userId) {
			isMyProfile = true;
		}
		// Get the user friends
		user["Friends"] = [];
		for (const ii in user.friends) {
			// get user from member id
			//console.log(user.friends[ii]);
			let user2 = await getUserById(user.friends[ii].id.toString());

			// assign member id/name combination to project member info position
			user["Friends"][ii] = {
				id: user2._id,
				name: user2.user_name
			};
		}
		// Get the projects created by the user
		let isFriendVal = await users_are_friends(user, me);
		//console.log(isFriendVal)
		const notifs = await pendingNotifs(me._id);

		// set boolean if the logged in user matches the profile user (profile is the user's profile)
		let isProfileOwner = (me._id === user._id);

		try {
			const userPosts = await getPostsByUserId(userId);
			res.render("profile", {
				user: user,
				title: user.user_name,
				userProjects: userPosts,
				isMyProfile: isMyProfile,
				hasFriendRequest: await user_has_friend_request(me, user),
				isFriend: await users_are_friends(user, me),
				notifs: notifs,
				isProfileOwner: isProfileOwner
			});
		} catch (e) {
			res.render("profile", {
				user: user,
				title: user.user_name,
				userProjects: [],
				isMyProfile: isMyProfile,
				hasFriendRequest: await user_has_friend_request(me, user),
				isFriend: await users_are_friends(user, me),
				notifs: notifs,
				isProfileOwner: isProfileOwner
			});
		}
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.render("error", { errorMessage: "Internal server error", title: "Error" });
	}
});
router.route("/:id/edit").get(isLoggedIn, async (req, res) => {
	// Display edit profile page
	try {
		const userId = idVal(req.params.id);
		const user = await getUserById(userId);
		if (!user) {
			return res
				.status(404)
				.render("error", { errorMessage: "User not found", title: "Error" });
		}
		if (user.user_name !== stringVal(req.cookies["username"])) {
			return res.status(403).render("error", {
				errorMessage: "You can only edit your own profile.",
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
		let userProjects;
		try {
			userProjects = await getPostsByUserId(userId);
		} catch (e) {
			// user has no projects
			userProjects = [];
		}

		// add user id/combination to user projects... mein gott
		// fuckass algorithm #2!!!
		// for each of user's projects
		for (const i in userProjects) {
			userProjects[i]["memberInfo"] = new Array(userProjects[i].members.length);

			// for each member of project
			for (const ii in userProjects[i].members) {
				// get user from member id
				let user = await getUserById(userProjects[i].members[ii].toString());

				// assign member id/name combination to project member info position
				userProjects[i]["memberInfo"][ii] = {
					id: userProjects[i].members[ii].toString(),
					name: user.user_name
				};
			}
		}
		const notifs = await pendingNotifs(userId);
		res.render("editProfile", {
			user: user,
			title: "Edit Profile",
			allTags: allTags,
			userProjects: userProjects,
			notifs: notifs
		});
	} catch (error) {
		res
			.status(500)
			.render("error", { errorMessage: "Internal server error", title: "Error" });
	}
});

router
	.route("/:id/resume")
	.post(isLoggedIn, upload.single("resume"), async (req, res) => {
		try {
		// get signed in user
			let me;
			try {
				me = await getUserByUsername(req.cookies["username"]);
				me._id = idVal(me._id.toString());
			} catch (e) {
				console.error(e);
				return res.status(400).render(`error`, {errorMessage: `cant get signed in user`});
			}

			const userId = idVal(req.params.id);
			const user = await getUserById(userId);
			if (!user) {
				return res
					.status(404)
					.render("error", { errorMessage: "User not found", title: "Error" });
			}
			if (user.user_name !== stringVal(req.cookies["username"])) {
				return res.status(403).render("error", {
					errorMessage: "You can only edit your own profile.",
					title: "Error"
				});
			}
			if (!req.file) {
				return res
					.status(400)
					.render("error", { errorMessage: "No file uploaded", title: "Error" });
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
			const notifs = await pendingNotifs(userId);
			let isProfileOwner = (me._id === user._id);
			res.render("profile", { user: user, title: user.user_name, notifs:notifs, isProfileOwner: isProfileOwner });
		} catch (error) {
			res
				.status(500)
				.render("error", { errorMessage: "Internal server error", title: "Error" });
		}
	});

router.route("/:id/updateTags").post(isLoggedIn, async (req, res) => {
	try {
		const userId = idVal(req.params.id);
		const { tags } = req.body;

		if (!Array.isArray(tags)) {
			return res.status(400).json({ message: "Invalid tags format." });
		}

		await setUserTags(userId, tags);
		res.json({ message: "Tags updated successfully." });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error." });
	}
});

/**
 * friend request routes
 */
router.route("/friendRequest/:id")
	// send friend request to user with id :id
	// add friend request object to their document
	// check if they already have a friend request pending
	.post(async(req,res) => {
		let id;
		let username;
		try {
			id = idVal(req.params.id);
			username = stringVal(req.cookies["username"]);
		} catch (e) {
			console.error(e);
			return res.status(400).render(`error`, {errorMessage: `Malformed id or username.`});
		}

		// get current user
		let user = await getUserByUsername(username);
		if(!user) {
			return res.status(404).render(`error`, {errorMessage: `User not found.`});
		}
		user._id = idVal(user._id.toString());

		// get requested user
		let newfriend = await getUserById(id);
		if(!newfriend) {
			return res.status(404).render(`error`, {errorMessage: `Requested user not found. You need to find real friends pookie.`});
		}

		// make sure users are not friends already
		if(await users_are_friends(user, newfriend)) {
			return res.status(400).render(`error`, {errorMessage: `Y'all are friends already, chill.`});
		}

		// create friend request
		try {
			await create_friend_request(user, newfriend);
		} catch (e) {
			console.error(e);
			return res.status(400).render(`error`, {errorMessage: `Y'all friends already`});
		}

		return res.redirect(`/profile/${id}`);
	})

// accept fwiend wequest :3
router.route("/friendAccept/:requestId")
	.post(async(req,res) => {
		let reqId;
		let username;
		try {
			reqId = idVal(req.params.requestId);
			username = stringVal(req.cookies["username"]);
		} catch (e) {
			return res.status(400).render(`error`, {errorMessage: `Malformed id or username.`});
		}

		let user = await getUserByUsername(username);
		if(!user) {
			return res.status(500).render(`error`, {errorMessage: `User not found.`});
		}
		user._id = idVal(user._id.toString());

		// get friend request in user
		let request = await get_friend_request(user, reqId);
		if(!request) {
			return res.status(404).render(`error`, {errorMessage: `Friend request not found.`});
		}

		// approve friend request
		try {
			await approve_friend_request(user, reqId);
		} catch (e) {
			console.error(e);
			return res.status(500).render(`error`, {'error': `Failed to approve friend request`});
		}

		return res.redirect(`/notifications`);
	});

router.route("/friendDeny/:requestId")
	.post(async (req,res) => {
		let reqId;
		let username;
		try {
			reqId = idVal(req.params.requestId);
			username = stringVal(req.cookies["username"]);
		} catch (e) {
			return res.status(400).render(`error`, {errorMessage: `Malformed id or username.`});
		}

		let user = await getUserByUsername(username);
		if(!user) {
			return res.status(500).render(`error`, {errorMessage: `User not found.`});
		}
		user._id = idVal(user._id.toString());

		// get friend request in user
		let request = await get_friend_request(user, reqId);
		if(!request) {
			return res.status(404).render(`error`, {errorMessage: `Friend request not found.`});
		}

		try {
			await deny_friend_request(user, reqId);
		} catch (e) {
			console.error(e);
			return res.status(500).render(`error`, {errorMessage: `Failed to deny friend request.`});
		}

		res.redirect(`/notifications`);
	});

router.route("/friendRemove/:id")
	.post(async(req,res) => {
		let id;
		let username;
		try {
			id = idVal(req.params.id);
			username = stringVal(req.cookies["username"]);
		} catch (e) {
			console.error(e);
			return res.status(400).render(`error`, {errorMessage: `bad id or username`});
		}

		let me = await getUserByUsername(username);
		me._id = idVal(me._id.toString());
		if(!me) {
			return res.status(500).render(`error`, {"error": `me not found?`});
		}

		let user = await getUserById(id);
		if(!user) {
			return res.status(404).render(`error`, {'error': `User not found.`});
		}

		let friend;
		for(const f of me.friends) {
			if(f.id === id) {
				friend = f;
			}
		}
		if(!friend) {
			return res.status(404).render(`error`, {errorMessage: `Friend not found`});
		}

		try {
			await remove_friend(me, friend.id);
		} catch (e) {
			console.error(e);
			return res.status(500).render(`error`, {'error': `Failed to remove friend`});
		}

		return res.redirect(`/profile/${user._id}`);
	});

export default router;
