import axios from "axios";
import { ObjectId } from "mongodb";
import { auth, users } from "../config/mongoCollections.js";
import { validObjectId } from "../helpers.js";
import { get_auth_by_id, get_auth_by_username } from "./authdata.js";
import { getUserById_ObjectId, getUserByUsername } from "./users.js";

/**
 * given github authorization code (from oauth callback), log in and retrieve access token. Store in database.
 * @param {ObjectId} userid
 * @param {string} code 
 * @returns {(null|string)} access_token
 */
export async function github_oauth_login(userid, code) {
    const gh_client_id = process.env["GH_CLIENT_ID"];
    const gh_client_secret = process.env["GH_CLIENT_SECRET"];
    let access_token;

    // validate
    await validObjectId(userid);

    if(!gh_client_id || !gh_client_secret) {
        throw new Error("Github credentials not defined.");
    }

    try {
        const res = await axios.post(
            "https://github.com/login/oauth/access_token",
            {
                client_id: gh_client_id,
                client_secret: gh_client_secret,
                code: code
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
    if(!user) {
        throw new Error(`No user found`);
    }

    let authc = await auth();
    let authdoc = await authc.findOne({_id: user.Auth});
    if(!authdoc) {
        throw new Error(`Auth not found.`);
    }

    let upsert = await authc.updateOne({_id: authdoc._id}, {$set: {"gh_token": access_token}});
    if(!upsert.acknowledged) {
        throw new Error(`Error inserting access token.`);
    }

    return access_token;
}

/**
 * Delete gh_token from user auth document
 * @param {string} username 
 * @returns {string} gh_token
 */
export async function destroy_gh_token(username) {
    let authc = await auth();
    let authd = await get_auth_by_username(username);
    if(!authd) {
        throw new Error("No user auth");
    }
    let res = await authc.updateOne({_id: authd._id}, {$set: {"gh_token": ""}});
    if(!res.acknowledged) {
        throw new Error(`Failed to clear user github token`);
    }

    return auth.gh_token;
}

/**
 * Get user gh_token by user id
 * @param {ObjectId} userid 
 * @returns {(string|null)} gh_token
 */
export async function get_user_gh_token(userid) {
    await validObjectId(userid);

    let user = await getUserById_ObjectId(userid);
    if(!user) {
        throw new Error(`User not found.`);
    }

    let auth = await get_auth_by_id(user.Auth);
    if(!auth) {
        throw new Error(`Auth not found`);
    }

    let gh_token = auth.gh_token;

    if(gh_token.length < 1) {
        return null;
    } else {
        return gh_token;
    }
}