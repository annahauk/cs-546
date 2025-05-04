// import somethingRoutes from 'somewhere/someroutes.js'
import * as express from "express";
import AuthRoutes from "./authroutes.js"
import cookieParser from "cookie-parser";
import { Auth } from "../src/lib/auth.js";
import HomeRoutes from "./homeroutes.js";
import ProfileRoutes from "./profileroutes.js";
import ProjectsRoutes from "./projectsroutes.js";

/*
you will be making three routes/pages in your application:

http://localhost:3000/  this is the homepage where users can either create an account or login to their existing account
http://localhost:3000/login  this is the login page where users can enter their credentials to log in
http://localhost:3000/home when logged in, users will be brought to a homepage where they can see the main interface page
http://localhost:3000/profile  users can click on one of the buttons at the header to see their profile
http://localhost:3000/


*/



export function constructorMethod(app) {
    if(typeof app === "undefined") {
        throw new Error(`App is not defined!`);
    }

    app.use(express.json());
    app.use(cookieParser());
    app.use(Auth);

    app.get("/", (req, res) => {
        res.render("main", {});
    });

    app.use("/auth", AuthRoutes);
    app.use("/home", HomeRoutes);
    app.use("/profile", ProfileRoutes);
    app.use("/projects", ProjectsRoutes);

    app.use('*', (req, res) => {
        console.log(`Authorized: ${req.authorized}`);
        return res.status(404).render('error', {message: 'Not found'});
    });
}