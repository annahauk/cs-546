// import somethingRoutes from 'somewhere/someroutes.js'
import * as express from "express";
import AuthRoutes from "./authroutes.js"
import cookieParser from "cookie-parser";
import { Auth } from "../src/lib/auth.js";

export function constructorMethod(app) {
    if(typeof app === "undefined") {
        throw new Error(`App is not defined!`);
    }

    app.use(express.json());
    app.use(cookieParser());
    app.use(Auth);

    // app.use('/route', somethingRoutes)

    // auth routes
    app.use("/auth", AuthRoutes);

    app.use('*', (req, res) => {
        return res.status(404).json({error: 'Not found'});
    });
}