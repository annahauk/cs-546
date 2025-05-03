import { ObjectId } from "mongodb";
import { auth, users } from "../config/mongoCollections.js";
import { authConfig } from "../config/settings.js";
import { stringVal, validObjectId } from "../helpers.js";

/**
 * retrieve auth by ObjectId
 * @param {ObjectId} id 
 * @returns 
 */
export async function get_auth_by_id(id) {
    await validObjectId(id);
    const authc = await auth();
    const authdoc = await authc.findOne({_id: id});
    if(!authdoc) {
        throw new Error(`No auth document with id: ${id}`);
    }
    return authdoc;
}

/**
 * retrieve auth by username
 * @param {string} username 
 * @returns Auth document
 */
export async function get_auth_by_username(username) {
    await stringVal(username);
    const usersc = await users();
    const authc = await auth();

    let user = await usersc.findOne({user_name: username});
    if(!user) {
        throw new Error(`No user with username: ${username}`);
    }

    let authdoc = await authc.findOne({_id: user.Auth});
    if(!authdoc) {
        throw new Error(`No auth document with id: ${user.Auth}`);
    }

    return authdoc;
}

/**
 * Removes token from auth document, returns token upon success, throws else
 * @param {ObjectId} authId 
 * @param {Token} token 
 * @returns 
 */
export async function remove_token(authId, token) {
    await validObjectId(authId);
    const authc = await auth();
    const upsert = await authc.updateOne({_id: authId}, {$pull: {"tokens": {"_id": token._id}}});
    if(!upsert.acknowledged) {
        throw new Error(`Could not pull token from auth document: ${authId}`);
    }
    return token;
}

/**
 * 
 * @param {AuthDocument} authdoc - user auth document (WithId<AuthDocument>)
 * @param {string} token_content - string of token content
 * returns token subdocument if found, null if not
 */
export async function find_token(authdoc, token_content) {
    for(const token of authdoc.tokens) {
        if(token.content === token_content) {
            return token;
        }
    }

    return null;
}

/**
 * Test if token is past the max age.
 * returns boolean
 * @param {Token} token 
 */
export async function token_expired(token) {
    if(typeof token.ctime === "string") {
        token.ctime = parseInt(token.ctime);
    }
    return ((new Date().getTime() - token.ctime) > authConfig.tokenMaxAge);
}