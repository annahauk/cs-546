import axios from "axios";
import { users } from "../config/mongoCollections";
import { idVal } from "../helpers";

/**
 * @param {ObjectId} userid
 * @param {string} access_token 
 * @returns {(null|string)}
 */
export async function github_oauth_login(userid, access_token) {
    const gh_client_id = process.env["GH_CLIENT_ID"];
    const gh_client_secret = process.env["GH_CLIENT_SECRET"];
    let access_token;

    // validate
    idVal(userid);

    if(!gh_client_id || !gh_client_secret) {
        throw new Error("Github credentials not defined.");
    }

    try {
        const res = await axios.post(
            "https://github.com/login/oauth/access_token",
            {
                client_id: gh_client_id,
                client_secret: gh_client_secret,
                code: access_token
            },
            { headers: {Accept: 'application/json'}}
        );

        access_token = res.data["access_token"];
    } catch (e) {
        throw new Error(`Error during oauth login`);
    }

    if(!access_token) {
        return null;
    }

    // add token to user
    let usersc = await users();
    let user = await usersc.findOne({_id: userid});
}