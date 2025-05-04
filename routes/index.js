// import somethingRoutes from 'somewhere/someroutes.js'
import * as express from "express";
import AuthRoutes from "./authroutes.js"
import cookieParser from "cookie-parser";
import { Auth } from "../src/lib/auth.js";
import HomeRoutes from "./homeroutes.js";
import ProfileRoutes from "./profileroutes.js";
import ProjectsRoutes from "./projectsroutes.js";

export function constructorMethod(app) {
    if(typeof app === "undefined") {
        throw new Error(`App is not defined!`);
    }

    app.use(express.json());
    app.use(cookieParser());
    app.use(Auth);

    app.use("/", ProjectsRoutes);
    app.use("/auth", AuthRoutes);
    app.use("/profile", ProfileRoutes);
    app.use("/projects", ProjectsRoutes);

    app.use('*', (req, res) => {
        console.log(`Authorized: ${req.authorized}`);
        return res.status(404).render('error', {message: 'Not found'});
    });
}