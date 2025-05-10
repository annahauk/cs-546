import { compare, genSalt, hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { promisify } from "util";
import { auth, users } from "../../config/mongoCollections.js";
import { authConfig } from "../../config/settings.js";
import { find_token, get_auth_by_id, get_auth_by_username, remove_token, token_expired } from "../../data/authdata.js";
import { getUserByUsername } from "../../data/users.js";
import { stringVal, validObjectId } from "../../helpers.js";
import { TokenCache } from "./token_cache.js";
import { ObjectId } from "mongodb";

const TOKEN_CACHE = new TokenCache();

// auth functions
/**
 * create and insert auth document into auth collection
 * returns auth id as ObjectId
 * @param {ObjectId} userid - ObjectId of the user
 * @param {string} passphrase - the user's passphrase
 */
export async function create_auth(userid, passphrase) {
    try {
        validObjectId(userid);
        stringVal(passphrase);
    } catch (e) {
        throw new Error(`create_auth invalid input: ${e}`);
    }

    /**
     * verify user actually exists
     */
    const usersc = await users();
    const user = await usersc.findOne({"_id": userid});
    if(!user) {
        throw new Error(`No user with id: ${userid}`);
    }

    /**
     * generate the salted hash
     */
    const _salt = await genSalt(authConfig.saltRounds);
    const _hash = await hash(passphrase + _salt, _salt);

    /**
     * insert the newly created auth document
     */
    const authc = await auth();
    const upsert = await authc.insertOne({
        "hash": _hash,
        "salt": _salt,
        "userId": userid,
        "gh_token": "",
        "tokens": [],
    })

    // make sure it worked
    if(!upsert.insertedId) {
        throw new Error(`Auth insert failed.`);
    }

    /**
     * insert auth id into user collection
     */
    let update = await usersc.updateOne({_id: userid}, {
        "$set": {"Auth": upsert.insertedId}
    })
    if(!update.acknowledged) {
        throw new Error(`Failed to set user auth id.`);
    }

    return upsert.insertedId;
}

/**
 * test if authentication is successful, returns boolean
 * @param {ObjectId} authId 
 * @param {string} passphrase 
 */
export async function try_auth(authId, passphrase) {
    try {
        validObjectId(authId);
        stringVal(passphrase);
    } catch (e) {
        throw new Error(`try_auth invalid input: ${e}`);
    }

    const authdoc = await get_auth_by_id(authId);

    // might need le salt
    return await compare(passphrase + authdoc.salt, authdoc.hash);
}

/**
 * perform full user login
 * adds token to user auth document if successful
 * returns token if successful, null if failed, throws if error
 * @param {string} username 
 * @param {string} password 
 */
export async function login(username, password) {
    stringVal(username);
    stringVal(password);

    /**
     * get user
     */
    const user = await getUserByUsername(username);
    if(!user) {
        throw new Error(`User not found.`);
    }

    if(!await try_auth(user.Auth, password)) {
        // login failed
        return null;
    }

    // login succeeded
    /**
     * generate and insert token
     */
    let token = {
        _id: new ObjectId(),
        content: await generate_token(authConfig.tokenLength),
        ctime: new Date().getTime()
    }
    const authc = await auth();
    const update = await authc.updateOne({_id: user.Auth}, {
        "$push": {"tokens": token}
    })
    if(!update.acknowledged) {
        throw new Error(`Token upsert failed.`);
    }

    // insert token to token cache
    await TOKEN_CACHE.push_token(username, token, authConfig.tokenCacheLifetime);

    // PLEASE TO HAVE RETURN TOKEN!!??!?
    return token;
}

/**
 * Generates cryptographically secure random token of length
 * @param {number} length 
 * @returns {string}
 */
export async function generate_token(length) {
    let random_bytes = promisify(randomBytes);
    try {
        let buffer = await random_bytes(length);
        let token = buffer.toString('hex');
        return token;
    } catch (e) {
        throw new Error(Errors.ERR_TOKENGEN_FAILED);
    }
}

/**
 * 
 * @param {string} username 
 * @param {string} token_content 
 * @returns {void}
 */
export async function logout(username, token_content) {
    await stringVal(username, "username", "logout");
    await stringVal(token_content, "token", "logout");

    const authd = await get_auth_by_username(username);
    if(!authd) {
        throw new Error(`Auth document not found.`);
    }

    // remove user token from cache and collecton
    let token = await TOKEN_CACHE.has_token(username, token_content);
    // if token found in cache, remove from cache
    if(token) {
        // token found in cahce
        await TOKEN_CACHE.remove_token(username, token_content);
    } else {
        // else pull from db
        token = await find_token(authd, token_content);
    }
    
    // remove token from db
    await remove_token(authd._id, token);
    return;
}

/**
 * The auth middleware
 * Checks token from user cookie against cache
 * if not in cache, fall through to database
 * if token expired in database, remove token from database, set req.authorized to false
 * else set req.authorized to true
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
export async function Auth(req, res, next) {
    const AUTH_TERM = "authorized";
    req[AUTH_TERM] = false;

    // not authorized (missing cookie)
    if(!req.cookies) {
        return next();
    }

    // pull username and token from cookie
    const USER = req.cookies["username"];
    const USER_TOKEN = req.cookies["token"];
    try {
        await stringVal(USER);
        await stringVal(USER_TOKEN);
    } catch (e) {
        return next();
    }

    // retrieve user token
    let token = await TOKEN_CACHE.has_token(USER, USER_TOKEN);
    if(!token) {
        // pull token from database
        let auth;
        try {
            auth = await get_auth_by_username(USER);
        } catch (e) {
            console.error(`Couldnt get auth by username`, e);
            return next();
        }

        token = await find_token(auth, USER_TOKEN);
        if(!token) {
            // invalid token
            return next();
        }
    }

    // make sure token not expired
    if(await token_expired(token)) {
        // drop token from auth collection and return
        console.log(`token expired!`);
        let auth = await get_auth_by_username(USER);
        await remove_token(auth._id, token);
        return next();
    }

    // token is valid
    req[AUTH_TERM] = true;
    next();
}