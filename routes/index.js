// import somethingRoutes from 'somewhere/someroutes.js'
import { join } from "path";
import cookieParser from "cookie-parser";
import * as express from "express";
import { Auth } from "../src/lib/auth.js";
import AuthRoutes from "./authroutes.js";
import HomeRoutes from "./homeroutes.js";
import OAuthRoutes from "./oauth.js";
import ProfileRoutes from "./profileroutes.js";
import ProjectsRoutes from "./projectsroutes.js";
import NotificationRoutes from "./notifications.js";

export function constructorMethod(app) {
	if (typeof app === "undefined") {
		throw new Error(`App is not defined!`);
	}

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(cookieParser());
	app.use(Auth);

	app.use("/", HomeRoutes);
	app.use("/projects", ProjectsRoutes);
	app.use("/auth", AuthRoutes);
	app.use("/profile", ProfileRoutes);
	app.use("/oauth", OAuthRoutes);
	app.use("/public", express.static(join(process.cwd(), "public")));
	app.use("/notifications", NotificationRoutes);

	app.use((req, res) => {
		console.log(`Authorized: ${req.authorized}`);
		return res.status(404).render("error", { errorMessage: "Not found" });
	});
}
