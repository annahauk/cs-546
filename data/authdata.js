import { auth } from "../config/mongoCollections.js";
import { validObjectId } from "../helpers.js";

export async function get_auth_by_id(id) {
    validObjectId(id);
    const authc = await auth();
    const authdoc = authc.findOne({_id: id});
    if(!authdoc) {
        throw new Error(`No auth document with id: ${id}`);
    }
    return authdoc;
}

/**
 * 
 * @param {*} authdoc - user auth document (WithId<AuthDocument>)
 * @param {*} token - string of token content
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