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