import * as express from "express";

const router = express.Router();

router.route("/oauth")
    .get(async(req,res) => {
        res.status(400).json({error: `tbd`});
        return;
    })

router.route("/oauth/callback")
    .get(async (req,res) => {

    })