import { Auth } from "../src/lib/auth.js";

// If not logged in, any navigation will show the landing page
export const isLoggedIn = async (req, res, next) => {
	try {
		await Auth(req, res, () => {
			if (req.authorized) {
				next();
			} else {
				return res.redirect("/");
			}
		});
	} catch (error) {
		console.error("Error in isLoggedIn:", error);
		return res
			.status(500)
			.render("error", { errorMessage: "Internal server error", title: "Error" });
	}
};

// For the landing page to only show when logged out
export const isLoggedOut = async (req, res, next) => {
	try {
		await Auth(req, res, () => {
			if (req.authorized) {
				return res.redirect("/projects");
			} else {
				next();
			}
		});
	} catch (error) {
		console.error("Error in isLoggedOut:", error);
		return res
			.status(500)
			.render("error", { errorMessage: "Internal server error", error: "Error" });
	}
};
