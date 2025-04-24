import { compare, genSalt, hash } from "bcryptjs";
import { auth, users } from "../../config/mongoCollections.js";
import { authConfig } from "../../config/settings.js";
import { get_auth_by_id } from "../../data/authdata.js";
import { stringVal, validObjectId } from "../../helpers.js";

// auth functions
/**
 * create and insert auth document into auth collection
 * returns auth id as ObjectId
 * @param {*} userid - ObjectId of the user
 * @param {*} passphrase - the user's passphrase
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
 * @param {*} authId 
 * @param {*} passphrase 
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