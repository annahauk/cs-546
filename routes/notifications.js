import { Router } from "express";
import { isLoggedIn } from "./middleware.js";
import { getUserById, getUserByUsername } from "../data/users.js";
import { idVal, stringVal } from "../helpers.js";
import { resolveNotif } from "../data/notifications.js";

const router = Router();

router.route("/").get(isLoggedIn, async (req, res) => {
	if (req.authorized) {
		let username = req.cookies["username"];
		let user = await getUserByUsername(username);
		return res.redirect("/notifications/" + user._id);
	} else {
		return res.redirect("/login");
	}
});

router.route("/:id").get(isLoggedIn, async (req, res) => {
	// Display a user's notifications
	try {
		const userId = idVal(req.params.id);
		const user = await getUserById(userId);
		if (!user) {
			return res
				.status(404)
				.render("error", { message: "User not found", title: "Error" });
		}
		res.render("notifications", { user: user, title: "My Notifications" });
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.render("error", { message: "Internal server error", title: "Error" });
	}
});

router.route("/resolve/:id").post(isLoggedIn, async (req, res) => {
	try {
		const notificationId = idVal(req.params.id);
		let username = req.cookies["username"];
		let user = await getUserByUsername(username);

		if (!user) {
			return res
				.status(404)
				.render("error", { message: "User not found", title: "Error" });
		}

		// Use the resolveNotif function to mark the notification as resolved
		await resolveNotif(notificationId);

		res.redirect("/notifications/" + user._id);
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.render("error", { message: "Internal server error", title: "Error" });
	}
});
export default router;
