import * as express from "express";

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
        
    })

export default router;