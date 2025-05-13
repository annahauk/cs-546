import * as express from "express";
import { stringVal, validatePassword, validateUserID } from "../helpers.js";
import { login, logout } from "../src/lib/auth.js";
import { createUser, getUserByUsername } from "../data/users.js";
import { get_user_gh_token } from "../data/oauth.js";
import { get_auth_by_username } from "../data/authdata.js";

const router = express.Router();

/**
 * login routes
 * requires username and passphrase in request body
 * utilizes bcrypt from auth library
 * auth collection
 * returns token if login successful
 */
router
	.route("/login")
	.get(async (req, res) => {
		try {
			if (!req.authorized) {
				return await res.render("login", { title: "Login" });
			} else {
				// user logged in, redirect to /projects
				return await res.redirect("/projects");
			}
		} catch (e) {
			return res
				.status(500)
				.render("error", { errorMessage: `Internal Server Error.`, title: "Error" });
		}
	})
	.post(async (req, res) => {
		// reditect to projects if logged in
		if (req.authorized) {
			return await res.redirect("/projects");
		}

		let token = "";
		if (typeof req.body !== "object") {
			return res
				.status(400)
				.render("login", { error: `Request body required.`, title: "Login" });
		}

		// validate username and password
		let username = req.body["username"];
		let password = req.body.UNSANITIZED["password"];

		try {
			stringVal(username);
			stringVal(password);
		} catch (e) {
			return res
				.status(400)
				.render("login", {
					error: `Invalid username or password.`,
					title: "Login"
				});
		}

		// attempt login
		try {
			token = await login(username, password);
		} catch (e) {
			return res
				.status(401)
				.render("login", {
					error: `Incorrect username or password.`,
					title: "Login"
				});
		}

		// if token undefined, login was failed
		if (!token) {
			return res
				.status(401)
				.render("login", {
					error: `Incorrect username or password.`,
					title: "Login"
				});
		}

		// success, return token
		// TODO: Enforce secure once on https
		res.cookie("token", token.content, {
			httpOnly: true, // prevents JavaScript access
			//secure: true,       // send only over HTTPS
			sameSite: "lax", // CSRF protection
			maxAge: 86400000 * 28 // 1 month
		});
		res.cookie("username", username, {
			httpOnly: true, // prevents JavaScript access
			//secure: true,       // send only over HTTPS
			sameSite: "lax", // CSRF protection
			maxAge: 86400000 * 28 // 1 month
		});

		// if has github token, go to projects else go to oauth login
		let user = await getUserByUsername(username);
		if (!user) {
			return await res
				.status(404)
				.render("login", { error: `User not found.`, title: "Login" });
		}
		if (!(await get_user_gh_token(user._id))) {
			// goto oauth
			return await res.redirect("/oauth/login");
		} else {
			return await res.redirect("/projects");
		}
	});

router
	.route("/register")
	.get(async (req, res) => {
		try {
			if (!req.authorized) {
				return await res.render("signup", { title: "Signup" });
			} else {
				return await res.redirect("/projects");
			}
		} catch (e) {
			return res
				.status(500)
				.render("error", { errorMessage: `Internal Server Error.`, title: "Error" });
		}
	})
	.post(async (req, res) => {
		// reditect to projects if logged in
		if (req.authorized) {
			return await res.redirect("/projects");
		}

		if (typeof req.body !== "object") {
			return res
				.status(400)
				.render("signup", { error: `Request body required.`, title: "Signup" });
		}

		// validate username and password(s)
		let userId = req.body["username"];
		let password = req.body.UNSANITIZED["password"];
		let confirmPassword = req.body.UNSANITIZED["password"];
		// check they exist
		const missingFields = [];
		if (!userId) missingFields.push("User ID");
		if (!password) missingFields.push("Password");
		if (!confirmPassword) missingFields.push("Confirm Password");
		if (missingFields.length > 0) {
			return res.status(400).render("signup", {
				error: `The following fields are missing: ${missingFields.join(", ")}`,
				title: "Signup"
			});
		}

		// check for them being invalid and somehow getting past clientside
		const errors = [];
		// Mini helper function to remove "Error in <function name>: " to make the user output much cleaner
		const stripErrorPrefix = (errorMessage) => {
			console.error(errorMessage);
			return errorMessage.replace(/^Error in .*?: /, "");
		};
		// Validate inputs using helper functions, tracking what all the errors are in all inputs to display them all to user
		let functionName = "register(routes)";
		try {
			userId = validateUserID(userId, "userId", functionName);
		} catch (e) {
			errors.push(stripErrorPrefix(e));
		}
		try {
			password = validatePassword(password, "password", functionName);
		} catch (e) {
			errors.push(stripErrorPrefix(e));
		}
		try {
			confirmPassword = validatePassword(
				password,
				"confirmPassword",
				functionName
			);
		} catch (e) {
			errors.push(stripErrorPrefix(e));
		}
		if (password !== confirmPassword) {
			errors.push("Passwords do not match.");
		}
		// If there are validation errors, re-render the form with the errors
		if (errors.length > 0) {
			return res.status(400).render("signup", {
				error: errors.join("\n"),
				title: "Signup"
			});
		}
		// Register the user
		try {
			// Create the user in the database
			let user = await createUser(userId, password);
			return res.redirect("/login");
		} catch (e) {
			return res.status(500).render("signup", {
				error: "There was a problem registering. Please try again later.",
				title: "Signup"
			});
		}
	});

router.route("/logout").get(async (req, res) => {
	if (!req.authorized) {
		// not logged in
		return res.redirect("/login");
	}

	let username = req.cookies["username"];
	let token_content = req.cookies["token"];

	if (!username || !token_content) {
		return res
			.status(400)
			.render("error", {
				message: `Missing client username or token`,
				title: "Error"
			});
	}

	try {
		await logout(username, token_content);
	} catch (e) {
		console.log(e);
		return res
			.status(500)
			.render("error", {
				message: `Error logging out user: ${e}`,
				title: "Error"
			});
	}

	return res.redirect("/login");
});

export default router;
