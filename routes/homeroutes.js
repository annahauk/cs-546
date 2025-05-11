import { Router } from "express";
import { isLoggedOut } from "./middleware.js";
const router = Router();

router.route("/").get(isLoggedOut, (req, res) => {
	// add whatever the handlebars need
	res.render("landing", {});
});

// TEMPORARY - TO allow browser login
router.route("/login")
	.get(async(req,res) => {
		return await res.redirect("/auth/login");
	})

router.route("/register")
	.get(async(req,res) => {
		return await res.redirect("/auth/register");
	})

export default router;
