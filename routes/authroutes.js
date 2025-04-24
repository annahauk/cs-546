import * as express from "express";
import { stringVal } from "../helpers.js";
import { login } from "../src/lib/auth.js";

const router = express.Router();

/**
 * login routes
 * requires username and passphrase in request body
 * utilizes bcrypt from auth library
 * auth collection
 * returns token if login successful
 */
router.route("/login")
    .post(async (req,res) => {
        let token = "";
        if(typeof req.body !== "object") {
            return await res.status(400).json({"error": `Request body required.`});
        }

        // validate username and password
        let username = req.body["username"];
        let password = req.body["password"];
        try {
            stringVal(username);
            stringVal(password);
        } catch (e) {
            return await res.status(400).json({error: `Invalid username or password.`});
        }

        // attempt login
        try {
            token = await login(username, password);
        } catch (e) {
            return await res.status(500).json({error: `Error occured while logging in.`});
        }

        // if token undefined, login was failed
        if(!token) {
            return await res.status(401).json({error: `Incorrect username or password.`});
        }

        // success, return token
        // TODO: Enforce secure once on https
        res.cookie('token', token, {
            httpOnly: true,     // prevents JavaScript access
            //secure: true,       // send only over HTTPS
            sameSite: 'lax',    // CSRF protection
            maxAge: 86400000*28    // 1 month
        });
        res.cookie('username', username, {
            httpOnly: true,     // prevents JavaScript access
            //secure: true,       // send only over HTTPS
            sameSite: 'lax',    // CSRF protection
            maxAge: 86400000*28    // 1 month
        });
        res.status(200).json({message: "Logged in."});
    })

export default router;