import express from "express";
import { constructorMethod } from "./routes/index.js";
import { settings } from "./src/settings.js";
import { do_action } from "./actions.js";
import { exit } from "./src/util/common.js";
import exphbs from "express-handlebars";
import * as dotenv from "dotenv";

const app = express();

async function Main() {
	// import environment variables
	dotenv.config({
		path: ".env"
	});

	// guys idk where in the code this should go in relation but
	// imma just put it here for now:

	// const db = await dbConnection();
	// await db.dropDatabase();
	/**
	 * ensure client secrets are present in environment
	 */
	let _gh_client_id = process.env["GH_CLIENT_ID"];
	let _gh_client_secret = process.env["GH_CLIENT_SECRET"];
	if (!_gh_client_id) {
		console.error(
			`ERROR: Missing client secrets:${_gh_client_id ? "" : " GH_CLIENT_ID"}${
				_gh_client_secret ? "" : " GH_CLIENT_SECRET"
			}`
		);
		process.exit(1);
	}

	//get action if applicable
	let action;
	for (let arg = 0; arg < process.argv.length; arg++) {
		if (process.argv[arg] === "action") {
			action = process.argv[arg + 1];
		}
	}
	if (action) {
		await do_action(action);
		exit(0);
	}
	// Use a Set to track seen domain values
	const seenValues = new Set();
	app.engine(
		"handlebars",
		exphbs.engine({
			defaultLayout: "main",
			helpers: {
				eq: (a, b) => a === b,
				isDuplicate: (value) => {
					if (seenValues.has(value)) {
						return true;
					}
					seenValues.add(value);
					return false;
				}
			}
		})
	);
	app.set("view engine", "handlebars");
	// Clear the Set for each new request
	app.use((req, res, next) => {
		seenValues.clear();
		next();
	});
	constructorMethod(app);
	try {
		app.listen(settings.port, (e) => {
			if (typeof e === "undefined") {
				/**
				 * Server is running!
				 */
				// Anna updated: added the link right there in the print
				console.log(`Server running on: http://localhost:3000`);
			} else {
				// error occured starting server :(
				failwith(`Failed to start server! ${e}`);
			}
		});
	} catch (e) {
		// fail to listen for server
		failwith(`Failed to start server! ${e}`);
	}
}

await Main();
