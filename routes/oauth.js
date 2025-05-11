import * as express from "express";
import { ghConfig } from "../config/settings.js";
import { github_oauth_login } from "../data/oauth.js";
import { getUserByUsername, addAchievement } from "../data/users.js";
import { set_user_gh_langs, set_user_github_info } from "../src/lib/git.js";

const router = express.Router();

/**
 * Github oauth callback rotue
 * ==> https://outsite.com/auth/callback?code=AUTHORIZATION_CODE
 */
router.route("/callback").get(async (req, res) => {
	const code = req.query.code;
	const error = req.query.error;

	if (error) {
		// handle oauth login error / user rejection
		return await res.status(500).json({ error: error });
	}

	// handle not existnat code (should not happen if no reported error)
	// case if url accessed directly
	// redirect to home?
	if (!code) {
		return await res.status(500).json({ error: "No auth code" });
	}

	// login with auth code
	let user = await getUserByUsername(req.cookies["username"]);
	if (!user) {
		return await res.status(400).json({ error: `User not found.` });
	}

	try {
		let access_token = await github_oauth_login(user._id, code);
		//console.log("set the fucking thing");
		let gh_info = await set_user_github_info(user.user_name, access_token);
		let langs = await set_user_gh_langs(user.user_name, access_token);
		try {
			if (!user.achievements.includes("GitInit")) {
				addAchievement(user._id.toString(), "created", 1);
			}
		} catch (e) {
			console.log("Error adding GitInit achievement: ", e);
		}
		return await res.redirect("/projects");
	} catch (e) {
		return await res
			.status(500)
			.json({ error: `Error logging into github: ${e}` });
	}
});

/**
 * redirects user to gh auth login
 * ==> https://github.com/login/oauth/authorize?client_id={CLIENT ID}&scope={PERMISSIONS}
 * returns to callback route
 */
router.route("/login").get(async (req, res) => {
	if (!req.authorized) {
		// redirect to standard login
		return await res.redirect("/login");
	}

	let client_id = process.env["GH_CLIENT_ID"];
	if (!client_id) {
		return await res
			.status(500)
			.json({ error: `Github credentials not defined.` });
	}

	// redirect user to git oauth route
	await res
		.status(200)
		.redirect(
			`https://github.com/login/oauth/authorize?client_id=${client_id}&scope=${ghConfig.permissions.join(
				","
			)}`
		);
});

export default router;
