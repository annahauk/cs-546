import * as express from "express";
import { ghConfig } from "../config/settings.js";

const router = express.Router();

/**
 * Github oauth callback rotue
 * ==> https://outsite.com/auth/callback?code=AUTHORIZATION_CODE
 */
router.route("/callback")
    .get(async (req,res) => {
        const code = req.query.code;
        const error = req.query.error;

        if(error) {
            // handle oauth login error / user rejection
            return await res.status(500).json({error: error});
        }

        // handle not existnat code (should not happen if no reported error)
        // case if url accessed directly
        // redirect to home?
        if(!code) {
            return await res.status(500).json({error: "No auth code"});
        }

        // login with auth code
        
    })

/**
 * redirects user to gh auth login
 * ==> https://github.com/login/oauth/authorize?client_id={CLIENT ID}&scope={PERMISSIONS}
 * returns to callback route
 */
router.route("/login")
    .get(async(req,res) => {
        if(!req.authorized) {
            // redirect to standard login
            return await res.redirect("/login");
        }

        let client_id = process.env["GH_CLIENT_ID"];
        if(!client_id) {
            return await res.status(500).json({error: `Github credentials not defined.`});
        }

        // redirect user to git oauth route
        await res.status(200).redirect(`https://github.com/login/oauth/authorize?client_id=${client_id}&scope=${ghConfig.permissions.join(',')}`);
    })

export default router;