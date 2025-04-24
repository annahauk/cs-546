import { ObjectId } from "mongodb";
import { auth, users } from "../../config/mongoCollections";
import { authConfig } from "../../config/settings";
import { idVal, stringVal, validObjectId } from "../../helpers";
import { compare, genSalt, hash } from "bcryptjs";

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
    const _hash = await hash(passphrase, _salt);

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
    if(!update.insertedId) {
        throw new Error(`Failed to set user auth id.`);
    }

    return upsert.insertedId;
}