import * as express from "express";
import { stringVal, validatePassword, validateUserID } from "../helpers.js";
import { login } from "../src/lib/auth.js";

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
			return res.render("login");
		} catch (e) {
			return res.status(500).json({ error: `Internal Server Error.` });
		}
	})
	.post(async (req, res) => {
		let token = "";
		if (typeof req.body !== "object") {
			return res.status(400).json({ error: `Request body required.` });
		}

		// validate username and password
		let username = req.body["username"];
		let password = req.body["password"];

		try {
			stringVal(username);
			stringVal(password);
		} catch (e) {
			return res.status(400).json({ error: `Invalid username or password.` });
		}

		// attempt login
		try {
			token = await login(username, password);
		} catch (e) {
			return res.status(401).json({ error: `Incorrect username or password.` });
		}

		// if token undefined, login was failed
		if (!token) {
			return res.status(401).json({ error: `Incorrect username or password.` });
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
		res.status(200).json({ message: "Logged in." });
	});

router
	.route("/register")
	.get(async (req, res) => {
		try {
			return res.render("signup");
		} catch (e) {
			return res.status(500).json({ error: `Internal Server Error.` });
		}
	})
	.post(async (req, res) => {
		if (typeof req.body !== "object") {
			return res.status(400).json({ error: `Request body required.` });
		}
		// validate username and password(s)
		let userId = req.body["username"];
		let password = req.body["password"];
		let confirmPassword = req.body["password"];
		// check they exist
		const missingFields = [];
		if (!userId) missingFields.push("User ID");
		if (!password) missingFields.push("Password");
		if (!confirmPassword) missingFields.push("Confirm Password");
		if (missingFields.length > 0) {
			return res.status(400).render("signup", {
				error: `The following fields are missing: ${missingFields.join(", ")}`
			});
		}
		// check for them being invalid and somehow getting past clientside
		const errors = [];
		// Mini helper function to remove "Error in <function name>: " to make the user output much cleaner
		const stripErrorPrefix = (errorMessage) => {
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
			return res.status(400).render("register", {
				error: errors.join("\n"),
				themePreference: req.session.user.themePreference
			});
		}
		// Register the user
		try {
			// Create the user in the database
			let user = createUser(userId, password);
			// TODO FOR BENNY: GITHUB REDIRECT AND THINGS
		} catch (e) {
			return res.status(500).render("register", {
				error: "There was a problem registering. Please try again later."
			});
		}
	});

export default router;
